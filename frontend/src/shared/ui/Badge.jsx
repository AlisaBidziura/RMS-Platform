export function Badge({ children, tone = 'gray', dot = false }) {
  return <span className={`badge ${tone}`}>{dot && <i />}{children}</span>
}
