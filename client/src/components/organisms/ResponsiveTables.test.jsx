import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CheckInTable from './CheckInTable.jsx';
import DocumentTable from './DocumentTable.jsx';

describe('responsive record tables', () => {
  it('provides mobile labels for check-in fields and actions', () => {
    render(<CheckInTable items={[{
      id: 1,
      date: '2026-08-01',
      hours: 2,
      tag: 'ops',
      activities: 'Inspect line',
      userName: 'Ana',
      department: 'Operations',
    }]} />);

    expect(screen.getByText('Inspect line').closest('td')).toHaveAttribute('data-label', 'Activities');
    expect(screen.getByRole('button', { name: 'Edit' }).closest('td')).toHaveAttribute('data-label', 'Actions');
  });

  it('provides mobile labels for document fields', () => {
    render(<MemoryRouter><DocumentTable items={[{
      id: 3,
      title: 'Purchase order',
      type: 'PO',
      status: 'pending',
      totalTimeSpent: 2,
      checkInCount: 1,
    }]} /></MemoryRouter>);

    expect(screen.getByText('Purchase order').closest('td')).toHaveAttribute('data-label', 'Document');
    expect(screen.getByText('1').closest('td')).toHaveAttribute('data-label', 'Linked entries');
  });
});
