import { useState } from 'react'
import { Bot, DoorOpen, Zap } from 'lucide-react'
import { Badge, PageHeading, SectionHeader } from '../../../shared/ui/index.js'
import { statusClass } from '../../../entities/robot/index.js'

export function MapPage({
  robots,
  floor,
  setFloor,
  notify
}) {
  const [selected, setSelected] = useState('');
  const onFloor = robots.filter(r => String(r.floor) === floor);
  return <>
      <PageHeading eyebrow="ПРОСТРАНСТВЕННЫЙ МОНИТОРИНГ" title="Карта этажей" description="Положение роботов, зоны работы и инфраструктура предприятия." action={<div className="floor-switch">{['1', '2', '3'].map(f => <button className={floor === f ? 'selected' : ''} key={f} onClick={() => {
        setFloor(f);
        setSelected('');
      }}>Этаж {f}</button>)}</div>} />
      <div className="map-layout">
        <div className="panel map-panel">
          <div className="map-toolbar">
            <div>
              <b>План здания · Этаж {floor}</b>
              <small>Демонстрационная схема помещений</small>
            </div>
            <Badge tone="green" dot>Схема загружена</Badge>
          </div>
          <div className="floor-map">
            <div className="map-grid-lines" />
            <div className="room room-a">
              <span>Холл</span>
            </div>
            <div className="room room-b">
              <span>Коридор A</span>
            </div>
            <div className="room room-c">
              <span>Склад</span>
            </div>
            <div className="room room-d">
              <span>Кабинеты</span>
            </div>
            <div className="room room-e">
              <span>Лифт</span>
              <DoorOpen size={18} />
            </div>
            <div className="route-line route-one" />
            <div className="route-line route-two" />
            {onFloor.map((r, i) => <button key={r.id} className={`map-robot map-robot-${i % 4} ${selected === r.id ? 'chosen' : ''}`} onClick={() => setSelected(r.id)} title={r.name}>
              <Bot size={20} />
              <span>{r.id}</span>
            </button>)}
            <button className="map-charger" onClick={() => {
            setSelected('Зарядная станция A-01');
            notify('Выбрана зарядная станция A-01');
          }}>
              <Zap size={17} />
              <span>A-01</span>
            </button>
            <div className="map-compass">N ↑</div>
          </div>
          <div className="map-legend">
            <span><i className="legend-dot blue-bg" /> Роботы</span>
            <span><i className="legend-line" /> Активный маршрут</span>
            <span><i className="legend-dot green-bg" /> Зарядная станция</span>
            <span><DoorOpen size={14} /> Двери / лифты</span>
          </div>
        </div>
        <div className="panel map-side">
          <SectionHeader title="Объекты этажа" />
          <div className="map-object-list">
            {onFloor.map(r => <button className={`map-object ${selected === r.id ? 'active' : ''}`} key={r.id} onClick={() => setSelected(r.id)}>
              <div className="robot-avatar">
                <Bot size={17} />
              </div>
              <div>
                <b>{r.name}</b>
                <small>{r.id} · заряд {r.battery}%</small>
              </div>
              <Badge tone={statusClass[r.status]}>{r.status === 'working' ? 'В работе' : r.status === 'available' ? 'Свободен' : r.status === 'charging' ? 'Зарядка' : 'Внимание'}</Badge>
            </button>)}
            <button className={`map-object ${selected === 'Зарядная станция A-01' ? 'active' : ''}`} onClick={() => setSelected('Зарядная станция A-01')}>
              <div className="robot-avatar green">
                <Zap size={17} />
              </div>
              <div>
                <b>Зарядная станция A-01</b>
                <small>Электропитание · Онлайн</small>
              </div>
            </button>
          </div>
          <div className="selected-object">
            <span className="eyebrow">ВЫБРАННЫЙ ОБЪЕКТ</span>
            <h3>{selected || 'Ничего не выбрано'}</h3>
            <p>{selected ? robots.find(r => r.id === selected) ? `Этаж ${floor}. Нажмите на карточку робота, чтобы выбрать его на плане.` : 'Инфраструктурный объект. Управление представлено в демо-режиме.' : 'Выберите робота или инфраструктуру на плане.'}</p>
            {selected && <button className="secondary-button full-width" onClick={() => notify(`Открыты данные: ${selected}`)}>Подробнее об объекте</button>}
          </div>
        </div>
      </div>
    </>;
}
