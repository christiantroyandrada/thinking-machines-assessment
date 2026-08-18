import { useState, useEffect } from 'react';
import { suggestDocument } from '../api.js';

export default function SuggestionList({ documentId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function suggest() {
    setBusy(true);
    setError('');
    try {
      const d = await suggestDocument(documentId);
      setSuggestions(d.suggestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { suggest(); }, [documentId]);

  return (
    <div className="card">
      <div className="section-header" style={{ justifyContent: 'space-between' }}>
        <h3>Suggested next steps</h3>
        <button className="btn-ghost" onClick={suggest} disabled={busy}>{busy ? '…' : 'Get suggestions'}</button>
      </div>
      {error && <p className="error-text">{error}</p>}
      <ul className="suggestions">
        {suggestions.map((s, i) => (
          <li key={i}>
            <span className={`prio prio-${s.priority}`}>{s.priority}</span>
            <div><strong>{s.action}</strong><p className="muted">{s.reason}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
