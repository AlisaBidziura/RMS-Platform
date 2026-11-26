import { Plus, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Badge, PageHeading } from '../../../shared/ui/index.js'

export function EmployeesPage({
  role,
  setRole,
  notify
}) {
  const people = [['DM', 'Демо пользователь', 'dispatcher@demo.local', 'Диспетчер', 'Активен'], ['AS', 'Анна Смирнова', 'a.smirnova@demo.local', 'Руководитель', 'Активен'], ['IK', 'Илья Ким', 'i.kim@demo.local', 'Сотрудник', 'Активен'], ['AD', 'Администратор системы', 'admin@demo.local', 'Администратор', 'Активен']];
  return <>
      <PageHeading eyebrow="ПОЛЬЗОВАТЕЛИ И ДОСТУП" title="Сотрудники и роли" description="Демонстрация того, как роли могут влиять на интерфейс." action={<button className="primary-button" onClick={() => notify('Добавление сотрудника пока доступно только как макет')}><Plus size={17} /> Добавить сотрудника</button>} />
      <div className="panel role-banner">
        <div className="role-banner-icon">
          <ShieldCheck size={25} />
        </div>
        <div>
          <h3>Текущая демонстрационная роль: {role}</h3>
          <p>Переключение ниже меняет состояние интерфейса, но не является механизмом защиты.</p>
        </div>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option>Сотрудник</option>
          <option>Диспетчер</option>
          <option>Руководитель</option>
          <option>Администратор</option>
        </select>
      </div>
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>СОТРУДНИК</th>
                <th>ЭЛЕКТРОННАЯ ПОЧТА</th>
                <th>РОЛЬ</th>
                <th>СТАТУС</th>
                <th>ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody>{people.map(p => <tr key={p[2]}>
                <td>
                  <div className="employee-cell">
                    <div className="avatar">{p[0]}</div>
                    <b>{p[1]}</b>
                  </div>
                </td>
                <td>{p[2]}</td>
                <td>
                  <Badge tone={p[3] === 'Администратор' ? 'violet' : 'blue'}>{p[3]}</Badge>
                </td>
                <td>
                  <Badge tone="green" dot>{p[4]}</Badge>
                </td>
                <td>
                  <button className="text-button" onClick={() => notify(`Профиль ${p[1]} открыт в демо-режиме`)}>Профиль <ArrowUpRight size={14} /></button>
                </td>
              </tr>)}</tbody>
          </table>
        </div>
      </div>
    </>;
}
