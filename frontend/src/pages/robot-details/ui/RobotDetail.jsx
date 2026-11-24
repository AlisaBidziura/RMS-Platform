import { useParams } from 'react-router-dom'
import { Bot, Zap } from 'lucide-react'
import { Badge, EmptyState, PageHeading, SectionHeader } from '../../../shared/ui/index.js'
import { statusNames, statusClass } from '../../../entities/robot/index.js'
import { taskClass } from '../../../entities/task/index.js'

export function RobotDetail({
  robots,
  tasks,
  notify
}) {
  const {
    id
  } = useParams();
  const r = robots.find(x => x.id === id);
  if (!r) return <EmptyState title="Робот не найден" text="Вернитесь в каталог и выберите устройство." />;
  return <>
      <PageHeading eyebrow={`РОБОТ ${r.id}`} title={r.name} description={`${r.type} · ${r.model}`} action={<Badge tone={statusClass[r.status]} dot>{statusNames[r.status]}</Badge>} />
      <div className="detail-grid">
        <div className="panel detail-main">
          <div className="detail-hero">
            <div className="robot-hero-icon">
              <Bot size={46} />
            </div>
            <div>
              <h2>{r.name}</h2>
              <p>Идентификатор {r.id}</p>
              <Badge tone={statusClass[r.status]} dot>{statusNames[r.status]}</Badge>
            </div>
          </div>
          <div className="detail-stats">
            <div>
              <small>Заряд батареи</small>
              <strong>{r.battery}%</strong>
              <div className="progress">
                <span style={{
                width: `${r.battery}%`
              }} />
              </div>
            </div>
            <div>
              <small>Текущий этаж</small>
              <strong>{r.floor}</strong>
            </div>
            <div>
              <small>Модель</small>
              <strong>{r.model}</strong>
            </div>
          </div>
          <h3 className="subheading">Текущая активность</h3>
          <p className="muted">{r.task}</p>
          <button className="secondary-button" onClick={() => notify('Команда отправлена в демонстрационном режиме')}><Zap size={16} /> Отправить тестовую команду</button>
        </div>
        <div className="panel">
          <SectionHeader title="Задачи робота" />
          {tasks.filter(t => t.robotId === r.id).map(t => <div className="simple-list-item" key={t.id}>
            <b>{t.title}</b>
            <small>{t.id} · {t.time}</small>
            <Badge tone={taskClass[t.status]}>{t.status}</Badge>
          </div>)}
          {!tasks.some(t => t.robotId === r.id) && <p className="muted">У робота пока нет задач.</p>}
        </div>
      </div>
    </>;
}
