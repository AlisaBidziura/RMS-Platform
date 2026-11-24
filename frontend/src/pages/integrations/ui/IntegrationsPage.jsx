import { Bot, Building2, DoorOpen, Plus, Radio, ShieldCheck } from 'lucide-react'
import { Badge, PageHeading } from '../../../shared/ui/index.js'

export function IntegrationsPage({
  notify
}) {
  const items = [['Robot API Gateway', 'Единый шлюз команд для разных моделей роботов', 'Подключён', 'green', Bot], ['ERP / учётная система', 'Обмен задачами и статусами с системами предприятия', 'Настроен', 'blue', Building2], ['Двери и лифты', 'Передача команд через API или релейные модули', 'Демо-режим', 'amber', DoorOpen], ['События и вебхуки', 'Уведомления внешних систем о событиях', 'Не настроен', 'gray', Radio]];
  return <>
      <PageHeading eyebrow="ВНЕШНИЕ СИСТЕМЫ" title="Интеграции" description="Подключения к роботам и информационным системам предприятия." action={<button className="primary-button" onClick={() => notify('Мастер настройки интеграции — демонстрационная заглушка')}><Plus size={17} /> Добавить интеграцию</button>} />
      <div className="integration-grid">{items.map(([title, desc, status, tone, Icon]) => <div className="panel integration-card" key={title}>
          <div className="integration-top">
            <div className="integration-icon">
              <Icon size={23} />
            </div>
            <Badge tone={tone} dot>{status}</Badge>
          </div>
          <h3>{title}</h3>
          <p>{desc}</p>
          <div className="integration-bottom">
            <span>
              <span className={`online-dot ${tone === 'gray' ? 'offline' : ''}`} />
              {tone === 'gray' ? 'Нет соединения' : 'Последняя проверка: недавно'}
            </span>
            <button className="secondary-button small" onClick={() => notify(`Открыты настройки: ${title}`)}>Настроить</button>
          </div>
        </div>)}</div>
      <div className="panel notice-panel">
        <ShieldCheck size={20} />
        <div>
          <b>Безопасность интеграций</b>
          <p>В этом прототипе подключения не отправляют команды во внешние системы. Перед реальным запуском понадобятся серверная авторизация, управление секретами и журналирование.</p>
        </div>
      </div>
    </>;
}
