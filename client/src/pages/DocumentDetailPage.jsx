import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, updateDocument, createCheckIn } from '../api.js';
import StatusBadge from '../components/StatusBadge';
import AnalysisCard from '../components/AnalysisCard';
import SuggestionList from '../components/SuggestionList';

const STATUSES = ['pending', 'in-review', 'approved', 'rejected'];

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setDoc(await getDocument(id));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(status) {
    await updateDocument(id, { status });
    await load();
  }

  async function logTime(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createCheckIn({ text, documentId: Number(id) });
      setText('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!doc) return <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <h1>{doc.title}</h1>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <StatusBadge status={doc.status} />
            <span className="muted"> · {doc.type} · {doc.filename}</span>
          </div>
          <div className="segmented">
            {STATUSES.map((s) => (
              <button key={s} className={doc.status === s ? 'active' : ''} onClick={() => setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
        <p className="muted">Total time spent: <strong>{Number(doc.totalTimeSpent || 0).toFixed(1)} hr</strong> across {doc.checkIns.length} linked check-in(s).</p>
      </div>
      <AnalysisCard documentId={Number(id)} />
      <SuggestionList documentId={Number(id)} />
      <div className="card">
        <h3>Log time against this document</h3>
        <form className="row" onSubmit={logTime}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 2 hrs #procurement review vendor quote" />
          <button type="submit" disabled={saving || !text.trim()}>{saving ? 'Saving…' : 'Log'}</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>
      <div className="card">
        <h3>Linked time entries</h3>
        {doc.checkIns.length ? (
          <table className="table">
            <thead><tr><th>Date</th><th>Hours</th><th>Tag</th><th>Activities</th><th>User</th></tr></thead>
            <tbody>
              {doc.checkIns.map((c) => (
                <tr key={c.id}>
                  <td>{new Date(c.date).toLocaleDateString()}</td>
                  <td>{c.hours} hr</td>
                  <td><span className="tag-pill">#{c.tag}</span></td>
                  <td>{c.activities}</td>
                  <td>{c.user?.name || c.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="muted">No linked entries yet.</p>}
      </div>
    </div>
  );
}
