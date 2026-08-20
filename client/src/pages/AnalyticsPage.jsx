import { useState } from 'react';
import { getTimeAnalytics } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import TimeChart from '../components/organisms/TimeChart.jsx';
import { formatHours } from '../utils/formatters.js';

const DIMENSIONS = [
  { value: 'tag', label: 'By tag' },
  { value: 'date', label: 'By date' },
  { value: 'department', label: 'By department' },
  { value: 'user', label: 'By user' },
];

const DIMENSION_NOUNS = { tag: 'tag', date: 'day', department: 'department', user: 'user' };
export default function AnalyticsPage() {
  const [dimension, setDimension] = useState('tag');
  const { data, error, loading } = useAsync(() => getTimeAnalytics(dimension), [dimension]);

  const totalHours = data?.totalHours ?? 0;
  const series = data?.series || [];
  const groupNoun = `${DIMENSION_NOUNS[dimension]}${series.length === 1 ? '' : 's'}`;

  return (
    <section className="analytics stack">
      <h2>Analytics</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="card analytics__card">
        <div className="row-between">
          <h3>Time spent</h3>
          <div className="segmented" role="group" aria-label="analytics dimension">
            {DIMENSIONS.map((d) => (
              <button key={d.value} className={`segmented__option${dimension === d.value ? ' segmented__option--active' : ''}`} aria-pressed={dimension === d.value} onClick={() => setDimension(d.value)}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p className="analytics__loading" role="status">Updating chart…</p>
        ) : !error ? (
          <>
            <p className="analytics__summary"><strong>{formatHours(totalHours, { long: true })} across {series.length} {groupNoun}</strong></p>
            <TimeChart key={dimension} dimension={dimension} series={series} />
          </>
        ) : null}
      </div>
    </section>
  );
}
