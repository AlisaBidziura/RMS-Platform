import { Search } from 'lucide-react'

export function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div><Search size={22} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
