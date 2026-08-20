export default function EmptyState({ title, hint }) {
  return (
    <div className="empty-state">
      <p className="muted">{title}</p>
      {hint && <p className="muted" style={{ marginTop: '0.5rem' }}>{hint}</p>}
    </div>
  );
}
