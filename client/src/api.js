const BASE = import.meta.env.VITE_API_URL || '';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
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
  const p = new URLSearchParams();
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.tag) p.set('tag', params.tag);
  if (params.userId) p.set('userId', String(params.userId));
  if (params.department) p.set('department', params.department);
  if (params.from) p.set('from', params.from);
  if (params.to) p.set('to', params.to);
  if (params.q) p.set('q', params.q);
  return request(`/api/checkins?${p.toString()}`);
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
  const p = new URLSearchParams();
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.status) p.set('status', params.status);
  if (params.type) p.set('type', params.type);
  const qs = p.toString();
  return request(`/api/documents${qs ? `?${qs}` : ''}`);
}

export async function uploadDocument(formData) {
  const res = await fetch(`${BASE}/api/documents`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
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
