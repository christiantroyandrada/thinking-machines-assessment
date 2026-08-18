const CLASSES = { pending: 'status-pending', 'in-review': 'status-review', approved: 'status-approved', rejected: 'status-rejected' };
export default function StatusBadge({ status }) {
  return <span className={`status-badge ${CLASSES[status] || ''}`}>{status}</span>;
}
