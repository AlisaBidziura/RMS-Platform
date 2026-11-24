import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppLayout } from './widgets/app-layout/index.js'
import { LoginPage } from './pages/login/index.js'
import { Dashboard } from './pages/dashboard/index.js'
import { RobotsPage } from './pages/robots/index.js'
import { RobotDetail } from './pages/robot-details/index.js'
import { TasksPage } from './pages/tasks/index.js'
import { MapPage } from './pages/maps/index.js'
import { RoutesPage } from './pages/routes/index.js'
import { AnalyticsPage } from './pages/analytics/index.js'
import { IntegrationsPage } from './pages/integrations/index.js'
import { InfrastructurePage } from './pages/infrastructure/index.js'
import { EmployeesPage } from './pages/employees/index.js'
import { NotificationsPage } from './pages/notifications/index.js'
import { AssistantPage } from './pages/assistant/index.js'
import { AuditPage } from './pages/audit/index.js'
import { SettingsPage } from './pages/settings/index.js'

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('rms-demo-login') === 'yes')
  const [role, setRole] = useState(() => localStorage.getItem('rms-demo-role') || 'Диспетчер')
  const [robots, setRobots] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/robots').then(res => res.json()).then(data => setRobots(data)).catch(console.error);
    fetch('http://127.0.0.1:8000/api/tasks').then(res => res.json()).then(data => setTasks(data)).catch(console.error);

    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        setRobots(data.robots);
        setTasks(data.tasks);
      }
    };

    return () => ws.close();
  }, []);

  const [query, setQuery] = useState('')
  const [floor, setFloor] = useState('2')
  const [toast, setToast] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => { localStorage.setItem('rms-robots', JSON.stringify(robots)) }, [robots])
  useEffect(() => { localStorage.setItem('rms-tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) } }, [toast])
  const notify = (s) => setToast(s)
  const logout = () => { localStorage.removeItem('rms-demo-login'); setLoggedIn(false); navigate('/login') }
  if (!loggedIn && location.pathname !== '/login') return <Navigate to="/login" replace />
  if (loggedIn && location.pathname === '/login') return <Navigate to="/dashboard" replace />
  if (!loggedIn) return <LoginPage onLogin={async (name) => { 
    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: name, password: '12345' })
      });
      const data = await res.json();
      localStorage.setItem('token', data.token);
    } catch(e) { console.log('Ошибка логина', e); }
    localStorage.setItem('rms-demo-login','yes'); 
    localStorage.setItem('rms-demo-user', name); 
    setLoggedIn(true); 
    navigate('/dashboard'); 
  }} />
  return (
    <AppLayout
      userName={localStorage.getItem('rms-demo-user') || 'Демо пользователь'}
      role={role}
      onLogout={logout}
      pathname={location.pathname}
      onOpenNotifications={() => navigate('/notifications')}
      toast={toast}
    >
      <Routes>
        <Route path="/dashboard" element={<Dashboard robots={robots} tasks={tasks} notify={notify} navigate={navigate} />} />
        <Route path="/robots" element={<RobotsPage robots={robots} query={query} setQuery={setQuery} notify={notify} />} />
        <Route path="/robots/:id" element={<RobotDetail robots={robots} tasks={tasks} notify={notify} />} />
        <Route path="/tasks" element={<TasksPage tasks={tasks} setTasks={setTasks} robots={robots} notify={notify} />} />
        <Route path="/map" element={<MapPage robots={robots} floor={floor} setFloor={setFloor} notify={notify} />} />
        <Route path="/routes" element={<RoutesPage notify={notify} />} />
        <Route path="/analytics" element={<AnalyticsPage robots={robots} tasks={tasks} />} />
        <Route path="/infrastructure" element={<InfrastructurePage notify={notify} />} />
        <Route path="/integrations" element={<IntegrationsPage notify={notify} />} />
        <Route path="/employees" element={<EmployeesPage role={role} setRole={(r) => { setRole(r); localStorage.setItem('rms-demo-role', r); notify('Демонстрационная роль изменена') }} notify={notify} />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/assistant" element={<AssistantPage notify={notify} />} />
        <Route path="/audit" element={<AuditPage tasks={tasks} />} />
        <Route path="/settings" element={<SettingsPage role={role} setRole={setRole} notify={notify} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
