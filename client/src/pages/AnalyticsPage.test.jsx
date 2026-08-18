import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from './AnalyticsPage.jsx';

beforeEach(() => {
  window.fetch = vi.fn(async (url) => {
    if (url.includes('/api/analytics/time')) return { ok: true, json: async () => ({ series: [{ key: 'dev', hours: 8 }] }) };
    if (url.includes('/api/analytics/time/departments')) return { ok: true, json: async () => ({ departments: [{ department: 'Engineering', totalHours: 10, avgHoursPerUser: 5 }] }) };
    if (url.includes('/api/analytics/documents')) return { ok: true, json: async () => ({ documents: [{ id: 1, title: 'PO-1', linkedHours: 3, linkedCheckIns: 2 }] }) };
    return { ok: true, json: async () => ({}) };
  });
});
afterEach(() => vi.restoreAllMocks());

describe('AnalyticsPage', () => {
  it('renders analytics sections', async () => {
    render(<AnalyticsPage />);
    expect(await screen.findByText('Analytics')).toBeTruthy();
    expect(await screen.findAllByText(/dev|Engineering|PO-1/i)).toBeTruthy();
  });
});
