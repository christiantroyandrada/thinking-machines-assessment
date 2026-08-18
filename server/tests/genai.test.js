import { describe, it, expect } from 'vitest';
import {
  mockCategorize,
  mockAnalyzeDocument,
  mockSuggestWorkflow,
  mockSearch,
  mockTimeInsights,
  mockAnomalies,
} from '../src/services/genai.js';

describe('mockCategorize', () => {
  it('tags procurement text', () => {
    const r = mockCategorize('reviewed vendor quote for procurement team');
    expect(r.tag).toBe('procurement');
    expect(r.confidence).toBeGreaterThan(0.5);
  });
  it('falls back to general', () => {
    expect(mockCategorize('random unrelated words here').tag).toBe('general');
  });
});

describe('mockAnalyzeDocument', () => {
  it('extracts vendor and amount', () => {
    const r = mockAnalyzeDocument({ type: 'PO', title: 'PO', text: 'Vendor: Acme Industrial\nTotal: PHP 500000' });
    expect(r.fields.vendor).toBe('acme industrial');
    expect(r.fields.amount).toContain('500000');
    expect(r.confidence).toBeGreaterThan(0.5);
  });
});

describe('mockSuggestWorkflow', () => {
  it('suggests approval decision for in-review', () => {
    const r = mockSuggestWorkflow({ type: 'PO', status: 'in-review', analysis: { fields: { vendor: 'acme' } } });
    expect(r.some((s) => s.action.toLowerCase().includes('approve'))).toBe(true);
  });
});

describe('mockSearch', () => {
  const checkins = [
    { id: 1, hours: 5, tag: 'procurement', activities: 'vendor negotiation', userName: 'Ana', date: new Date('2026-08-01') },
    { id: 2, hours: 2, tag: 'meeting', activities: 'standup', userName: 'Bob', date: new Date('2026-08-02') },
  ];
  const documents = [{ id: 1, title: 'PO 100', status: 'approved', type: 'PO' }];
  it('answers time totals', () => {
    const r = mockSearch('how many hours on procurement', { checkins, documents });
    expect(r.intent).toBe('time-total');
    expect(r.answer).toContain('5.0 hrs');
  });
  it('finds documents', () => {
    const r = mockSearch('show approved documents', { checkins, documents });
    expect(r.intent).toBe('documents');
    expect(r.results).toHaveLength(1);
  });
});

describe('mockTimeInsights', () => {
  it('summarizes total hours', () => {
    const r = mockTimeInsights([{ hours: 4, tag: 'ops', date: new Date('2026-08-01') }, { hours: 2, tag: 'ops', date: new Date('2026-08-02') }]);
    expect(r[0].body).toContain('6.0 hrs');
  });
});

describe('mockAnomalies', () => {
  it('flags long single entries', () => {
    const r = mockAnomalies([{ id: 1, hours: 20, activities: 'x', date: new Date('2026-08-03') }], []);
    expect(r.some((a) => a.type === 'long-entry')).toBe(true);
  });
  it('flags weekend entries', () => {
    const r = mockAnomalies([{ id: 2, hours: 2, activities: 'y', date: new Date('2026-08-02') }], []);
    expect(r.some((a) => a.type === 'weekend-entry')).toBe(true);
  });
});
