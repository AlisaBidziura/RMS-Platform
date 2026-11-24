import { Bell } from 'lucide-react'
import { getPageTitle } from './navigation.js'

export function Header({ pathname, onOpenNotifications }) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>RMS Platform</span>
        <span className="crumb-slash">/</span>
        <b>{getPageTitle(pathname)}</b>
      </div>
      <div className="top-actions">
        <div className="system-status"><span className="online-dot" /> Система работает</div>
        <button className="icon-button notification-button" onClick={onOpenNotifications}>
          <Bell size={18} /><i />
        </button>
        <div className="top-avatar">DM</div>
      </div>
    </header>
  )
}
