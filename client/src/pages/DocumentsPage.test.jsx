import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentsPage from './DocumentsPage';

vi.mock('../api.js', () => ({
  listDocuments: vi.fn(async () => ({ items: [{ id: 1, title: 'Purchase Order', type: 'PO', status: 'pending', totalTimeSpent: 5, checkInCount: 2 }], total: 1, page: 1, pageSize: 25 })),
  uploadDocument: vi.fn(async () => ({ id: 2, type: 'QUOTE', title: 'Quote' })),
}));

describe('DocumentsPage', () => {
  it('renders documents from the API', async () => {
    render(<MemoryRouter><DocumentsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Purchase Order')).toBeInTheDocument());
    expect(screen.getAllByText('pending').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Status filter')).toBeInTheDocument();
    expect(screen.getByLabelText('Type filter')).toBeInTheDocument();
  });
});
