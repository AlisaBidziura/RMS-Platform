import { useState } from 'react'
import { Badge, PageHeading, SectionHeader, SettingRow } from '../../../shared/ui/index.js'

export function SettingsPage({
  role,
  setRole,
  notify
}) {
  const [compact, setCompact] = useState(false);
  const [alerts, setAlerts] = useState(true);
  return <>
      <PageHeading eyebrow="ПАРАМЕТРЫ ПЛАТФОРМЫ" title="Настройки" description="Локальные настройки внешнего вида и демонстрационного контура." />
      <div className="settings-layout">
        <div className="panel settings-panel">
          <SectionHeader title="Интерфейс" />
          <SettingRow title="Компактный режим" description="Уменьшить расстояния между элементами">
            <input type="checkbox" checked={compact} onChange={e => setCompact(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Показывать уведомления" description="Демонстрационная настройка уведомлений">
            <input type="checkbox" checked={alerts} onChange={e => setAlerts(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Роль текущего пользователя" description="Влияет только на демонстрационную подпись">
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option>Сотрудник</option>
              <option>Диспетчер</option>
              <option>Руководитель</option>
              <option>Администратор</option>
            </select>
          </SettingRow>
          <button className="primary-button" onClick={() => notify('Настройки применены в интерфейсе')}>Сохранить настройки</button>
        </div>
        <div className="panel settings-panel">
          <SectionHeader title="О системе" />
          <div className="about-row">
            <span>Версия</span>
            <b>0.1.0 · Prototype</b>
          </div>
          <div className="about-row">
            <span>Режим</span>
            <Badge tone="amber">Демонстрационный</Badge>
          </div>
          <div className="about-row">
            <span>Хранилище</span>
            <b>localStorage браузера</b>
          </div>
          <div className="about-row">
            <span>Backend / API</span>
            <Badge tone="gray">Не подключены</Badge>
          </div>
          <button className="secondary-button" onClick={() => {
          localStorage.removeItem('rms-tasks');
          localStorage.removeItem('rms-robots');
          notify('Данные сброшены. Обновите страницу для восстановления примеров.');
        }}>Сбросить демо-данные</button>
        </div>
      </div>
    </>;
}
