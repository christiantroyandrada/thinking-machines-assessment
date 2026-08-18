import { useEffect, useState } from 'react';
import { getInsights, getAnomalies, getTimeAnalytics, getDocumentAnalytics } from '../api.js';
import InsightCard from '../components/InsightCard';
import AnomalyBanner from '../components/AnomalyBanner';
import TimeChart from '../components/TimeChart';

export default function HomePage() {
  const [insights, setInsights] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [timeData, setTimeData] = useState({ total: 0, series: [] });
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    getInsights().then((d) => setInsights(d.insights || [])).catch(() => {});
    getAnomalies().then((d) => setAnomalies(d.anomalies || [])).catch(() => {});
    getTimeAnalytics('tag').then(setTimeData).catch(() => {});
    getDocumentAnalytics().then((d) => setDocuments(d.documents || [])).catch(() => {});
  }, []);

  const totalHours = timeData.total ?? 0;
  const byStatus = documents.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});

  return (
    <div className="stack">
      <h1>Welcome back</h1>
      <div className="cards-grid">
        <div className="card stat"><strong>{Number(totalHours).toFixed(1)}</strong><span>hrs logged</span></div>
        <div className="card stat"><strong>{documents.length}</strong><span>documents</span></div>
        <div className="card stat"><strong>{Object.values(byStatus).reduce((a, b) => a + b, 0)}</strong><span>in status flow</span></div>
      </div>
      <div className="cards-grid">
        {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
      </div>
      {anomalies.length > 0 && (
        <div className="card">
          <h3>Anomalies detected</h3>
          <div className="stack">
            {anomalies.map((a, i) => <AnomalyBanner key={i} anomaly={a} />)}
          </div>
        </div>
      )}
      <div className="card">
        <h3>Time by tag</h3>
        <TimeChart series={timeData.series || []} />
      </div>
    </div>
  );
}
