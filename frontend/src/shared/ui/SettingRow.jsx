export function SettingRow({ title, description, children }) {
  return (
    <div className="setting-row">
      <div>
        <b>{title}</b>
        <small>{description}</small>
      </div>
      {children}
    </div>
  )
}
