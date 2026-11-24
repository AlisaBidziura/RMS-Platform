import { Clock3, Map, Plus, Route as RouteIcon, ArrowUpRight } from 'lucide-react'
import { Badge, PageHeading } from '../../../shared/ui/index.js'

export function RoutesPage({
  notify
}) {
  const routes = [['RT-01', 'Ежедневная уборка коридора', 'Мойщик пола', 'Этаж 1 · 6 точек', '12 мин'], ['RT-02', 'Доставка из склада', 'Транспортный', 'Этаж 2 · 4 точки', '8 мин'], ['RT-03', 'Маршрут приёмной зоны', 'Пылесос', 'Этаж 1 · 5 точек', '15 мин'], ['RT-04', 'Доставка документов', 'Транспортный', 'Этаж 3 · 3 точки', '6 мин']];
  return <>
      <PageHeading eyebrow="НАВИГАЦИЯ" title="Маршруты" description="Шаблоны перемещения роботов по зонам предприятия." action={<button className="primary-button" onClick={() => notify('Создание маршрута будет доступно в следующей итерации')}><Plus size={17} /> Новый маршрут</button>} />
      <div className="route-grid">{routes.map((r, i) => <div className="panel route-card" key={r[0]}>
          <div className="route-card-top">
            <div className="route-icon">
              <RouteIcon size={22} />
            </div>
            <Badge tone={i === 1 ? 'blue' : 'green'}>{i === 1 ? 'Используется' : 'Активен'}</Badge>
          </div>
          <span className="eyebrow">{r[0]}</span>
          <h3>{r[1]}</h3>
          <p>{r[2]}</p>
          <div className="route-card-meta">
            <span>
              <Map size={15} />
              {r[3]}
            </span>
            <span>
              <Clock3 size={15} />
              {r[4]}
            </span>
          </div>
          <button className="card-link" onClick={() => notify(`Открыт маршрут ${r[0]} в демо-режиме`)}>Открыть маршрут <ArrowUpRight size={15} /></button>
        </div>)}</div>
    </>;
}
