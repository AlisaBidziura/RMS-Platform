import { Activity, Bot, Boxes, Clock3, FileText, Plus, Zap, BatteryCharging } from 'lucide-react'
import { demoEvents as events } from '../../../entities/event/index.js'
import { Badge, PageHeading, SectionHeader, StatCard } from '../../../shared/ui/index.js'
import { statusNames, statusClass } from '../../../entities/robot/index.js'
import { taskClass } from '../../../entities/task/index.js'

export function Dashboard({
  robots,
  tasks,
  notify,
  navigate
}) {
  const active = tasks.filter(t => t.status === 'В работе').length;
  return <>
      <PageHeading eyebrow="ПОНЕДЕЛЬНИК, 19 ОКТЯБРЯ" title="Обзор системы" description="Сводка по роботам, задачам и состоянию инфраструктуры." action={<button className="secondary-button" onClick={() => notify('Отчёт подготовлен в демонстрационном режиме')}><FileText size={17} /> Экспорт отчёта</button>} />
      <div className="stats-grid">
        <StatCard label="Всего роботов" value={robots.length} change="+2 за месяц" icon={Bot} tone="blue" foot="в системе" />
        <StatCard label="Активные задачи" value={active} change="В работе" icon={Activity} tone="violet" foot={`${tasks.filter(t => t.status === 'Ожидает').length} ожидают запуска`} />
        <StatCard label="Средний заряд" value={`${Math.round(robots.reduce((a, r) => a + r.battery, 0) / robots.length)}%`} change="Норма" icon={BatteryCharging} tone="green" foot="по всем роботам" />
        <StatCard label="Требуют внимания" value={robots.filter(r => r.status === 'warning').length} change="Проверить" icon={Zap} tone="red" foot="роботы и оборудование" />
      </div>
      <div className="dashboard-grid">
        <div className="panel fleet-panel">
          <SectionHeader title="Состояние парка" link="Все роботы" onClick={() => navigate('/robots')} />
          <div className="fleet-summary">
            <div className="fleet-ring">
              <div>
                <strong>{robots.length}</strong>
                <small>роботов</small>
              </div>
            </div>
            <div className="fleet-legend">
              <div>
                <i className="legend-dot green-bg" />
                <span>Свободны</span>
                <b>{robots.filter(r => r.status === 'available').length}</b>
              </div>
              <div>
                <i className="legend-dot blue-bg" />
                <span>В работе</span>
                <b>{robots.filter(r => r.status === 'working').length}</b>
              </div>
              <div>
                <i className="legend-dot amber-bg" />
                <span>Заряжаются</span>
                <b>{robots.filter(r => r.status === 'charging').length}</b>
              </div>
              <div>
                <i className="legend-dot red-bg" />
                <span>Внимание</span>
                <b>{robots.filter(r => r.status === 'warning').length}</b>
              </div>
            </div>
          </div>
          <div className="panel-divider" />
          <div className="mini-robot-list">{robots.slice(0, 3).map(r => <div className="mini-robot" key={r.id}>
              <div className="robot-avatar">
                <Bot size={18} />
              </div>
              <div className="mini-robot-name">
                <b>{r.name}</b>
                <small>{r.id} · {r.type}</small>
              </div>
              <div className="battery-mini">
                <div>
                  <span style={{
                  width: `${r.battery}%`
                }} className={r.battery < 25 ? 'low' : ''} />
                </div>
                <small>{r.battery}%</small>
              </div>
              <Badge tone={statusClass[r.status]} dot>{statusNames[r.status]}</Badge>
            </div>)}</div>
        </div>
        <div className="panel tasks-panel">
          <SectionHeader title="Активные задачи" link="Все задачи" onClick={() => navigate('/tasks')} />
          <div className="task-list">{tasks.slice(0, 4).map(t => <div className="task-row" key={t.id}>
              <div className={`task-type-icon ${t.kind === 'Доставка' ? 'violet' : 'green'}`}>{t.kind === 'Доставка' ? <Boxes size={18} /> : <Activity size={18} />}</div>
              <div className="task-row-info">
                <b>{t.title}</b>
                <small>{t.id} · {t.zone}</small>
                <div className="task-meta">
                  <span>
                    <Bot size={13} />
                    {t.robotId}
                  </span>
                  <span>
                    <Clock3 size={13} />
                    {t.time}
                  </span>
                </div>
              </div>
              <Badge tone={taskClass[t.status] || 'gray'} dot>{t.status}</Badge>
            </div>)}</div>
          <button className="secondary-button full-width" onClick={() => navigate('/tasks')}><Plus size={16} /> Создать задачу</button>
        </div>
      </div>
      <div className="panel events-panel">
        <SectionHeader title="Последние события" link="Журнал действий" onClick={() => navigate('/audit')} />
        <div className="events-list">{events.map((e, i) => <div className="event-row" key={i}>
            <div className={`event-mark ${e.tone}`}>
              <Activity size={15} />
            </div>
            <div className="event-text">
              <b>{e.title}</b>
              <small>{e.detail}</small>
            </div>
            <time>{e.time}</time>
          </div>)}</div>
      </div>
    </>;
}
