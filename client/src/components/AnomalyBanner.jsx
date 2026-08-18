export default function AnomalyBanner({ anomaly }) {
  return (
    <div className={`anomaly severity-${anomaly.severity}`}>
      <strong>{anomaly.type.replace('-', ' ')}</strong>
      <span>{anomaly.detail}</span>
      <span className="muted">— {anomaly.entity}</span>
    </div>
  );
}
