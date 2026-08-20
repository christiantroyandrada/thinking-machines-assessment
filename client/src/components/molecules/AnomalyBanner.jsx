function AnomalyIcon({ type }) {
  const iconMap = {
    'weekend entry': (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="12" height="11" rx="1.5" />
        <path d="M2 6.5h12" />
        <path d="M5.5 1.5v3M10.5 1.5v3" />
      </svg>
    ),
    'overtime': (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3.5l2.5 1.5" />
      </svg>
    ),
    'long session': (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M8 2v3M8 11v3M2 8h3M11 8h3" />
        <circle cx="8" cy="8" r="3" />
      </svg>
    ),
  };
  return iconMap[type] || (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M8 2v6l3 3" />
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}

export default function AnomalyBanner({ anomaly }) {
  return (
    <div className={`anomaly severity-${anomaly.severity}`}>
      <span className="anomaly-icon">
        <AnomalyIcon type={anomaly.type} />
      </span>
      <div className="anomaly-body">
        <span className="anomaly-type">{anomaly.type.replace('-', ' ')}</span>
        <span className="anomaly-detail">{anomaly.detail}</span>
      </div>
      <span className="anomaly-entity">{anomaly.entity}</span>
    </div>
  );
}
