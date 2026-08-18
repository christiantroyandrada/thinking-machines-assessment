import { useRef, useState } from 'react';
import { uploadDocument } from '../api.js';

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
      <div className="row">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>PO</option><option>QUOTE</option><option>REQ</option><option>OTHER</option>
        </select>
        <input placeholder="Title (optional - defaults to filename)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" ref={fileRef} />
        <button type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
