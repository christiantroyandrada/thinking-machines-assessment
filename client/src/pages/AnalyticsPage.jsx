import { useEffect, useState } from 'react';
import * as api from '../api.js';

export default function AnalyticsPage() {
  const [time, setTime] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, d, doc] = await Promise.all([
          api.getTimeAnalytics('tag'),
          api.getDepartmentAnalytics(),
          api.getDocumentAnalytics(),
        ]);
        setTime(t.series || []);
        setDepartments(d.departments || []);
        setDocuments(doc.documents || []);
      } catch (e) { setError(e.message); }
    })();
  }, []);

  return (
    <section className="analytics">
      <h2>Analytics</h2>
      {error && <div className="error">{error}</div>}
      <h3>Hours by tag</h3>
      <ul>
        {time.map((r) => <li key={r.key} className="bar"><span>{r.key}</span><strong>{r.hours}h</strong></li>)}
      </ul>
      <h3>Hours by department</h3>
      <table>
        <thead><tr><th>Department</th><th>Total</th><th>Avg/user</th></tr></thead>
        <tbody>
          {departments.map((d) => <tr key={d.department}><td>{d.department}</td><td>{d.totalHours}</td><td>{d.avgHoursPerUser}</td></tr>)}
        </tbody>
      </table>
      <h3>Document linkage</h3>
      <ul>
        {documents.map((d) => <li key={d.id}>{d.title} — {d.linkedHours}h ({d.linkedCheckIns} linked)</li>)}
      </ul>
    </section>
  );
}
