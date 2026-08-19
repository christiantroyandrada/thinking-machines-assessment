import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInsPage from './CheckInsPage';

const mocks = vi.hoisted(() => ({
  listCheckIns: vi.fn(),
  getUsers: vi.fn(),
  deleteCheckIn: vi.fn(),
  createCheckIn: vi.fn(),
  updateCheckIn: vi.fn(),
  parseCheckIn: vi.fn(),
}));

vi.mock('../api.js', () => mocks);

const row = { id: 1, tag: 'procurement', hours: 2, activities: 'vendor negotiation', userName: 'Ana', department: 'Procurement', date: '2026-08-01T00:00:00.000Z' };

beforeEach(() => {
  window.localStorage.clear();
  window.confirm = vi.fn(() => true);
  mocks.listCheckIns.mockResolvedValue({ items: [row], total: 1, page: 1, pageSize: 25 });
  mocks.getUsers.mockResolvedValue({ users: [{ id: 1, name: 'Ana', department: 'Procurement', role: 'user' }] });
  mocks.deleteCheckIn.mockResolvedValue(null);
  mocks.createCheckIn.mockResolvedValue({ id: 9, ...row });
  mocks.updateCheckIn.mockResolvedValue({ id: 1, hours: 5, tag: 'ops', activities: 'x', date: '2026-08-01T00:00:00.000Z' });
  mocks.parseCheckIn.mockResolvedValue({ parsed: { hours: 2, tag: 'general', activities: 'x', valid: true, errors: [] } });
});

describe('CheckInsPage', () => {
  it('renders check-ins from the API', async () => {
    render(<CheckInsPage />);
    await waitFor(() => expect(screen.getByText('vendor negotiation')).toBeInTheDocument());
    expect(screen.getByText('#procurement')).toBeInTheDocument();
  });

  it('creates a check-in from text', async () => {
    render(<CheckInsPage />);
    const input = await screen.findByPlaceholderText(/vendor negotiation/i);
    fireEvent.change(input, { target: { value: '2 hrs #ops did thing' } });
    fireEvent.click(screen.getByText('Log it'));
    await waitFor(() => expect(mocks.createCheckIn).toHaveBeenCalled());
    expect(mocks.createCheckIn.mock.calls[0][0]).toEqual({ text: '2 hrs #ops did thing' });
  });

  it('deletes a check-in after confirm', async () => {
    render(<CheckInsPage />);
    fireEvent.click(await screen.findByText('Delete'));
    await waitFor(() => expect(mocks.deleteCheckIn).toHaveBeenCalledWith(1));
  });

  it('edits a check-in through the modal', async () => {
    render(<CheckInsPage />);
    fireEvent.click(await screen.findByText('Edit'));
    const hoursInput = await screen.findByLabelText('Hours');
    fireEvent.change(hoursInput, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(mocks.updateCheckIn).toHaveBeenCalled());
  });
});