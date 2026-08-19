import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

export default function DocumentTable({ items }) {
  if (!items.length) return <EmptyState title="No documents yet" hint="Upload a procurement document to get started." />;
  return (
    <table className="table">
      <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Time spent</th><th>Linked entries</th><th></th></tr></thead>
      <tbody>
        {items.map((d) => (
          <tr key={d.id}>
            <td><Link to={`/documents/${d.id}`}>{d.title}</Link></td>
            <td>{d.type}</td>
            <td><StatusBadge status={d.status} /></td>
            <td>{(d.totalTimeSpent ?? 0).toFixed(1)} hr</td>
            <td>{d.checkInCount ?? 0}</td>
            <td><Link to={`/documents/${d.id}`}>Open</Link></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
