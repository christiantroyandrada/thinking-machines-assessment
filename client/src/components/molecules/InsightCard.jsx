export default function InsightCard({ insight }) {
  return (
    <div className="card insight">
      <h4>{insight.title}</h4>
      <p>{insight.body}</p>
      <span className="muted">{insight.type}</span>
    </div>
  );
}
