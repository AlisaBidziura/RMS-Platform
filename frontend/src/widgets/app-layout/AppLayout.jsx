import { Sidebar } from './Sidebar.jsx'
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'
import { Toast } from './Toast.jsx'

export function AppLayout({ userName, role, onLogout, pathname, onOpenNotifications, toast, children }) {
  return (
    <div className="app-shell">
      <Sidebar userName={userName} role={role} onLogout={onLogout} />
      <main className="main-area">
        <Header pathname={pathname} onOpenNotifications={onOpenNotifications} />
        <div className="page-content">{children}</div>
        <Footer />
      </main>
      <Toast message={toast} />
    </div>
  )
}
