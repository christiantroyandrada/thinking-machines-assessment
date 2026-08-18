import { useState } from 'react';
import { analyzeDocument } from '../api.js';

export default function AnalysisCard({ documentId }) {
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    setBusy(true);
    setError('');
    try {
      const d = await analyzeDocument(documentId);
      setAnalysis(d.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="section-header" style={{ justifyContent: 'space-between' }}>
        <h3>AI Document Analysis</h3>
        <button onClick={analyze} disabled={busy}>{busy ? 'Analyzing…' : 'Analyze with AI'}</button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {analysis && (
        <div>
          <p className="muted">Extracted with {Math.round(analysis.confidence * 100)}% confidence (mock rule-based extraction).</p>
          <dl className="kv">
            {Object.entries(analysis.fields).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
