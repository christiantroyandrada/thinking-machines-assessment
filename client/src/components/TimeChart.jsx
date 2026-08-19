import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TimeChart({ dimension, series }) {
  const data = (series || []).map((s) => ({ name: String(s.key).slice(0, 18), hours: s.hours }));
  if (!data.length) return <p className="muted">No data yet.</p>;
  if (dimension === 'date') {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="hours" stroke="#2b4a6f" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="hours" fill="#2b4a6f" />
      </BarChart>
    </ResponsiveContainer>
  );
}
