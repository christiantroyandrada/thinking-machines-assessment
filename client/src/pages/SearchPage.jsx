import { useState } from 'react';
import { searchAI } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import SearchResultItem from '../components/molecules/SearchResultItem.jsx';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const { data: result, error, loading: busy, run } = useAsync(() => searchAI(q), [q], { immediate: false });

  async function ask(e) {
    e.preventDefault();
    if (!q.trim() || busy) return;
    await run();
  }

  return (
    <div className="stack">
      <h1>AI Search</h1>
      <p className="muted">Ask questions in plain English — e.g. "how many hours on procurement", "show approved documents", "who logged the most time?"</p>
      <form className="row" onSubmit={ask}>
        <label className="sr-only" htmlFor="ai-search-question">Question</label>
        <input id="ai-search-question" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about your time or documents…" />
        <button type="submit" disabled={busy || !q.trim()}>{busy ? 'Thinking…' : 'Ask AI'}</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {result && (
        <div className="stack">
          <div className="card ai-answer" role="status" aria-live="polite"><strong>AI:</strong> {result.answer}</div>
          {result.results && result.results.length > 0 && (
            <div className="card">
              <div className="section-header">
                <h3>Matches</h3>
                <span className="muted">{result.results.length} found</span>
              </div>
              <ul className="suggestions">
                {result.results.map((item) => (
                  <SearchResultItem key={`${result.intent}-${item.id}`} result={item} intent={result.intent} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
