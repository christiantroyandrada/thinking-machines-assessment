const BASE = import.meta.env.VITE_API_URL || '';
let apiUserId = 1;

export function setApiUser(id) {
  apiUserId = Number(id) || 1;
}

function buildQuery(params = {}) {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') p.set(key, String(value));
  }
  return p.toString();
}

async function request(url, options = {}) {
  const headers = { 'x-user-id': String(apiUserId) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function getHealth() {
  return request('/api/health');
}

export async function listCheckIns(params = {}) {
  const qs = buildQuery({ page: params.page, pageSize: params.pageSize, tag: params.tag, userId: params.userId, department: params.department, from: params.from, to: params.to, q: params.q });
  return request(`/api/checkins${qs ? `?${qs}` : ''}`);
}

export async function parseCheckIn(text) {
  return request('/api/checkins/parse', { method: 'POST', body: JSON.stringify({ text }) });
}

export async function createCheckIn(payload) {
  return request('/api/checkins', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCheckIn(id, payload) {
  return request(`/api/checkins/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCheckIn(id) {
  return request(`/api/checkins/${id}`, { method: 'DELETE' });
}

export async function listDocuments(params = {}) {
  const qs = buildQuery({ page: params.page, pageSize: params.pageSize, status: params.status, type: params.type });
  return request(`/api/documents${qs ? `?${qs}` : ''}`);
}

export async function uploadDocument(formData) {
  return request('/api/documents', { method: 'POST', body: formData });
}

export async function getDocument(id) {
  return request(`/api/documents/${id}`);
}

export async function updateDocument(id, payload) {
  return request(`/api/documents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function getDocumentAnalytics() {
  return request('/api/analytics/documents');
}

export async function getTimeAnalytics(dimension = 'tag') {
  return request(`/api/analytics/time?dimension=${dimension}`);
}

export async function getInsights() {
  return request('/api/ai/insights');
}

export async function getAnomalies() {
  return request('/api/ai/anomalies');
}

export async function getDepartmentAnalytics() {
  return request('/api/analytics/time/departments');
}

export async function analyzeDocument(id) {
  return request(`/api/documents/${id}/analyze`, { method: 'POST' });
}

export async function suggestDocument(id) {
  return request(`/api/documents/${id}/suggest`, { method: 'POST' });
}

export async function searchAI(q) {
  return request(`/api/ai/search?q=${encodeURIComponent(q)}`);
}

export async function getAdminAnalytics() {
  return request('/api/admin/analytics');
}
