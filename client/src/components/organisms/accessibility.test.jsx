import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EditCheckInModal from './EditCheckInModal.jsx';
import UploadForm from './UploadForm.jsx';

vi.mock('../../api.js', () => ({
  updateCheckIn: vi.fn(),
  uploadDocument: vi.fn(),
}));

describe('form and dialog accessibility', () => {
  it('gives every upload control an accessible name', () => {
    render(<UploadForm />);

    expect(screen.getByLabelText('Document type')).toBeInTheDocument();
    expect(screen.getByLabelText('Document title')).toBeInTheDocument();
    expect(screen.getByLabelText('Document file')).toHaveAttribute('accept');
  });

  it('opens the edit form as a named dialog and closes it with Escape', () => {
    const onClose = vi.fn();
    render(
      <EditCheckInModal
        checkIn={{ id: 1, hours: 2, tag: 'ops', activities: 'Review', date: '2026-08-01' }}
        onSaved={() => {}}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Edit check-in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Hours')).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
