import {
  LayoutDashboard, Map, Bot, ClipboardList, Route as RouteIcon,
  ChartNoAxesCombined, Building2, Radio, Users, Bell, MessageSquare, FileText, Settings
} from 'lucide-react'

export const navGroups = [
  {
    label: 'РАБОЧЕЕ ПРОСТРАНСТВО', items: [
      ['Обзор', '/dashboard', LayoutDashboard], ['Карта этажей', '/map', Map], ['Роботы', '/robots', Bot], ['Задачи', '/tasks', ClipboardList], ['Маршруты', '/routes', RouteIcon]
    ]
  },
  {
    label: 'АНАЛИЗ И УПРАВЛЕНИЕ', items: [
      ['Аналитика', '/analytics', ChartNoAxesCombined], ['Инфраструктура', '/infrastructure', Building2], ['Интеграции', '/integrations', Radio], ['Сотрудники и роли', '/employees', Users]
    ]
  },
  {
    label: 'СИСТЕМА', items: [
      ['Уведомления', '/notifications', Bell], ['ИИ-помощник', '/assistant', MessageSquare], ['Журнал действий', '/audit', FileText], ['Настройки', '/settings', Settings]
    ]
  }
]
const titles = Object.fromEntries(navGroups.flatMap(g => g.items.map(i => [i[1], i[0]])))

export function getPageTitle(pathname) {
  return titles[pathname] || (pathname.startsWith('/robots/') ? 'Карточка робота' : 'Раздел')
}
