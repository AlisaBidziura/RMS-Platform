import { useState } from 'react'
import { Bot, CircleHelp, MessageSquare, ArrowUpRight } from 'lucide-react'
import { PageHeading, SectionHeader } from '../../../shared/ui/index.js'

export function AssistantPage({
  notify
}) {
  const [messages, setMessages] = useState([{
    from: 'bot',
    text: 'Здравствуйте! Я демонстрационный помощник RMS. Могу подсказать, где найти роботов, как создать задачу или как читать статусы системы.'
  }]);
  const [input, setInput] = useState('');
  const send = (text = input) => {
    if (!text.trim()) return;
    const q = text.trim();
    let answer = 'В демонстрационном режиме я могу показать основные разделы: «Роботы», «Задачи», «Карта этажей» и «Аналитика». Для реальных рекомендаций потребуется подключить модель ИИ и контекст предприятия.';
    if (/задач|созда/i.test(q)) answer = 'Откройте раздел «Задачи» и нажмите «Новая задача». Укажите название, тип, робота и зону, затем сохраните. В прототипе задача появится в общем списке.';else if (/робот|заряд/i.test(q)) answer = 'В каталоге «Роботы» можно найти устройство, проверить заряд и статус. На странице «Карта этажей» отображается расположение демонстрационных роботов.';else if (/ошиб|вниман/i.test(q)) answer = 'На главной странице найдите карточку «Требуют внимания». Дополнительные события доступны в разделах «Уведомления» и «Журнал действий».';
    setMessages(m => [...m, {
      from: 'user',
      text: q
    }, {
      from: 'bot',
      text: answer
    }]);
    setInput('');
    notify('Ответ сформирован демонстрационным помощником');
  };
  return <>
      <PageHeading eyebrow="ПОДДЕРЖКА ОПЕРАТОРА" title="ИИ-помощник" description="Демонстрация диалога с помощником по работе с платформой." />
      <div className="assistant-layout">
        <div className="panel assistant-chat">
          <div className="assistant-chat-header">
            <div className="assistant-avatar">
              <MessageSquare size={21} />
            </div>
            <div>
              <b>RMS Assistant</b>
              <small><span className="online-dot" /> Демо-режим · Ответы по сценариям</small>
            </div>
          </div>
          <div className="chat-messages">{messages.map((m, i) => <div key={i} className={`chat-message ${m.from}`}>
              {m.from === 'bot' && <div className="chat-bot-icon">
                <Bot size={16} />
              </div>}
              <p>{m.text}</p>
            </div>)}</div>
          <div className="chat-suggestions">{['Как создать задачу?', 'Как проверить заряд робота?', 'Где посмотреть ошибки?'].map(s => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
          <form className="chat-input" onSubmit={e => {
          e.preventDefault();
          send();
        }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Напишите вопрос..." />
            <button className="primary-button" type="submit">
              <ArrowUpRight size={17} />
            </button>
          </form>
        </div>
        <div className="panel assistant-side">
          <SectionHeader title="Что умеет помощник" />
          {[['Работа с задачами', 'Создание, назначение и статусы'], ['Мониторинг парка', 'Заряд, состояние, поиск роботов'], ['Разбор событий', 'Уведомления и типовые проблемы']].map(([a, b]) => <div className="simple-list-item" key={a}>
            <b>{a}</b>
            <small>{b}</small>
          </div>)}
          <div className="notice-panel compact">
            <CircleHelp size={18} />
            <p>Это сценарная имитация, а не подключённая языковая модель.</p>
          </div>
        </div>
      </div>
    </>;
}
