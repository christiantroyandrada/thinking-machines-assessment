import TagPill from './TagPill';
import EmptyState from './EmptyState';

export default function CheckInTable({ items, onEdit, onDelete }) {
  if (!items.length) return <EmptyState title="No check-ins yet" hint="Log your first check-in above." />;
  return (
    <table className="table">
      <thead>
        <tr><th>Date</th><th>Hours</th><th>Tag</th><th>Activities</th><th>User</th><th>Department</th><th></th></tr>
      </thead>
      <tbody>
        {items.map((c) => (
          <tr key={c.id}>
            <td>{new Date(c.date).toLocaleDateString()}</td>
            <td>{c.hours} hr</td>
            <td><TagPill tag={c.tag} /></td>
            <td>{c.activities || <span className="muted">—</span>}</td>
            <td>{c.userName}</td>
            <td>{c.department}</td>
            <td className="actions">
              <button type="button" className="btn-ghost" onClick={() => onEdit && onEdit(c)}>Edit</button>
              <button type="button" className="btn-danger" onClick={() => onDelete && onDelete(c)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
