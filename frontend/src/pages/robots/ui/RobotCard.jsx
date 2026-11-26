import { NavLink, useNavigate } from 'react-router-dom'
import { Bot, ArrowUpRight } from 'lucide-react'
import { Badge } from '../../../shared/ui/index.js'
import { statusNames, statusClass } from '../../../entities/robot/index.js'

export function RobotCard({
  robot: r
}) {
  const navigate = useNavigate();
  return <div className="robot-card">
      <div className="robot-card-top">
        <div className="robot-large-icon">
          <Bot size={27} />
        </div>
        <Badge tone={statusClass[r.status]} dot>{statusNames[r.status]}</Badge>
        <button className="icon-button" onClick={() => navigate(`/robots/${r.id}`)}>
          <ArrowUpRight size={17} />
        </button>
      </div>
      <h3>{r.name}</h3>
      <p>{r.id} · {r.model}</p>
      <div className="robot-card-type">
        {r.type}
        <span>Этаж {r.floor}</span>
      </div>
      <div className="robot-battery">
        <div className="battery-label">
          <span>Уровень заряда</span>
          <b>{r.battery}%</b>
        </div>
        <div className="progress">
          <span style={{
          width: `${r.battery}%`
        }} className={r.battery < 25 ? 'low' : ''} />
        </div>
      </div>
      <div className="robot-current-task">
        <small>Текущая активность</small>
        <b>{r.task}</b>
      </div>
      <NavLink className="card-link" to={`/robots/${r.id}`}>Открыть карточку <ArrowUpRight size={15} /></NavLink>
    </div>;
}
