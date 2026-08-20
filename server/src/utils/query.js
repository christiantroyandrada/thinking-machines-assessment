import { badRequest } from './errors.js';

function parsePageValue(value, fallback, field) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw badRequest(`${field} must be a positive integer`);
  }
  return parsed;
}

export function parsePagination(query = {}) {
  const page = parsePageValue(query.page, 1, 'page');
  const pageSize = Math.min(100, parsePageValue(query.pageSize, 25, 'pageSize'));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
