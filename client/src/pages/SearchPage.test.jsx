import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from './SearchPage';

vi.mock('../api.js', () => ({
  searchAI: vi.fn(async () => ({ intent: 'time-total', answer: 'Total logged time on procurement: 12.0 hrs.', results: [{ id: 1, hours: 4, tag: 'procurement', activities: 'vendor negotiation' }] })),
}));

describe('SearchPage', () => {
  it('asks a question and shows the answer', async () => {
    render(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText(/ask/i), { target: { value: 'how many hours on procurement' } });
    fireEvent.click(screen.getByText('Ask AI'));
    await waitFor(() => expect(screen.getByText(/12.0 hrs/)).toBeInTheDocument());
    expect(screen.getByText('vendor negotiation')).toBeInTheDocument();
  });
});
