import { NavLink } from 'react-router-dom'
import { Bot, Building2, ChevronDown, LogOut, Wifi } from 'lucide-react'
import { navGroups } from './navigation.js'

export function Sidebar({ userName, role, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Bot size={22} /></div>
        <div><b>rms<span>.</span></b><small>ROBOT MANAGEMENT</small></div>
      </div>
      <div className="workspace">
        <div className="workspace-icon"><Building2 size={17} /></div>
        <div><b>Demo Hospital</b><small>Локальный контур</small></div>
        <ChevronDown size={15} />
      </div>
      <nav>
        {navGroups.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(([label, path, Icon]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {path === '/notifications' && <i className="nav-dot" />}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="connection">
          <span className="online-dot" />
          <div><b>Локальная сеть</b><small>Все сервисы доступны</small></div>
          <Wifi size={16} />
        </div>
        <div className="user-mini">
          <div className="avatar">DM</div>
          <div className="user-info"><b>{userName}</b><small>{role}</small></div>
          <button className="icon-button" title="Выйти" onClick={onLogout}>
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  )
}
