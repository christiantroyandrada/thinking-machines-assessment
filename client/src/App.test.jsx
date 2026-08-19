import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import { useAppStore } from './store/useAppStore.js';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

beforeEach(() => {
  window.localStorage.clear();
  useAppStore.setState({ currentUser: { id: 1, name: 'James Wong', role: 'admin', department: 'Engineering' } });
  window.fetch = vi.fn(async (url) => {
    if (url.includes('/api/health')) return { ok: true, json: async () => ({ status: 'ok' }) };
    if (url.includes('/api/ai/insights')) return { ok: true, json: async () => ({ insights: [{ title: 'Total logged time', body: '42.0 hrs', type: 'summary' }] }) };
    if (url.includes('/api/ai/anomalies')) return { ok: true, json: async () => ({ anomalies: [] }) };
    if (url.includes('/api/analytics/time')) return { ok: true, json: async () => ({ totalHours: 42, series: [] }) };
    if (url.includes('/api/analytics/documents')) return { ok: true, json: async () => ({ totalDocuments: 9, byStatus: { pending: 3 } }) };
    if (url.includes('/api/checkins')) return { ok: true, json: async () => ({ items: [{ id: 1, tag: 'general', hours: 2, activities: 'x', userName: 'James', department: 'Engineering', date: '2026-08-01' }], total: 1, page: 1, pageSize: 25 }) };
    return { ok: true, json: async () => ({}) };
  });
});

afterEach(() => vi.restoreAllMocks());

describe('App', () => {
  it('renders nav and dashboard', async () => {
    render(<App />);
    expect(screen.getByText('WorkSmart')).toBeTruthy();
    expect(await screen.findByText(/Welcome back/i)).toBeTruthy();
  });
});