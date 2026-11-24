import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../widgets/app-layout/index.js'
import { LoginPage } from '../../pages/login/index.js'
import { Dashboard } from '../../pages/dashboard/index.js'
import { RobotsPage } from '../../pages/robots/index.js'
import { RobotDetail } from '../../pages/robot-details/index.js'
import { TasksPage } from '../../pages/tasks/index.js'
import { MapPage } from '../../pages/maps/index.js'
import { RoutesPage } from '../../pages/routes/index.js'
import { AnalyticsPage } from '../../pages/analytics/index.js'
import { IntegrationsPage } from '../../pages/integrations/index.js'
import { InfrastructurePage } from '../../pages/infrastructure/index.js'
import { EmployeesPage } from '../../pages/employees/index.js'
import { NotificationsPage } from '../../pages/notifications/index.js'
import { AssistantPage } from '../../pages/assistant/index.js'
import { AuditPage } from '../../pages/audit/index.js'
import { SettingsPage } from '../../pages/settings/index.js'

export function AppRouter({
  loggedIn, userName, role, setRole, onDemoRoleChange,
  onLogin, onLogout, robots, tasks, setTasks,
  query, setQuery, floor, setFloor, notify, toast,
}) {
  const location = useLocation()
  const navigate = useNavigate()

  if (!loggedIn && location.pathname !== '/login') return <Navigate to="/login" replace />
  if (loggedIn && location.pathname === '/login') return <Navigate to="/dashboard" replace />
  if (!loggedIn) return <LoginPage onLogin={onLogin} />

  return (
    <AppLayout
      userName={userName}
      role={role}
      onLogout={onLogout}
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
        <Route path="/employees" element={<EmployeesPage role={role} setRole={onDemoRoleChange} notify={notify} />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/assistant" element={<AssistantPage notify={notify} />} />
        <Route path="/audit" element={<AuditPage tasks={tasks} />} />
        <Route path="/settings" element={<SettingsPage role={role} setRole={setRole} notify={notify} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}
