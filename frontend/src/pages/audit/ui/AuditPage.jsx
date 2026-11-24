import { FileText } from 'lucide-react'
import { demoEvents as events } from '../../../entities/event/index.js'
import { Badge, PageHeading } from '../../../shared/ui/index.js'

export function AuditPage({
  tasks
}) {
  const rows = [...events.map((e, i) => ({
    id: `EV-${100 + i}`,
    time: e.time,
    action: e.title,
    details: e.detail,
    kind: 'Событие'
  })), ...tasks.slice(0, 3).map(t => ({
    id: t.id,
    time: t.time,
    action: `Задача: ${t.title}`,
    details: `Статус: ${t.status}`,
    kind: 'Задача'
  }))];
  return <>
      <PageHeading eyebrow="КОНТРОЛЬ И ПРОЗРАЧНОСТЬ" title="Журнал действий" description="Последние события и операции в демонстрационной системе." action={<button className="secondary-button" onClick={() => window.print()}><FileText size={16} /> Экспорт / печать</button>} />
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ВРЕМЯ</th>
                <th>СОБЫТИЕ</th>
                <th>ДЕТАЛИ</th>
                <th>ТИП</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>{rows.map(r => <tr key={r.id}>
                <td>{r.time}</td>
                <td>
                  <b>{r.action}</b>
                </td>
                <td>{r.details}</td>
                <td>
                  <Badge tone={r.kind === 'Задача' ? 'blue' : 'gray'}>{r.kind}</Badge>
                </td>
                <td>{r.id}</td>
              </tr>)}</tbody>
          </table>
        </div>
      </div>
    </>;
}
