import { useState } from 'react';
import { getTimeAnalytics } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import TimeChart from '../components/TimeChart.jsx';

const DIMENSIONS = [
  { value: 'tag', label: 'By tag' },
  { value: 'date', label: 'By date' },
  { value: 'department', label: 'By department' },
  { value: 'user', label: 'By user' },
];

export default function AnalyticsPage() {
  const [dimension, setDimension] = useState('tag');
  const { data, error } = useAsync(() => getTimeAnalytics(dimension), [dimension]);

  const totalHours = data?.totalHours ?? 0;
  const series = data?.series || [];

  return (
    <section className="analytics stack">
      <h2>Analytics</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="card">
        <div className="row-between">
          <h3>Time spent</h3>
          <div className="segmented" role="group" aria-label="analytics dimension">
            {DIMENSIONS.map((d) => (
              <button key={d.value} className={dimension === d.value ? 'active' : ''} onClick={() => setDimension(d.value)}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <p className="muted"><strong>{Number(totalHours).toFixed(1)} hrs</strong> logged across {series.length} group(s)</p>
        <TimeChart dimension={dimension} series={series} />
      </div>
    </section>
  );
}