import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInForm from './CheckInForm';

vi.mock('../../api.js', () => ({
  parseCheckIn: vi.fn(async (text) => ({ parsed: { hours: 2, tag: 'general', activities: text, valid: true, errors: [] } })),
  createCheckIn: vi.fn(async () => ({ id: 1 })),
}));

describe('CheckInForm smart tag', () => {
  it('shows a smart-tag hint when the parser returns general', async () => {
    render(<CheckInForm onCreated={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/vendor negotiation/i), { target: { value: '2 hrs vendor negotiation' } });
    await waitFor(() => expect(screen.getByText(/smart tag/i)).toBeInTheDocument());
  });
});
