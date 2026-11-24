import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppRouter } from './router/AppRouter.jsx'

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
  const navigate = useNavigate()
  useEffect(() => { localStorage.setItem('rms-robots', JSON.stringify(robots)) }, [robots])
  useEffect(() => { localStorage.setItem('rms-tasks', JSON.stringify(tasks)) }, [tasks])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) } }, [toast])
  const notify = (s) => setToast(s)
  const logout = () => { localStorage.removeItem('rms-demo-login'); setLoggedIn(false); navigate('/login') }

  const login = async (name) => {
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
  }

  const changeDemoRole = (r) => { setRole(r); localStorage.setItem('rms-demo-role', r); notify('Демонстрационная роль изменена') }

  return (
    <AppRouter
      loggedIn={loggedIn}
      userName={localStorage.getItem('rms-demo-user') || 'Демо пользователь'}
      role={role}
      setRole={setRole}
      onDemoRoleChange={changeDemoRole}
      onLogin={login}
      onLogout={logout}
      robots={robots}
      tasks={tasks}
      setTasks={setTasks}
      query={query}
      setQuery={setQuery}
      floor={floor}
      setFloor={setFloor}
      notify={notify}
      toast={toast}
    />
  )
}

export default App
