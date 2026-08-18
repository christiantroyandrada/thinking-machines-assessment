export function aggregateBy(checkIns, dimension) {
  const map = new Map();
  for (const c of checkIns) {
    const key = dimension === 'tag'
      ? (c.tag || 'general')
      : dimension === 'department'
      ? (c.user?.department || 'Unknown')
      : (c.user?.name || 'Unknown');
    map.set(key, (map.get(key) || 0) + c.hours);
  }
  const series = [...map.entries()]
    .map(([key, hours]) => ({ key, hours: Number(hours.toFixed(2)) }))
    .sort((a, b) => b.hours - a.hours);
  const total = Number(series.reduce((s, r) => s + r.hours, 0).toFixed(2));
  return { series, total };
}
