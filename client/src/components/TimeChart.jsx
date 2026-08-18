export default function TimeChart({ series }) {
  const max = Math.max(1, ...(series || []).map((s) => s.hours || 0));
  if (!series || !series.length) return <p className="muted">No data yet.</p>;
  return (
    <ul className="bars">
      {series.map((s) => (
        <li key={s.key}>
          <span className="bar-label">{s.key}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${((s.hours || 0) / max) * 100}%` }} /></span>
          <span className="bar-value">{s.hours} hr</span>
        </li>
      ))}
    </ul>
  );
}
