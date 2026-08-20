import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getTimeAnalytics } from '../api.js';
import AnalyticsPage from './AnalyticsPage.jsx';

vi.mock('../api.js', () => ({
  getTimeAnalytics: vi.fn(async (dimension) => ({ totalHours: 7, series: [{ key: 'procurement', hours: 6, count: 2 }] })),
}));

describe('AnalyticsPage', () => {
  it('shows total hours and series', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText('7 hours across 1 tag')).toBeInTheDocument());
    expect(screen.getByText('By department')).toBeInTheDocument();
  });

  it('does not relabel stale results while changing dimensions', async () => {
    let resolveUsers;
    getTimeAnalytics
      .mockResolvedValueOnce({ totalHours: 7, series: [{ key: 'procurement', hours: 7 }] })
      .mockImplementationOnce(() => new Promise((resolve) => { resolveUsers = resolve; }));

    render(<AnalyticsPage />);
    await screen.findByText('7 hours across 1 tag');
    fireEvent.click(screen.getByRole('button', { name: 'By user' }));

    expect(screen.getByText('Updating chart…')).toBeInTheDocument();
    expect(screen.queryByText('7 hours across 1 user')).not.toBeInTheDocument();

    resolveUsers({ totalHours: 4, series: [{ key: 'James Wong', hours: 4 }] });
    await waitFor(() => expect(screen.getByText('4 hours across 1 user')).toBeInTheDocument());
  });
});
