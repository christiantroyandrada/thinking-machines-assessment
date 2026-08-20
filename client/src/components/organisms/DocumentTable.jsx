import { Link } from 'react-router-dom';
import StatusBadge from '../atoms/StatusBadge.jsx';
import EmptyState from '../molecules/EmptyState.jsx';

export default function DocumentTable({ items }) {
  if (!items.length) return <EmptyState title="No documents yet" hint="Upload a procurement document to get started." />;
  return (
    <table className="data-table">
      <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Time spent</th><th>Linked entries</th><th>Actions</th></tr></thead>
      <tbody>
        {items.map((document) => (
          <tr key={document.id}>
            <td data-label="Document"><Link to={`/documents/${document.id}`}>{document.title}</Link></td>
            <td data-label="Type">{document.type}</td>
            <td data-label="Status"><StatusBadge status={document.status} /></td>
            <td data-label="Time spent">{(document.totalTimeSpent ?? 0).toFixed(1)} hr</td>
            <td data-label="Linked entries">{document.checkInCount ?? 0}</td>
            <td data-label="Actions"><Link className="record-link" to={`/documents/${document.id}`}>Open</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
