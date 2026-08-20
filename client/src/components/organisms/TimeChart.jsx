import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatHours, normalizeHours } from '../../utils/formatters.js';

const COMPACT_LIMIT = 12;

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      <strong>{formatHours(payload[0].value)}</strong>
    </div>
  );
}

export default function TimeChart({ dimension, series }) {
  const [showAll, setShowAll] = useState(false);
  const data = (series || []).map((s) => ({ name: String(s.key), hours: normalizeHours(s.hours) }));
  if (!data.length) return <p className="muted">No data yet.</p>;
  const dataTable = (
    <table className="sr-only" aria-label={`Time by ${dimension} data`}>
      <thead><tr><th scope="col">{dimension}</th><th scope="col">Hours</th></tr></thead>
      <tbody>
        {data.map((entry) => (
          <tr key={entry.name}><th scope="row">{entry.name}</th><td>{entry.hours} hours</td></tr>
        ))}
      </tbody>
    </table>
  );
  if (dimension === 'date') {
    return (
      <div className="time-chart">
        <div className="time-chart-plot" aria-hidden="true">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 16, right: 12, bottom: 4, left: -12 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="name" minTickGap={32} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--color-line-strong)' }} />
              <YAxis width={52} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="hours" stroke="var(--color-accent-strong)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {dataTable}
      </div>
    );
  }
  const plotData = data.slice(0, COMPACT_LIMIT);
  const compactData = showAll ? data : plotData;
  const hiddenCount = data.length - plotData.length;
  const maxHours = Math.max(...data.map((entry) => entry.hours), 1);

  return (
    <div className="time-chart">
      {hiddenCount > 0 && (
        <p className="chart-scope">{showAll ? `Showing all ${data.length}` : `Showing top ${COMPACT_LIMIT} of ${data.length}`}</p>
      )}
      <div className={`time-chart-plot time-chart-plot-desktop${showAll ? ' is-hidden' : ''}`} aria-hidden="true">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={plotData} margin={{ top: 16, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="name" minTickGap={18} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--color-line-strong)' }} />
            <YAxis width={52} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-accent-soft)' }} />
            <Bar dataKey="hours" fill="var(--color-accent-strong)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className={`compact-time-chart${showAll ? ' is-expanded' : ''}`} aria-label={`Time by ${dimension} chart`}>
        {compactData.map((entry) => (
          <li key={entry.name}>
            <div className="compact-chart-label">
              <span>{entry.name}</span>
              <strong>{formatHours(entry.hours)}</strong>
            </div>
            <div className="compact-chart-track" aria-hidden="true">
              <span style={{ '--chart-value': `${(entry.hours / maxHours) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <div className="compact-chart-more">
          <button type="button" className="btn-ghost" onClick={() => setShowAll((visible) => !visible)}>
            {showAll ? `Show top ${COMPACT_LIMIT}` : `Show ${hiddenCount} more`}
          </button>
        </div>
      )}
    </div>
  );
}
