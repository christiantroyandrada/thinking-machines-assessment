import { useCallback, useEffect, useState } from 'react';
import { listDocuments } from '../api.js';
import UploadForm from '../components/UploadForm';
import DocumentTable from '../components/DocumentTable';
import Pagination from '../components/Pagination';

export default function DocumentsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocuments({ page, pageSize: 25, status: status || undefined, type: type || undefined });
      setItems(data.documents);
      setTotal(data.documents.length);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, status, type]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="stack">
      <h1>Documents</h1>
      {error && <div className="error-banner">{error}</div>}
      <UploadForm onUploaded={() => { setPage(1); load(); }} />
      <div className="card filters">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option>pending</option><option>in-review</option><option>approved</option><option>rejected</option>
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All types</option>
          <option>PO</option><option>QUOTE</option><option>REQ</option><option>OTHER</option>
        </select>
      </div>
      <div className="card">
        {loading ? <p className="muted">Loading…</p> : <DocumentTable items={items} />}
        <Pagination page={page} pageSize={25} total={total} onChange={setPage} />
      </div>
    </div>
  );
}
