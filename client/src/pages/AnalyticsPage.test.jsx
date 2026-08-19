import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsPage from './AnalyticsPage';

vi.mock('../api.js', () => ({
  getTimeAnalytics: vi.fn(async (dimension) => ({ totalHours: 7, series: [{ key: 'procurement', hours: 6, count: 2 }] })),
}));

describe('AnalyticsPage', () => {
  it('shows total hours and series', async () => {
    render(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText(/7.0 hrs/)).toBeInTheDocument());
    expect(screen.getByText('By department')).toBeInTheDocument();
  });
});