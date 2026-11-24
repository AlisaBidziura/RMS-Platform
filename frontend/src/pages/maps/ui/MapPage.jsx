import { useState } from 'react'
import { Bot, Play, Pause } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge, PageHeading, SectionHeader } from '../../../shared/ui/index.js'
import { statusClass, statusNames } from '../../../entities/robot/index.js'
import { demoMapSource, getMapMarker } from '../../../entities/map/index.js'
import { FloorMap } from '../../../widgets/floor-map/index.js'
import { useMapData } from '../model/useMapData.js'

// Пока RMS не предоставляет карты, источник выбран явно. При ошибке API демоданные не подставляются.
const mapSource = demoMapSource

export function MapPage({ robots, floor, setFloor }) {
  const [motionEnabled, setMotionEnabled] = useState(false)
  const { status, maps, positions, error, retry } = useMapData(mapSource, robots, motionEnabled)
  const [selection, setSelection] = useState(null)
  const [selectedMapId, setSelectedMapId] = useState(null)
  const map = maps.find(item => item.uid === selectedMapId && String(item.floor) === String(floor)) ||
    maps.find(item => String(item.floor) === String(floor)) || maps[0]
  const isDemo = mapSource.mode === 'demo'
  const onFloor = map ? robots.filter(robot => String(robot.floor) === String(map.floor)) : []
  const mapPositions = new Map(positions.filter(position => position?.mapId === map?.uid).map(position => [position.robotId, position]))
  const selected = selection && selection.mapId === map?.uid ? onFloor.find(robot => robot.id === selection.robotId) : null
  const missingPositions = onFloor.filter(robot => !getMapMarker(map, mapPositions.get(robot.id))).length

  function selectMap(nextMap) {
    setFloor(String(nextMap.floor))
    setSelectedMapId(nextMap.uid)
    setSelection(null)
  }

  function selectRobot(robotId) {
    setSelection({ mapId: map.uid, robotId })
  }

  return (
    <>
      <PageHeading eyebrow="ПРОСТРАНСТВЕННЫЙ МОНИТОРИНГ" title="Карта этажей"
        description="Просмотр планов помещений и состояния роботов."
        action={maps.length > 0 && (
          <div className="floor-switch">
            {maps.map(item => (
              <button key={item.uid} className={map?.uid === item.uid ? 'selected' : ''}
                aria-pressed={map?.uid === item.uid} onClick={() => selectMap(item)}>
                {item.name}
              </button>
            ))}
          </div>
        )} />
      {status === 'loading' && <div className="panel map-page-message" role="status">Загрузка карт…</div>}
      {status === 'error' && (
        <div className="panel map-page-message" role="alert">
          <p>{error}</p>
          <button className="secondary-button" onClick={retry}>Повторить</button>
        </div>
      )}
      {status === 'ready' && !map && <div className="panel map-page-message">Нет доступных карт.</div>}
      {status === 'ready' && map && (
        <div className="map-layout">
          <div className="panel map-panel">
            <div className="map-toolbar">
              <div>
                <b>{map.name}</b>
                <small>{isDemo ? 'Тестовый план · координаты не получены от роботов' : 'План помещения'}</small>
              </div>
              {isDemo && <div className="map-toolbar-actions">
                <Badge tone="amber" dot>Демо-карта</Badge>
                <button className="map-motion-button" type="button" aria-pressed={motionEnabled} onClick={() => setMotionEnabled(value => !value)}>
                  {motionEnabled ? <Pause size={14} /> : <Play size={14} />}
                  {motionEnabled ? 'Остановить тест' : 'Тест движения'}
                </button>
              </div>}
            </div>
            <FloorMap key={`${map.uid}:${map.imageUrl}`} map={map} robots={onFloor} positions={mapPositions}
              selectedId={selected?.id} onSelect={selectRobot} isDemo={isDemo} />
            <div className="map-legend">
              <span><i className="legend-dot blue-bg" /> {isDemo ? 'Демонстрационные позиции' : 'Позиции роботов'}</span>
              {isDemo && <span>{motionEnabled ? 'Тест движения · не связан с задачами' : 'Координаты с сервера недоступны'}</span>}
              {missingPositions > 0 && <span>Без позиции: {missingPositions}</span>}
            </div>
          </div>
          <div className="panel map-side">
            <SectionHeader title="Роботы этажа" />
            <div className="map-object-list">
              {onFloor.length === 0 && <p>На этаже нет роботов.</p>}
              {onFloor.map(robot => (
                <button key={robot.id} className={`map-object ${selected?.id === robot.id ? 'active' : ''}`}
                  aria-pressed={selected?.id === robot.id} onClick={() => selectRobot(robot.id)}>
                  <div className="robot-avatar"><Bot size={17} /></div>
                  <div>
                    <b>{robot.name}</b>
                    <small>{robot.id} · заряд {robot.battery}%</small>
                    {!getMapMarker(map, mapPositions.get(robot.id)) && <small>Позиция недоступна</small>}
                  </div>
                  <Badge tone={statusClass[robot.status] || 'gray'}>{statusNames[robot.status] || 'Неизвестно'}</Badge>
                </button>
              ))}
            </div>
            <div className="selected-object">
              <span className="eyebrow">ВЫБРАННЫЙ РОБОТ</span>
              <h3>{selected?.name || 'Ничего не выбрано'}</h3>
              <p>{selected ? `${selected.id} · этаж ${map.floor}. ${getMapMarker(map, mapPositions.get(selected.id)) ? (selected.status === 'offline' ? (isDemo ? 'Последняя демонстрационная позиция. Робот не в сети.' : 'Последняя известная позиция. Робот не в сети.') : isDemo ? 'Позиция демонстрационная.' : 'Позиция доступна.') : 'Позиция недоступна.'}` : 'Выберите робота на плане или в списке.'}</p>
              {selected && <NavLink className="secondary-button full-width" to={`/robots/${selected.id}`}>Карточка робота</NavLink>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
