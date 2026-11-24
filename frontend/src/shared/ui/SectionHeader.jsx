import { ArrowUpRight } from 'lucide-react'

export function SectionHeader({ title, link, onClick }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      {link && (
        <button className="text-button" onClick={onClick}>
          {link}<ArrowUpRight size={15} />
        </button>
      )}
    </div>
  )
}
