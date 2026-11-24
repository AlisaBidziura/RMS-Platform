import { Building2, CircleHelp, DoorOpen, Radio, Zap } from 'lucide-react'
import { Badge, PageHeading } from '../../../shared/ui/index.js'

export function InfrastructurePage({
  notify
}) {
  const items = [['Дверь D-01', 'Главный коридор', 'Доступна', DoorOpen, 'green'], ['Лифт E-02', 'Корпус A · 3 этажа', 'Демо-режим', Building2, 'amber'], ['Зарядная станция A-01', 'Этаж 1 · Холл', 'Онлайн', Zap, 'green'], ['Камера C-12', 'Этаж 2 · Приёмная', 'Только заглушка', Radio, 'gray']];
  return <>
      <PageHeading eyebrow="ОБОРУДОВАНИЕ ЗДАНИЯ" title="Инфраструктура" description="Двери, лифты, зарядные станции и камеры, доступные RMS." />
      <div className="integration-grid">{items.map(([name, desc, status, Icon, tone]) => <div className="panel infrastructure-card" key={name}>
          <div className="infra-icon">
            <Icon size={23} />
          </div>
          <div className="infra-main">
            <h3>{name}</h3>
            <p>{desc}</p>
            <Badge tone={tone} dot>{status}</Badge>
          </div>
          <button className="secondary-button small" onClick={() => notify(`Управление объектом ${name} — демо`)}>Управление</button>
        </div>)}</div>
      <div className="notice-panel panel">
        <CircleHelp size={20} />
        <div>
          <b>Важно</b>
          <p>Реальное управление дверями, лифтами и видеопотоками требует отдельной интеграции и проверки прав доступа.</p>
        </div>
      </div>
    </>;
}
