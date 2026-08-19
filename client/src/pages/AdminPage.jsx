import { getAdminAnalytics } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';

export default function AdminPage() {
  const { data, error } = useAsync(() => getAdminAnalytics(), []);

  if (error) return <div className="card"><p className="error-text">{error}</p></div>;
  if (!data) return <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <h1>Team Analytics</h1>
      <div className="cards-grid">
        <div className="card stat">
          <strong>{data.totalUsers}</strong>
          <span>users</span>
        </div>
        <div className="card stat">
          <strong>{Number(data.totalHours).toFixed(1)}</strong>
          <span>hrs logged</span>
        </div>
        <div className="card stat">
          <strong>{data.activeUsers}</strong>
          <span>active users</span>
        </div>
      </div>
      <div className="card">
        <div className="section-header">
          <h3>Hours by department</h3>
        </div>
        <table className="table">
          <thead><tr><th>Department</th><th>Users</th><th>Hours</th></tr></thead>
          <tbody>
            {data.departmentBreakdown.map((d) => (
              <tr key={d.department}><td>{d.department}</td><td>{d.users}</td><td>{Number(d.hours).toFixed(1)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="section-header">
          <h3>Top tags</h3>
        </div>
        <ul className="suggestions">
          {data.topTags.map((t) => (
            <li key={t.tag}><span className="tag-pill">#{t.tag}</span><span>{Number(t.hours).toFixed(1)} hrs</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}