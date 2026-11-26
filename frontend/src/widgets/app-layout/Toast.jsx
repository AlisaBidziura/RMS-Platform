import { CheckCircle2 } from 'lucide-react'

export function Toast({ message }) {
  if (!message) return null

  return (
    <div className="toast">
      <CheckCircle2 size={18} />
      {message}
    </div>
  )
}
