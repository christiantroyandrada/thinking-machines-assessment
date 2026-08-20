import { useRef, useState } from 'react';
import { uploadDocument } from '../../api.js';

export default function UploadForm({ onUploaded }) {
  const fileRef = useRef();
  const [type, setType] = useState('PO');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Choose a file first.'); return; }
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      if (title) fd.append('title', title);
      await uploadDocument(fd);
      fileRef.current.value = '';
      setTitle('');
      if (onUploaded) onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card upload-form" onSubmit={submit}>
      <div className="upload-fields">
        <label className="upload-field" htmlFor="upload-type">
          <span>Document type</span>
          <select id="upload-type" value={type} onChange={(e) => setType(e.target.value)}>
            <option>PO</option><option>QUOTE</option><option>REQ</option><option>OTHER</option>
          </select>
        </label>
        <label className="upload-field" htmlFor="upload-title">
          <span>Document title</span>
          <input id="upload-title" placeholder="Optional — defaults to filename" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="upload-field" htmlFor="upload-file">
          <span>Document file</span>
          <input id="upload-file" type="file" accept=".txt,.md,.csv,.json,.log,text/plain,text/csv,application/json" ref={fileRef} />
        </label>
        <button className="upload-button" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
      </div>
      <p className="form-hint">Text, Markdown, CSV, JSON, or log files up to 5 MB.</p>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
