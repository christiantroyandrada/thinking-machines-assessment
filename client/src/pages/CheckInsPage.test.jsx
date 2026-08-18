import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInsPage from './CheckInsPage.jsx';

const posts = [];
beforeEach(() => {
  posts.length = 0;
  window.fetch = vi.fn(async (url, opts) => {
    if (url.includes('/api/checkins/parse') && opts && opts.method === 'POST') {
      return { ok: true, json: async () => ({ parsed: { hours: 2, tag: 'general', activities: 'x', valid: true, errors: [] } }) };
    }
    if (url.includes('/api/checkins') && opts && opts.method === 'POST') {
      posts.push(JSON.parse(opts.body));
      return { ok: true, json: async () => ({ id: 99, hours: 2, tag: 'general', activities: 'x', userName: 'James', department: 'Engineering', date: '2026-08-01' }) };
    }
    if (url.includes('/api/checkins')) {
      return { ok: true, json: async () => ({ items: [{ id: 1, tag: 'general', hours: 2, activities: 'x', userName: 'James', department: 'Engineering', date: '2026-08-01' }], total: 1, page: 1, pageSize: 25 }) };
    }
    return { ok: true, json: async () => ({}) };
  });
});
afterEach(() => vi.restoreAllMocks());

describe('CheckInsPage', () => {
  it('lists check-ins', async () => {
    render(<CheckInsPage />);
    expect(await screen.findAllByText(/James|Engineering/i)).toBeTruthy();
  });

  it('creates a check-in from text', async () => {
    render(<CheckInsPage />);
    const input = await screen.findByPlaceholderText(/vendor negotiation/i);
    fireEvent.change(input, { target: { value: '2 hrs #ops did thing' } });
    fireEvent.click(await screen.findByText('Log it'));
    await waitFor(() => expect(posts.length).toBe(1));
    expect(posts[0].text).toBe('2 hrs #ops did thing');
  });

  it('deletes a check-in', async () => {
    let deleted = false;
    window.fetch = vi.fn(async (url, opts) => {
      if (opts && opts.method === 'DELETE' && url.includes('/api/checkins/')) { deleted = true; return { ok: true, status: 204, json: async () => null }; }
      if (url.includes('/api/checkins') && opts && opts.method === 'POST') return { ok: true, json: async () => ({ id: 99, hours: 2, tag: 'general', activities: 'x', userName: 'James', department: 'Engineering', date: '2026-08-01' }) };
      if (url.includes('/api/checkins')) return { ok: true, json: async () => ({ items: [{ id: 7, tag: 'ops', hours: 3, activities: 'ship', userName: 'James', department: 'Engineering', date: '2026-08-01' }], total: 1, page: 1, pageSize: 25 }) };
      return { ok: true, json: async () => ({}) };
    });
    render(<CheckInsPage />);
    fireEvent.click(await screen.findByText('Delete'));
    await waitFor(() => expect(deleted).toBe(true));
  });

  it('edits a check-in', async () => {
    const patches = [];
    window.fetch = vi.fn(async (url, opts) => {
      if (opts && opts.method === 'PATCH' && url.includes('/api/checkins/')) { patches.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({ id: 7, ...JSON.parse(opts.body) }) }; }
      if (url.includes('/api/checkins') && opts && opts.method === 'POST') return { ok: true, json: async () => ({ id: 99, hours: 2, tag: 'general', activities: 'x', userName: 'James', department: 'Engineering', date: '2026-08-01' }) };
      if (url.includes('/api/checkins')) return { ok: true, json: async () => ({ items: [{ id: 7, tag: 'ops', hours: 3, activities: 'ship', userName: 'James', department: 'Engineering', date: '2026-08-01' }], total: 1, page: 1, pageSize: 25 }) };
      return { ok: true, json: async () => ({}) };
    });
    render(<CheckInsPage />);
    fireEvent.click(await screen.findByText('Edit'));
    const hoursInput = await screen.findByLabelText('edit hours');
    fireEvent.change(hoursInput, { target: { value: '9' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(patches.length).toBe(1));
    expect(patches[0].hours).toBe(9);
  });
});
