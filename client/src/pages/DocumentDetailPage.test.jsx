import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DocumentDetailPage from './DocumentDetailPage';

vi.mock('../api.js', () => ({
  getDocument: vi.fn(async (id) => ({ id: Number(id), title: 'PO #1', type: 'PO', status: 'in-review', filename: 'po1.txt', totalTimeSpent: 3, checkIns: [{ id: 9, hours: 3, activities: 'reviewed PO', date: '2026-08-01', tag: 'procurement', user: { name: 'Ana' } }] })),
  updateDocument: vi.fn(async () => ({})),
  createCheckIn: vi.fn(async () => ({})),
  analyzeDocument: vi.fn(async () => ({ analysis: { fields: { vendor: 'acme industrial', amount: 'PHP 500000' }, confidence: 0.85 } })),
  suggestDocument: vi.fn(async () => ({ suggestions: [{ action: 'Decide: approve or request revisions', reason: 'Document has been in review', priority: 'medium' }] })),
}));

describe('DocumentDetailPage', () => {
  it('shows document info and linked check-ins', async () => {
    render(
      <MemoryRouter initialEntries={['/documents/1']}>
        <Routes><Route path="/documents/:id" element={<DocumentDetailPage />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('PO #1')).toBeInTheDocument());
    expect(screen.getByText('reviewed PO')).toBeInTheDocument();
    expect(screen.getByText('3.0 hr')).toBeInTheDocument();
  });

  it('analyzes and suggests', async () => {
    render(
      <MemoryRouter initialEntries={['/documents/1']}>
        <Routes><Route path="/documents/:id" element={<DocumentDetailPage />} /></Routes>
      </MemoryRouter>
    );
    fireEvent.click(await screen.findByText('Analyze with AI'));
    await waitFor(() => expect(screen.getByText('acme industrial')).toBeInTheDocument());
    expect(screen.getByText('Decide: approve or request revisions')).toBeInTheDocument();
  });
});
