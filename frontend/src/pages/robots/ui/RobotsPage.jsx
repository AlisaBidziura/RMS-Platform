import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { EmptyState, PageHeading } from '../../../shared/ui/index.js'
import { statusNames } from '../../../entities/robot/index.js'
import { RobotCard } from './RobotCard.jsx'

export function RobotsPage({
  robots,
  query,
  setQuery,
  notify
}) {
  const [filter, setFilter] = useState('Все');
  const filtered = robots.filter(r => `${r.name} ${r.id} ${r.type}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'Все' || statusNames[r.status] === filter));
  return <>
      <PageHeading eyebrow="УПРАВЛЕНИЕ ПАРКОМ" title="Роботы" description="Список подключённых устройств и их текущее состояние." action={<button className="primary-button" onClick={() => notify('Добавление реального робота появится в следующей версии')}><Plus size={17} /> Добавить робота</button>} />
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени, ID или типу..." />
        </div>
        <div className="filter-pills">{['Все', 'Свободен', 'Выполняет задачу', 'Заряжается', 'Требует внимания'].map(s => <button key={s} className={filter === s ? 'selected' : ''} onClick={() => setFilter(s)}>{s}</button>)}</div>
        <span className="result-count">{filtered.length} устройств</span>
      </div>
      <div className="robot-grid">{filtered.map(r => <RobotCard key={r.id} robot={r} />)}</div>
      {filtered.length === 0 && <EmptyState title="Роботы не найдены" text="Измените поисковый запрос или фильтр." />}
    </>;
}
