import { useState } from 'react';
import { listDocuments } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import UploadForm from '../components/organisms/UploadForm.jsx';
import DocumentTable from '../components/organisms/DocumentTable.jsx';
import Pagination from '../components/molecules/Pagination.jsx';

const PAGE_SIZE = 25;

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data, error, loading, run } = useAsync(
    () => listDocuments({ page, pageSize: PAGE_SIZE, status: status || undefined, type: type || undefined }),
    [page, status, type],
  );

  const items = data?.items || [];
  const total = data?.total || 0;
  const refreshAfterUpload = () => {
    if (page === 1) run();
    else setPage(1);
  };

  return (
    <div className="stack">
      <h1>Documents</h1>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <UploadForm onUploaded={refreshAfterUpload} />
      <div className="filter-bar">
        <span className="filter-bar__label">Filters</span>
        <label className="sr-only" htmlFor="document-status-filter">Status filter</label>
        <select id="document-status-filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option>pending</option><option>in-review</option><option>approved</option><option>rejected</option>
        </select>
        <label className="sr-only" htmlFor="document-type-filter">Type filter</label>
        <select id="document-type-filter" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
          <option value="">All types</option>
          <option>PO</option><option>QUOTE</option><option>REQ</option><option>OTHER</option>
        </select>
      </div>
      <div className="card">
        {loading ? <p className="muted">Loading…</p> : <DocumentTable items={items} />}
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </div>
    </div>
  );
}
