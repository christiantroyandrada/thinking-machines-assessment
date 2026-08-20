import { badRequest } from './errors.js';

export function parsePositiveInteger(value, field = 'id') {
  if (!/^[1-9]\d*$/.test(String(value ?? ''))) {
    throw badRequest(`${field} must be a positive integer`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw badRequest(`${field} must be a positive integer`);
  }
  return parsed;
}

export function parseIsoDate(value, field = 'date', { endOfDay = false } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))) {
    throw badRequest(`${field} must use YYYY-MM-DD format`);
  }

  const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
  const parsed = new Date(`${value}${suffix}`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw badRequest(`${field} must be a valid calendar date`);
  }
  return parsed;
}
