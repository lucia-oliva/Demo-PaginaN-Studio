export default function TopBadge({ children, danger = false }) {
  return <span className={`top-badge ${danger ? 'top-badge--danger' : ''}`}>{children}</span>;
}
