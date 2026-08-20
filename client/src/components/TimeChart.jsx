import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TimeChart({ dimension, series }) {
  const data = (series || []).map((s) => ({ name: String(s.key).slice(0, 18), hours: s.hours }));
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
      <>
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="var(--color-accent-strong)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {dataTable}
      </>
    );
  }
  return (
    <>
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="var(--color-accent-strong)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {dataTable}
    </>
  );
}
