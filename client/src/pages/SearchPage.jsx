import { useState } from 'react';
import { searchAI } from '../api.js';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function ask(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setError('');
    try {
      const d = await searchAI(q);
      setResult(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1>AI Search</h1>
      <p className="muted">Ask questions in plain English — e.g. "how many hours on procurement", "show approved documents", "who logged the most time?"</p>
      <form className="row" onSubmit={ask}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about your time or documents…" />
        <button type="submit" disabled={busy || !q.trim()}>{busy ? 'Thinking…' : 'Ask AI'}</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {result && (
        <div className="stack">
          <div className="card ai-answer"><strong>AI:</strong> {result.answer}</div>
          {result.results && result.results.length > 0 && (
            <div className="card">
              <h3>Matches</h3>
              <ul className="suggestions">
                {result.results.map((r) => (
                  <li key={r.id}>
                    <span className="tag-pill">#{r.tag}</span>
                    <div><strong>{r.activities || r.title}</strong><p className="muted">{r.hours} hrs · {r.userName || r.status}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
