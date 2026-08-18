import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentsPage from './DocumentsPage';

vi.mock('../api.js', () => ({
  listDocuments: vi.fn(async () => ({ documents: [{ id: 1, title: 'Purchase Order', type: 'PO', status: 'pending', totalTimeSpent: 5, linkedCheckIns: 2 }] })),
  uploadDocument: vi.fn(async () => ({ id: 2, type: 'QUOTE', title: 'Quote' })),
}));

describe('DocumentsPage', () => {
  it('renders documents from the API', async () => {
    render(<MemoryRouter><DocumentsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Purchase Order')).toBeInTheDocument());
    expect(screen.getAllByText('pending').length).toBeGreaterThan(0);
  });
});
