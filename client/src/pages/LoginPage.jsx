import { useNavigate } from 'react-router-dom';
import { getUsers } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAppStore } from '../store/useAppStore.js';

export default function LoginPage() {
  const { data, error, loading } = useAsync(() => getUsers(), []);
  const users = data?.users || [];
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const navigate = useNavigate();

  function choose(u) {
    setCurrentUser(u);
    navigate('/');
  }

  if (loading) return <div className="card">Loading users…</div>;

  const admins = users.filter((u) => u.role === 'admin');
  const staff = users.filter((u) => u.role !== 'admin');
  const demo = [...admins.slice(0, 2), ...staff.slice(0, 6)];

  return (
    <div className="login">
      <div className="card login-card">
        <h1>WorkSmart</h1>
        <p>Choose your identity to continue (mock sign-in).</p>
        {error && <p className="error-text">{error}</p>}
        <div className="user-list">
          {demo.map((u) => (
            <button key={u.id} className="user-row" onClick={() => choose(u)}>
              <span>{u.name}</span>
              <span className="muted">{u.department} · {u.role}</span>
            </button>
          ))}
        </div>
        <select
          aria-label="all users"
          defaultValue=""
          onChange={(e) => {
            const u = users.find((x) => x.id === Number(e.target.value));
            if (u) choose(u);
          }}
        >
          <option value="" disabled>Or pick from all {users.length} users…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name} — {u.department}</option>
          ))}
        </select>
      </div>
    </div>
  );
}