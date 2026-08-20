import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument, updateDocument, createCheckIn } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import StatusBadge from '../components/atoms/StatusBadge.jsx';
import AnalysisCard from '../components/organisms/AnalysisCard.jsx';
import SuggestionList from '../components/organisms/SuggestionList.jsx';

const STATUSES = ['pending', 'in-review', 'approved', 'rejected'];

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState('');

  const { data: doc, error: loadError, run } = useAsync(() => getDocument(id), [id]);

  async function setStatus(status) {
    if (statusSaving) return;
    setStatusSaving(status);
    setError('');
    try {
      await updateDocument(id, { status });
      await run();
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setStatusSaving('');
    }
  }

  async function logTime(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createCheckIn({ text, documentId: Number(id) });
      setText('');
      await run();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!doc) return loadError ? <p className="error-text">{loadError}</p> : <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <h1>{doc.title}</h1>
      <div className="card">
        <div className="row-between">
          <div>
            <StatusBadge status={doc.status} />
            <span className="muted"> · {doc.type} · {doc.filename}</span>
          </div>
          <div className="segmented">
            {STATUSES.map((s) => (
              <button type="button" key={s} disabled={Boolean(statusSaving)} className={doc.status === s ? 'active' : ''} onClick={() => setStatus(s)}>
                {statusSaving === s ? 'Saving…' : s}
              </button>
            ))}
          </div>
        </div>
        <p className="muted" style={{ marginTop: '0.75rem' }}>Total time spent: <strong>{Number(doc.totalTimeSpent || 0).toFixed(1)} hr</strong> across {doc.checkIns.length} linked check-in(s).</p>
      </div>
      <AnalysisCard documentId={Number(id)} />
      <SuggestionList documentId={Number(id)} />
      <div className="card">
        <div className="section-header">
          <h3>Log time against this document</h3>
        </div>
        <form className="row" onSubmit={logTime}>
          <label className="sr-only" htmlFor="document-checkin-text">Check-in text</label>
          <input id="document-checkin-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 2 hrs #procurement review vendor quote" />
          <button type="submit" disabled={saving || !text.trim()}>{saving ? 'Saving…' : 'Log'}</button>
        </form>
        {error && <p className="error-text" role="alert">{error}</p>}
      </div>
      <div className="card">
        <div className="section-header">
          <h3>Linked time entries</h3>
          <span className="muted">{doc.checkIns.length} entries</span>
        </div>
        {doc.checkIns.length ? (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Hours</th><th>Tag</th><th>Activities</th><th>User</th></tr></thead>
            <tbody>
              {doc.checkIns.map((c) => (
                <tr key={c.id}>
                  <td data-label="Date">{new Date(c.date).toLocaleDateString()}</td>
                  <td data-label="Hours">{c.hours} hr</td>
                  <td data-label="Tag"><span className="tag-pill">#{c.tag}</span></td>
                  <td data-label="Activities">{c.activities}</td>
                  <td data-label="User">{c.user?.name || c.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="muted">No linked entries yet.</p>}
      </div>
    </div>
  );
}
