import { useEffect, useState } from 'react';
import { parseCheckIn, createCheckIn } from '../api.js';

export default function CheckInForm({ onCreated }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [useSmartTag, setUseSmartTag] = useState(false);

  useEffect(() => {
    if (!text.trim()) { setPreview(null); return; }
    let active = true;
    parseCheckIn(text)
      .then((d) => { if (active) setPreview(d.parsed); })
      .catch(() => { if (active) setPreview(null); });
    return () => { active = false; };
  }, [text]);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createCheckIn(useSmartTag ? { text, useSmartTag: true } : { text });
      setText('');
      setPreview(null);
      setUseSmartTag(false);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const showSmart = preview && preview.valid && preview.tag === 'general';

  return (
    <form className="card checkin-form" onSubmit={submit}>
      <label>Log a check-in <span className="muted">— <code>5.5 hrs #project-x fix login issue</code></span></label>
      <div className="row">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 2 hrs vendor negotiation for procurement" />
        <button type="submit" disabled={saving || !text.trim()}>{saving ? 'Saving…' : 'Log it'}</button>
      </div>
      {preview && (
        <div className="parse-preview">
          {preview.valid ? (
            <span>
              <span className="tag-pill">{preview.hours} hr · #{preview.tag}</span>
              {showSmart && (
                <label className="smart-tag">
                  <input type="checkbox" checked={useSmartTag} onChange={(e) => setUseSmartTag(e.target.checked)} />
                  Smart tag this entry (AI)
                </label>
              )}
            </span>
          ) : (
            <span className="error-text">{preview.errors.join(' ')}</span>
          )}
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
