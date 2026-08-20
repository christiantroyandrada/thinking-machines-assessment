import { Link } from 'react-router-dom';
import TagPill from '../atoms/TagPill.jsx';
import StatusBadge from '../atoms/StatusBadge.jsx';

export default function SearchResultItem({ result, intent }) {
  const isDocument = intent === 'documents' || Boolean(result.title && result.status);

  if (isDocument) {
    return (
      <li className="search-result">
        <span className="result-kind">{result.type || 'Document'}</span>
        <div>
          <Link className="result-title" to={`/documents/${result.id}`}>{result.title}</Link>
          <p className="result-meta">
            <span>{result.type || 'Document'} · {result.status || 'unknown status'}</span>
            {result.status && <StatusBadge status={result.status} />}
          </p>
        </div>
      </li>
    );
  }

  return (
    <li className="search-result">
      <TagPill tag={result.tag || 'general'} />
      <div>
        <strong className="result-title">{result.activities || 'Untitled check-in'}</strong>
        <p className="result-meta">
          {Number(result.hours || 0).toFixed(1)} hrs
          {result.userName ? ` · ${result.userName}` : ''}
        </p>
      </div>
    </li>
  );
}
