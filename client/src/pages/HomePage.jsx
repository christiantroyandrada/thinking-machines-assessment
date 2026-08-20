import { useAsync } from '../hooks/useAsync.js';
import { getInsights, getAnomalies, getTimeAnalytics, getDocumentAnalytics } from '../api.js';
import { useAppStore } from '../store/useAppStore.js';
import InsightCard from '../components/molecules/InsightCard.jsx';
import AnomalyBanner from '../components/molecules/AnomalyBanner.jsx';
import TimeChart from '../components/TimeChart.jsx';

export default function HomePage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const insights = useAsync(() => getInsights(), []);
  const anomalies = useAsync(() => getAnomalies(), []);
  const timeData = useAsync(() => getTimeAnalytics('tag'), []);
  const docStats = useAsync(() => getDocumentAnalytics(), []);

  const insightList = insights.data?.insights || [];
  const anomalyList = anomalies.data?.anomalies || [];
  const totalHours = timeData.data?.totalHours ?? 0;
  const series = timeData.data?.series || [];
  const totalDocuments = docStats.data?.totalDocuments ?? 0;
  const byStatus = docStats.data?.byStatus || {};
  const inStatusFlow = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const dashboardErrors = [insights.error, anomalies.error, timeData.error, docStats.error].filter(Boolean);

  return (
    <div className="stack">
      <h1>Welcome back, {currentUser?.name}</h1>
      <p className="page-intro">Here’s the latest organization-wide activity.</p>
      {dashboardErrors.length > 0 && (
        <div className="error-banner" role="alert">
          Some dashboard data could not be loaded: {[...new Set(dashboardErrors)].join(' ')}
        </div>
      )}
      <div className="cards-grid">
        <div className="card stat"><strong>{timeData.error ? '—' : Number(totalHours).toFixed(1)}</strong><span>organization hours</span></div>
        <div className="card stat"><strong>{docStats.error ? '—' : totalDocuments}</strong><span>documents</span></div>
        <div className="card stat"><strong>{docStats.error ? '—' : inStatusFlow}</strong><span>in status flow</span></div>
      </div>
      {insightList.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h3>Insights</h3>
          </div>
          <div className="cards-grid" style={{ marginTop: '0.5rem' }}>
            {insightList.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </div>
      )}
      {anomalyList.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h3>Anomalies detected</h3>
            <span className="muted">{anomalyList.length} found</span>
          </div>
          <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
            {anomalyList.map((a, i) => <AnomalyBanner key={i} anomaly={a} />)}
          </div>
        </div>
      )}
      <div className="card">
        <div className="section-header">
          <h3>Time by tag</h3>
        </div>
        <TimeChart dimension="tag" series={series} />
      </div>
    </div>
  );
}
