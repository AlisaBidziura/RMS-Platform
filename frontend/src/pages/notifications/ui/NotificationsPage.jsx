import { Bell } from 'lucide-react'
import { demoEvents as events } from '../../../entities/event/index.js'
import { Badge, PageHeading } from '../../../shared/ui/index.js'

export function NotificationsPage() {
  return <>
      <PageHeading eyebrow="ЦЕНТР СОБЫТИЙ" title="Уведомления" description="События, требующие внимания оператора." />
      <div className="panel">
        <div className="events-list notification-list">{events.map((e, i) => <div className="event-row" key={i}>
            <div className={`event-mark ${e.tone}`}>
              <Bell size={15} />
            </div>
            <div className="event-text">
              <b>{e.title}</b>
              <small>{e.detail}</small>
            </div>
            <time>{e.time}</time>
            <Badge tone={e.tone === 'warning' ? 'red' : 'gray'}>{e.tone === 'warning' ? 'Требует внимания' : 'Событие'}</Badge>
          </div>)}</div>
      </div>
    </>;
}
