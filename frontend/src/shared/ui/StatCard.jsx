export function StatCard({ label, value, change, icon: Icon, tone = 'blue', foot }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        {change && <span className={tone === 'red' ? 'negative' : 'positive'}>{change}</span>}
        {foot && <span>{foot}</span>}
      </div>
    </div>
  )
}
