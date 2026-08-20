const CLASSES = { pending: 'status-badge--pending', 'in-review': 'status-badge--review', approved: 'status-badge--approved', rejected: 'status-badge--rejected' };

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${CLASSES[status] || ''}`}>{status}</span>;
}
