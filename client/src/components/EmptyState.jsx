export default function EmptyState({ title, hint }) {
  return (
    <div className="empty-state">
      <p className="muted">{title}</p>
      {hint && <p className="muted">{hint}</p>}
    </div>
  );
}
