import { useEffect, useMemo, useState } from 'react';
import * as api from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import CheckInForm from '../components/CheckInForm.jsx';
import CheckInTable from '../components/CheckInTable.jsx';
import EditCheckInModal from '../components/EditCheckInModal.jsx';
import Pagination from '../components/Pagination.jsx';
import { useAppStore } from '../store/useAppStore.js';

const PAGE_SIZE = 25;

export default function CheckInsPage() {
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState('');
  const [department, setDepartment] = useState('');
  const [userId, setUserId] = useState('');
  const [editing, setEditing] = useState(null);

  const users = useAppStore((s) => s.users);
  const setUsers = useAppStore((s) => s.setUsers);

  const { data, error, loading, run, setError } = useAsync(
    () => api.listCheckIns({ page, pageSize: PAGE_SIZE, tag: tag || undefined, department: department || undefined, userId: userId || undefined }),
    [page, tag, department, userId],
  );

  const items = data?.items || [];
  const total = data?.total || 0;

  useEffect(() => {
    if (!users.length) api.getUsers().then((d) => setUsers(d.users)).catch((requestError) => setError(requestError.message));
  }, [users.length, setError, setUsers]);

  const departments = useMemo(() => [...new Set(users.map((u) => u.department))].sort(), [users]);

  async function handleDelete(c) {
    if (!window.confirm(`Delete this check-in (${c.hours} hrs)?`)) return;
    try {
      await api.deleteCheckIn(c.id);
      await run();
    } catch (e) {
      setError(e.message);
    }
  }

  function refreshFromFirstPage() {
    if (page === 1) run();
    else setPage(1);
  }

  return (
    <section className="checkins stack">
      <h1>Check-ins</h1>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <CheckInForm onCreated={refreshFromFirstPage} />
      <div className="card filter-bar">
        <input aria-label="filter by tag" placeholder="Tag (e.g. procurement)" value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} />
        <select aria-label="filter by department" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select aria-label="filter by user" value={userId} onChange={(e) => { setUserId(e.target.value); setPage(1); }}>
          <option value="">All users</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div className="card">
        {loading ? <p className="muted">Loading…</p> : <CheckInTable items={items} onEdit={setEditing} onDelete={handleDelete} />}
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
      {editing && (
        <EditCheckInModal checkIn={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); run(); }} />
      )}
    </section>
  );
}
