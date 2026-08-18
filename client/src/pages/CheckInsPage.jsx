import { useEffect, useState, useCallback } from 'react';
import * as api from '../api.js';
import CheckInForm from '../components/CheckInForm.jsx';
import TagPill from '../components/TagPill.jsx';

export default function CheckInsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState('');
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editHours, setEditHours] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editActivities, setEditActivities] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.listCheckIns({ page, pageSize: 25, tag: tag || undefined });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) { setError(e.message); }
  }, [page, tag]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(c) {
    try {
      await api.deleteCheckIn(c.id);
      await load();
    } catch (e) { setError(e.message); }
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditHours(String(c.hours));
    setEditTag(c.tag || '');
    setEditActivities(c.activities || '');
  }

  async function handleEditSave(c) {
    try {
      await api.updateCheckIn(c.id, { hours: Number(editHours), tag: editTag || 'general', activities: editActivities });
      setEditingId(null);
      await load();
    } catch (e) { setError(e.message); }
  }

  return (
    <section className="checkins">
      <h2>Check-ins</h2>
      {error && <div className="error">{error}</div>}
      <CheckInForm onCreated={() => { setPage(1); load(); }} />
      <input className="filter" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="filter by tag" aria-label="tag filter" />
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            {editingId === c.id ? (
              <form className="edit-checkin" onSubmit={(e) => { e.preventDefault(); handleEditSave(c); }}>
                <input type="number" step="0.1" value={editHours} onChange={(e) => setEditHours(e.target.value)} aria-label="edit hours" />
                <input value={editTag} onChange={(e) => setEditTag(e.target.value)} aria-label="edit tag" />
                <input value={editActivities} onChange={(e) => setEditActivities(e.target.value)} aria-label="edit activities" />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <strong>{c.hours}h</strong> <TagPill tag={c.tag} /> · {c.activities} — {c.userName} ({c.department})
                <button type="button" onClick={() => handleDelete(c)}>Delete</button>
                <button type="button" onClick={() => startEdit(c)}>Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="pager">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page} / {Math.max(1, Math.ceil(total / 25))}</span>
        <button disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </section>
  );
}
