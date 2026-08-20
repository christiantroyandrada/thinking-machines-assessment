const HOURS_FORMATTER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export function normalizeHours(value) {
  const hours = Number(value);
  return Number.isFinite(hours) && hours > 0 ? hours : 0;
}

export function formatHours(value, { long = false } = {}) {
  const hours = normalizeHours(value);
  const roundedHours = Math.round(hours * 10) / 10;
  if (hours > 0 && roundedHours === 0) return long ? '<0.1 hours' : '<0.1 hrs';
  const formatted = HOURS_FORMATTER.format(hours);
  if (!long) return `${formatted} hrs`;
  return `${formatted} ${roundedHours === 1 ? 'hour' : 'hours'}`;
}
