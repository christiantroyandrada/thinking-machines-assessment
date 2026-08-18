import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

beforeEach(() => {
  window.fetch = vi.fn(async (url) => {
    if (url.includes('/api/health')) return { ok: true, json: async () => ({ status: 'ok' }) };
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
