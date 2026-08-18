const TAG_KEYWORDS = {
  procurement: ['procurement', 'vendor', 'negotiation', 'quote', 'quotation', 'purchase order', 'po ', 'rfq', 'requisition', 'sourcing', 'supplier', 'invoice'],
  'project-x': ['project-x', 'project x', 'login', 'fix', 'bug', 'issue', 'deploy', 'release'],
  design: ['design', 'ux', 'ui', 'mockup', 'wireframe', 'prototype'],
  meeting: ['meeting', 'sync', 'standup', '1:1', 'review', 'alignment'],
  finance: ['finance', 'budget', 'invoice', 'reimbursement', 'payables'],
  support: ['support', 'ticket', 'customer', 'client issue'],
  ops: ['ops', 'operations', 'inventory', 'logistics', 'shipment', 'quality'],
  general: [],
};

export function mockCategorize(text) {
  const lower = (text || '').toLowerCase();
  let best = { tag: 'general', hits: 0 };
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    const hits = keywords.filter((k) => lower.includes(k)).length;
    if (hits > best.hits) best = { tag, hits };
  }
  const confidence = best.hits === 0 ? 0.35 : best.hits >= 2 ? 0.9 : 0.65;
  return { tag: best.tag, confidence, source: 'mock-keyword-rule' };
}

function extractField(text, labels) {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:=]?\\s*(.+)`, 'i');
    const m = text.match(re);
    if (m) return m[1].trim().replace(/[.\s]+$/, '');
  }
  return null;
}

export function mockAnalyzeDocument({ type, title, text = '' }) {
  const lower = (text || title || '').toLowerCase();
  const fields = {};
  const vendor = extractField(lower, ['vendor', 'supplier', 'from']);
  if (vendor) fields.vendor = vendor;
  const amount = lower.match(/(?:total|amount|value)[^\d]*(\$|php|usd|₱)?\s*([\d,]+(?:\.\d{2})?)/);
  if (amount) fields.amount = `${amount[1] ? amount[1] + ' ' : ''}${amount[2]}`;
  const po = lower.match(/\b(po[\s-]?\d{4,}|purchase\s?order\s*[#]?\s*\d+)\b/);
  if (po) fields.poNumber = po[1];
  const date = lower.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (date) fields.date = date[1];
  fields.documentType = type;
  const matched = Object.keys(fields).length;
  return { fields, confidence: matched >= 3 ? 0.85 : matched >= 1 ? 0.6 : 0.3, source: 'mock-extraction-rule' };
}

export function mockSuggestWorkflow({ type, status, analysis }) {
  const fields = (analysis && analysis.fields) || {};
  const suggestions = [];
  if (!fields.amount) suggestions.push({ action: 'Request total amount from vendor', reason: 'Missing monetary value for accurate tracking', priority: 'high' });
  if (!fields.vendor) suggestions.push({ action: 'Confirm vendor/supplier name', reason: 'Required for PO matching', priority: 'high' });
  if (status === 'pending') suggestions.push({ action: 'Review document fields', reason: 'Document is pending review', priority: 'medium' });
  if (status === 'in-review') suggestions.push({ action: 'Decide: approve or request revisions', reason: 'Document has been in review', priority: 'medium' });
  if (status === 'approved') suggestions.push({ action: 'File document and log remaining time', reason: 'Approved documents need closure tracking', priority: 'low' });
  suggestions.push({ action: 'Attach related time entries', reason: 'Links effort to document outputs', priority: 'medium' });
  return suggestions.slice(0, 3);
}

export function mockSearch(query, { checkins, documents }) {
  const q = (query || '').toLowerCase();
  if (!q) return { intent: 'general', answer: 'Ask about your time, documents, or who worked on what.', results: [] };
  if (/(how many|total|hours|time spent|logged)/.test(q)) {
    const tag = Object.keys(TAG_KEYWORDS).find((t) => q.includes(t) && t !== 'general') || null;
    const filtered = tag ? checkins.filter((c) => c.tag === tag) : checkins;
    const total = filtered.reduce((s, c) => s + c.hours, 0);
    const scope = tag ? `on ${tag}` : 'across all tags';
    return { intent: 'time-total', answer: `Total logged time ${scope}: ${total.toFixed(1)} hrs across ${filtered.length} check-in(s).`, results: filtered.slice(0, 5) };
  }
  if (/(document|po|quote|requisition|status|approved|pending|review)/.test(q)) {
    const statuses = ['pending', 'in-review', 'approved', 'rejected'].filter((s) => q.includes(s));
    const filtered = documents.filter((d) => (statuses.length ? statuses.includes(d.status) : true));
    return { intent: 'documents', answer: `Found ${filtered.length} matching document(s).`, results: filtered.slice(0, 5) };
  }
  if (/^who /.test(q)) {
    const byUser = {};
    checkins.forEach((c) => { byUser[c.userName] = (byUser[c.userName] || 0) + c.hours; });
    const top = Object.entries(byUser).sort((a, b) => b[1] - a[1])[0];
    return { intent: 'who', answer: top ? `${top[0]} logged the most time: ${top[1].toFixed(1)} hrs.` : 'No data yet.', results: [] };
  }
  const term = q.split(' ')[0];
  const results = checkins.filter((c) => `${c.activities} ${c.tag}`.toLowerCase().includes(term)).slice(0, 5);
  return { intent: 'keyword', answer: `Matched ${results.length} check-in(s) for "${term}".`, results };
}

export function mockTimeInsights(checkins) {
  const insights = [];
  const total = checkins.reduce((s, c) => s + c.hours, 0);
  const tags = {};
  checkins.forEach((c) => { tags[c.tag] = (tags[c.tag] || 0) + c.hours; });
  const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
  insights.push({ title: 'Total logged time', body: `${total.toFixed(1)} hrs across ${checkins.length} check-in(s).`, type: 'summary' });
  if (topTag) insights.push({ title: 'Top activity', body: `${topTag[0]} accounts for the most time at ${topTag[1].toFixed(1)} hrs.`, type: 'pattern' });
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const recent = checkins.filter((c) => new Date(c.date) >= weekAgo).reduce((s, c) => s + c.hours, 0);
  insights.push({ title: 'Last 7 days', body: `You logged ${recent.toFixed(1)} hrs in the last 7 days.`, type: 'trend' });
  return insights;
}

function daysSince(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function mockAnomalies(checkins, documents) {
  const anomalies = [];
  checkins.forEach((c) => {
    if (c.hours > 14) anomalies.push({ entity: `Check-in #${c.id}`, type: 'long-entry', detail: `${c.hours} hrs logged in a single entry${c.activities ? ` — ${c.activities}` : ''}`, severity: 'high' });
    const day = new Date(c.date).getDay();
    if (day === 0 || day === 6) anomalies.push({ entity: `Check-in #${c.id}`, type: 'weekend-entry', detail: 'Time logged on a weekend', severity: 'medium' });
  });
  const perTagDay = {};
  checkins.forEach((c) => {
    const k = `${new Date(c.date).toISOString().slice(0, 10)}|${c.tag}`;
    perTagDay[k] = (perTagDay[k] || 0) + 1;
  });
  Object.entries(perTagDay).forEach(([k, count]) => {
    if (count > 5) anomalies.push({ entity: k, type: 'high-volume', detail: `${count} entries for the same tag on the same day`, severity: 'medium' });
  });
  documents.forEach((d) => {
    if (d.status === 'in-review' && daysSince(d.updatedAt) > 14) anomalies.push({ entity: `Doc #${d.id}`, type: 'stale-review', detail: `${d.title} has been in review for ${daysSince(d.updatedAt)} days`, severity: 'high' });
  });
  return anomalies.slice(0, 8);
}
