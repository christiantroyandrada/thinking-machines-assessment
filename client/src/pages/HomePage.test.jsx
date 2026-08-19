import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './HomePage';

vi.mock('../api.js', () => ({
  getInsights: vi.fn(async () => ({ insights: [{ title: 'Total logged time', body: '42.0 hrs across 100 check-ins.', type: 'summary' }] })),
  getAnomalies: vi.fn(async () => ({ anomalies: [{ entity: 'Check-in #5', type: 'long-entry', detail: '20 hrs in one entry', severity: 'high' }] })),
  getTimeAnalytics: vi.fn(async () => ({ totalHours: 42, series: [] })),
  getDocumentAnalytics: vi.fn(async () => ({ totalDocuments: 9, byStatus: { pending: 3, approved: 2 } })),
}));

describe('HomePage dashboard', () => {
  it('shows insights and anomalies', async () => {
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText(/42.0 hrs/)).toBeInTheDocument());
    expect(screen.getByText(/20 hrs in one entry/)).toBeInTheDocument();
  });

  it('shows document status summary', async () => {
    render(<HomePage />);
    await waitFor(() => expect(screen.getByText('9')).toBeInTheDocument());
  });
});