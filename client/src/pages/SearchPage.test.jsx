import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchPage from './SearchPage';
import { searchAI } from '../api.js';

vi.mock('../api.js', () => ({
  searchAI: vi.fn(async () => ({ intent: 'time-total', answer: 'Total logged time on procurement: 12.0 hrs.', results: [{ id: 1, hours: 4, tag: 'procurement', activities: 'vendor negotiation' }] })),
}));

describe('SearchPage', () => {
  it('asks a question and shows the answer', async () => {
    render(<MemoryRouter><SearchPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText(/ask/i), { target: { value: 'how many hours on procurement' } });
    fireEvent.click(screen.getByText('Ask AI'));
    await waitFor(() => expect(screen.getByText(/12.0 hrs/)).toBeInTheDocument());
    expect(screen.getByText('vendor negotiation')).toBeInTheDocument();
  });

  it('renders document matches without check-in placeholders', async () => {
    vi.mocked(searchAI).mockResolvedValueOnce({
      intent: 'documents',
      answer: 'Found 1 matching document.',
      results: [{ id: 7, title: 'Purchase order 2026-17', type: 'PO', status: 'approved' }],
    });
    render(<MemoryRouter><SearchPage /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText(/ask/i), { target: { value: 'show approved documents' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));

    expect(await screen.findByRole('link', { name: 'Purchase order 2026-17' })).toHaveAttribute('href', '/documents/7');
    expect(screen.getByText('PO · approved')).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });
});
