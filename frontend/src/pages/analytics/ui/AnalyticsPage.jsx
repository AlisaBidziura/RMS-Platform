import { Bot, ChartNoAxesCombined, CheckCircle2, ClipboardList, FileText, Radio } from 'lucide-react'
import { Badge, PageHeading, SectionHeader, StatCard } from '../../../shared/ui/index.js'
import { statusNames, statusClass } from '../../../entities/robot/index.js'

export function AnalyticsPage({
  robots,
  tasks
}) {
  const done = tasks.filter(t => t.status === 'Завершена').length;
  const chart = [['08:00', 4], ['09:00', 7], ['10:00', 5], ['11:00', 9], ['12:00', 6], ['13:00', 8], ['14:00', 10]];
  return <>
      <PageHeading eyebrow="ОТЧЁТНОСТЬ" title="Аналитика" description="Сводные показатели использования парка и выполнения задач." action={<button className="secondary-button" onClick={() => window.print()}><FileText size={16} /> Печать отчёта</button>} />
      <div className="stats-grid">
        <StatCard label="Всего задач" value={tasks.length} icon={ClipboardList} tone="blue" foot="за выбранный период" />
        <StatCard label="Завершено" value={done} icon={CheckCircle2} tone="green" foot="успешно выполнено" />
        <StatCard label="Выполнение" value={`${tasks.length ? Math.round(done / tasks.length * 100) : 0}%`} icon={ChartNoAxesCombined} tone="violet" foot="от общего числа задач" />
        <StatCard label="Парк онлайн" value={`${robots.length}/${robots.length}`} icon={Radio} tone="green" foot="демонстрационные устройства" />
      </div>
      <div className="analytics-grid">
        <div className="panel">
          <SectionHeader title="Активность по часам" />
          <div className="bar-chart">{chart.map(([time, val]) => <div className="bar-column" key={time}>
              <span>{val}</span>
              <div>
                <i style={{
                height: `${val * 8}%`
              }} />
              </div>
              <small>{time}</small>
            </div>)}</div>
          <div className="chart-caption">Количество выполненных задач · пример данных</div>
        </div>
        <div className="panel">
          <SectionHeader title="Распределение задач" />
          {[['Завершена', tasks.filter(t => t.status === 'Завершена').length, 'green'], ['В работе', tasks.filter(t => t.status === 'В работе').length, 'blue'], ['Ожидает', tasks.filter(t => t.status === 'Ожидает').length, 'amber'], ['Требует внимания', tasks.filter(t => t.status === 'Требует внимания').length, 'red']].map(([name, n, tone]) => <div className="analytics-status" key={name}>
            <div>
              <span>
                <i className={`legend-dot ${tone}-bg`} />
                {name}
              </span>
              <b>{n}</b>
            </div>
            <div className="progress">
              <span className={tone} style={{
              width: `${tasks.length ? n / tasks.length * 100 : 0}%`
            }} />
            </div>
          </div>)}
        </div>
      </div>
      <div className="panel">
        <SectionHeader title="Загрузка роботов" />
        <div className="load-table">{robots.map(r => <div className="load-row" key={r.id}>
            <div className="robot-avatar">
              <Bot size={17} />
            </div>
            <div className="load-name">
              <b>{r.name}</b>
              <small>{r.id}</small>
            </div>
            <div className="load-bar">
              <div className="progress">
                <span style={{
                width: `${r.battery}%`
              }} />
              </div>
            </div>
            <b>{r.battery}%</b>
            <Badge tone={statusClass[r.status]}>{statusNames[r.status]}</Badge>
          </div>)}</div>
      </div>
    </>;
}
