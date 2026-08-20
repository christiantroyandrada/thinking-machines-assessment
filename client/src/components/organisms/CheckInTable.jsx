import TagPill from '../atoms/TagPill.jsx';
import EmptyState from '../molecules/EmptyState.jsx';

export default function CheckInTable({ items, onEdit, onDelete }) {
  if (!items.length) return <EmptyState title="No check-ins yet" hint="Log your first check-in above." />;
  return (
    <table className="data-table">
      <thead>
        <tr><th>Date</th><th>Hours</th><th>Tag</th><th>Activities</th><th>User</th><th>Department</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {items.map((checkIn) => (
          <tr key={checkIn.id}>
            <td data-label="Date">{new Date(checkIn.date).toLocaleDateString()}</td>
            <td data-label="Hours">{checkIn.hours} hr</td>
            <td data-label="Tag"><TagPill tag={checkIn.tag} /></td>
            <td data-label="Activities">{checkIn.activities || <span className="muted">—</span>}</td>
            <td data-label="User">{checkIn.userName}</td>
            <td data-label="Department">{checkIn.department}</td>
            <td data-label="Actions">
              <div className="record-actions">
                <button type="button" className="btn-ghost" onClick={() => onEdit?.(checkIn)}>Edit</button>
                <button type="button" className="btn-danger" onClick={() => onDelete?.(checkIn)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
