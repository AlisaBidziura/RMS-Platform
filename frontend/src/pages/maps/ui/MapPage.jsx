import { useEffect, useRef, useState } from 'react'
import { Bot, Play, Pause, Search, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, MapPin, MapPinOff, ArrowUpRight, X, Battery, Layers } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge, PageHeading } from '../../../shared/ui/index.js'
import { statusClass, statusNames } from '../../../entities/robot/index.js'
import { demoMapSource, getMapMarker } from '../../../entities/map/index.js'
import { FloorMap } from '../../../widgets/floor-map/index.js'
import { useMapData } from '../model/useMapData.js'
import { filterMapRobots } from '../model/mapRobotFilter.js'

// Пока RMS не предоставляет карты, источник выбран явно. При ошибке API демоданные не подставляются.
const mapSource = demoMapSource

function RobotPanel({ robots, visibleRobots, map, positions, selected, onSelect, query, setQuery, statusFilter, setStatusFilter, isDemo }) {
  const selectedPosition = selected && getMapMarker(map, positions.get(selected.id))
  const battery = Number.isFinite(selected?.battery) ? Math.max(0, Math.min(100, selected.battery)) : null
  return (
    <aside className="panel map-side" id="map-robot-panel" aria-label="Роботы этажа">
      <div className="map-side-heading"><h2>Роботы этажа</h2><span className="map-count">{robots.length}</span></div>
      <div className="map-side-filters">
        <div className="map-search">
          <Search size={16} aria-hidden="true" />
          <input aria-label="Поиск роботов в списке" placeholder="Имя или ID робота" value={query} onChange={event => setQuery(event.target.value)} />
          {query && <button type="button" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={15} /></button>}
        </div>
        <select aria-label="Фильтр списка по статусу" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="all">Все статусы</option>
          {Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <small>В списке {visibleRobots.length} из {robots.length} · фильтры не скрывают маркеры</small>
      </div>
      <div className="map-object-list">
        {visibleRobots.length === 0 && <p className="map-list-empty">{robots.length === 0 ? 'На этаже нет роботов.' : 'По заданным фильтрам ничего не найдено.'}</p>}
        {visibleRobots.map(robot => {
          const positioned = Boolean(getMapMarker(map, positions.get(robot.id)))
          return (
            <button key={robot.id} type="button" className={`map-object ${selected?.id === robot.id ? 'active' : ''}`} aria-pressed={selected?.id === robot.id} onClick={() => onSelect(robot.id)}>
              <div className="map-robot-avatar"><Bot size={19} /></div>
              <div className="map-object-main"><b>{robot.name}</b><small>{robot.id} · {Number.isFinite(robot.battery) ? `${robot.battery}%` : 'Заряд неизвестен'}</small><Badge tone={statusClass[robot.status] || 'gray'} dot>{statusNames[robot.status] || 'Неизвестно'}</Badge></div>
              <span className={`map-position-icon${positioned ? ' positioned' : ''}`} title={positioned ? 'Позиция доступна' : 'Позиция недоступна'}>{positioned ? <MapPin size={16} /> : <MapPinOff size={16} />}<span className="map-sr-only">{positioned ? 'Позиция доступна' : 'Позиция недоступна'}</span></span>
            </button>
          )
        })}
      </div>
      <div className="selected-object">
        <span className="eyebrow">ВЫБРАННЫЙ РОБОТ</span>
        {selected ? <>
          <div className="map-selected-heading"><h3>{selected.name}</h3><Badge tone={statusClass[selected.status] || 'gray'} dot>{statusNames[selected.status] || 'Неизвестно'}</Badge></div>
          <p>{selected.id} · этаж {map.floor}</p>
          <div className="map-battery-label"><span><Battery size={16} /> Заряд</span><strong>{battery === null ? 'Нет данных' : `${battery}%`}</strong></div>
          {battery !== null && <div className="map-battery-track" role="progressbar" aria-label="Заряд робота" aria-valuemin={0} aria-valuemax={100} aria-valuenow={battery}><div className={battery < 20 ? 'low' : ''} style={{ width: `${battery}%` }} /></div>}
          <div className="map-position-note">{selectedPosition ? <MapPin size={17} /> : <MapPinOff size={17} />}<span>{!selectedPosition ? 'Позиция недоступна' : selected.status === 'offline' ? (isDemo ? 'Последняя демонстрационная позиция. Робот не в сети.' : 'Последняя известная позиция. Робот не в сети.') : isDemo ? 'Демонстрационная позиция' : 'Позиция доступна'}</span></div>
          <NavLink className="secondary-button full-width" to={`/robots/${selected.id}`}>Карточка робота <ArrowUpRight size={15} /></NavLink>
        </> : <p className="map-selection-empty">Выберите робота на плане или в списке, чтобы посмотреть его состояние.</p>}
      </div>
    </aside>
  )
}

export function MapPage({ robots, floor, setFloor }) {
  const [motionEnabled, setMotionEnabled] = useState(false)
  const { status, maps, positions, error, positionStatus, retry } = useMapData(mapSource, robots, motionEnabled)
  const [selection, setSelection] = useState(null)
  const [selectedMapId, setSelectedMapId] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sideVisible, setSideVisible] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState('')
  const workspaceRef = useRef(null)
  const map = maps.find(item => item.uid === selectedMapId && String(item.floor) === String(floor)) || maps.find(item => String(item.floor) === String(floor)) || maps[0]
  const isDemo = mapSource.mode === 'demo'
  const onFloor = map ? robots.filter(robot => String(robot.floor) === String(map.floor)) : []
  const mapPositions = new Map(positions.filter(position => position?.mapId === map?.uid).map(position => [position.robotId, position]))
  const selected = selection && selection.mapId === map?.uid ? onFloor.find(robot => robot.id === selection.robotId) : null
  const missingPositions = onFloor.filter(robot => !getMapMarker(map, mapPositions.get(robot.id))).length
  const visibleRobots = filterMapRobots(onFloor, query, statusFilter)

  useEffect(() => {
    function syncFullscreen() { setFullscreen(Boolean(workspaceRef.current && document.fullscreenElement === workspaceRef.current)) }
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  async function toggleFullscreen() {
    setFullscreenError('')
    try {
      if (document.fullscreenElement === workspaceRef.current && document.fullscreenElement) await document.exitFullscreen()
      else if (workspaceRef.current?.requestFullscreen) await workspaceRef.current.requestFullscreen()
      else setFullscreenError('Браузер не поддерживает полноэкранный режим.')
    } catch {
      setFullscreenError('Не удалось переключить полноэкранный режим.')
    }
  }

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
      <PageHeading eyebrow="ПРОСТРАНСТВЕННЫЙ МОНИТОРИНГ" title="Карта этажей" description="Просмотр планов помещений и состояния роботов." />
      {status === 'loading' && <div className="panel map-page-message" role="status">Загрузка карт…</div>}
      {status === 'error' && <div className="panel map-page-message" role="alert"><p>{error}</p><button className="secondary-button" onClick={retry}>Повторить</button></div>}
      {status === 'ready' && !map && <div className="panel map-page-message">Нет доступных карт.</div>}
      {status === 'ready' && map && (
        <div ref={workspaceRef} className={`map-layout map-workspace${sideVisible ? '' : ' map-side-hidden'}`}>
          <section className="panel map-panel" aria-label="План этажа">
            <div className="map-toolbar">
              <div className="map-toolbar-title"><div className="map-title-icon"><Layers size={20} /></div><div><b>План помещения · {map.name}</b><small>{isDemo ? 'Демо-карта · позиции не получены от роботов' : 'Карта помещения'}</small></div></div>
              <div className="map-toolbar-actions">
                {isDemo && <button className="map-motion-button" type="button" aria-pressed={motionEnabled} disabled={positionStatus === 'loading'} onClick={() => setMotionEnabled(value => !value)}>{motionEnabled ? <Pause size={15} /> : <Play size={15} />}{motionEnabled ? 'Остановить тест' : 'Тест движения'}</button>}
                <button className="map-icon-button" type="button" title={sideVisible ? 'Скрыть панель роботов' : 'Показать панель роботов'} aria-label={sideVisible ? 'Скрыть панель роботов' : 'Показать панель роботов'} aria-expanded={sideVisible} aria-controls={sideVisible ? 'map-robot-panel' : undefined} onClick={() => setSideVisible(value => !value)}>{sideVisible ? <PanelRightClose size={19} /> : <PanelRightOpen size={19} />}</button>
                <button className="map-icon-button" type="button" title={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'} aria-label={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'} aria-pressed={fullscreen} onClick={toggleFullscreen}>{fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</button>
              </div>
            </div>
            <div className="map-subtoolbar">
              <div className="floor-switch" role="group" aria-label="Выбор этажа">{maps.map(item => <button key={item.uid} type="button" className={map.uid === item.uid ? 'selected' : ''} aria-pressed={map.uid === item.uid} onClick={() => selectMap(item)}>{item.name}</button>)}</div>
              <div className="map-summary"><span>Роботов <strong>{onFloor.length}</strong></span><span>На карте <strong>{onFloor.length - missingPositions}</strong></span>{missingPositions > 0 && <span>Без позиции <strong>{missingPositions}</strong></span>}</div>
            </div>
            {positionStatus === 'loading' && <p className="map-telemetry-message" role="status">Загрузка координат роботов…</p>}
            {positionStatus === 'error' && <div className="map-telemetry-message is-error" role="alert"><span>Обновление координат недоступно. На карте могут оставаться последние полученные позиции.</span><button type="button" className="secondary-button" onClick={retry}>Повторить</button></div>}
            {fullscreenError && <p className="map-fullscreen-error" role="alert">{fullscreenError}</p>}
            <FloorMap key={`${map.uid}:${map.imageUrl}`} map={map} robots={onFloor} positions={mapPositions} selectedId={selected?.id} onSelect={selectRobot} isDemo={isDemo} />
            <div className="map-legend">
              <span><i className="map-status-dot working" /> В работе</span><span><i className="map-status-dot available" /> Свободен</span><span><i className="map-status-dot charging" /> Зарядка</span><span><i className="map-status-dot warning" /> Внимание</span><span><i className="map-status-dot offline" /> Не в сети</span>
              {isDemo && <span className="map-demo-note"><Badge tone="amber" dot>Демо</Badge>{motionEnabled ? 'Тест движения, не связан с задачами' : 'Тестовые координаты'}</span>}
            </div>
          </section>
          {sideVisible && <RobotPanel robots={onFloor} visibleRobots={visibleRobots} map={map} positions={mapPositions} selected={selected} onSelect={selectRobot} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} isDemo={isDemo} />}
        </div>
      )}
    </>
  )
}
