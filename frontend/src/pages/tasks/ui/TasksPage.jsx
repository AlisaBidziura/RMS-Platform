import { useState } from 'react'
import { Bot, Plus } from 'lucide-react'
import { Badge, EmptyState, PageHeading, SectionHeader } from '../../../shared/ui/index.js'
import { API_BASE_URL } from '../../../shared/config/api.js'
import { taskClass } from '../../../entities/task/index.js'

export function TasksPage({
  tasks,
  setTasks,
  robots,
  notify
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('Уборка');
  const [robotId, setRobotId] = useState(robots[0]?.id || '');
  const [zone, setZone] = useState('Этаж 1 · Главный коридор');
  const [filter, setFilter] = useState('Все');
  // Список роботов загружается асинхронно, поэтому начальный выбор вычисляется при рендере.
  const selectedRobotId = robotId || robots[0]?.id || '';
  const addTask = async e => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalRobotId = selectedRobotId;
    if (!finalRobotId) {
      notify("Ошибка: нет доступных роботов");
      return;
    }
    const payload = {
      title: title.trim(),
      kind,
      robotId: finalRobotId,
      zone
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      const createdTask = await response.json();
      setTasks([createdTask, ...tasks]);
      setTitle('');
      setShowForm(false);
      notify(`Задача ${createdTask.id} создана`);
    } catch (error) {
      console.error("Ошибка:", error);
      notify("Не удалось создать задачу. Проверьте вход в систему.");
    }
  };
  const changeStatus = async (t, next) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${t.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: next
        })
      });
      if (response.ok) {
        setTasks(tasks.map(x => x.id === t.id ? {
          ...x,
          status: next
        } : x));
        notify(`Статус задачи ${t.id} изменён`);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };
  const shown = tasks.filter(t => filter === 'Все' || t.status === filter);
  return <>
      <PageHeading eyebrow="ПЛАНИРОВАНИЕ РАБОТ" title="Задачи" description="Создавайте задания, назначайте роботов и отслеживайте выполнение." action={<button className="primary-button" onClick={() => setShowForm(!showForm)}><Plus size={17} /> Новая задача</button>} />
      {showForm && <form className="panel task-form" onSubmit={addTask}>
        <SectionHeader title="Новая задача" />
        <div className="form-grid">
          <label>Название<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Например, доставка документов" required /></label>
          <label>Тип задачи<select value={kind} onChange={e => setKind(e.target.value)}>
              <option>Уборка</option>
              <option>Доставка</option>
              <option>Патрулирование</option>
              <option>Зарядка</option>
            </select></label>
          <label>Назначить робота<select value={selectedRobotId} onChange={e => setRobotId(e.target.value)}>{robots.map(r => <option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}</select></label>
          <label>Зона / маршрут<input value={zone} onChange={e => setZone(e.target.value)} required /></label>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Отмена</button>
          <button className="primary-button" type="submit"><Plus size={16} /> Создать задачу</button>
        </div>
      </form>}
      <div className="filter-toolbar">
        <div className="filter-pills">{['Все', 'Ожидает', 'В работе', 'Требует внимания', 'Завершена', 'Отменена'].map(s => <button key={s} className={filter === s ? 'selected' : ''} onClick={() => setFilter(s)}>{s}</button>)}</div>
        <span className="result-count">{shown.length} задач</span>
      </div>
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ЗАДАЧА</th>
                <th>РОБОТ</th>
                <th>ЗОНА</th>
                <th>СТАТУС</th>
                <th>ВРЕМЯ</th>
                <th>ДЕЙСТВИЯ</th>
              </tr>
            </thead>
            <tbody>{shown.map(t => <tr key={t.id}>
                <td>
                  <b>{t.title}</b>
                  <small>{t.id} · {t.kind}</small>
                </td>
                <td>
                  <span className="table-robot">
                    <Bot size={15} />
                    {t.robotId}
                  </span>
                </td>
                <td>{t.zone}</td>
                <td>
                  <Badge tone={taskClass[t.status] || 'gray'} dot>{t.status}</Badge>
                </td>
                <td>{t.time}</td>
                <td>
                  <select className="status-select" value={t.status} onChange={e => changeStatus(t, e.target.value)} aria-label={`Статус ${t.id}`}>
                    <option>Ожидает</option>
                    <option>В работе</option>
                    <option>Требует внимания</option>
                    <option>Завершена</option>
                    <option>Отменена</option>
                  </select>
                </td>
              </tr>)}</tbody>
          </table>
        </div>
        {shown.length === 0 && <EmptyState title="Задач пока нет" text="Создайте новую задачу или выберите другой фильтр." />}
      </div>
    </>;
}
