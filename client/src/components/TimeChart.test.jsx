import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TimeChart from './TimeChart.jsx';

describe('TimeChart', () => {
  it('provides the chart values as accessible text', () => {
    render(<TimeChart dimension="date" series={[
      { key: '2026-08-01', hours: 2 },
      { key: '2026-08-02', hours: 3.5 },
    ]} />);

    expect(screen.getByRole('table', { name: 'Time by date data' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '3.5 hours' })).toBeInTheDocument();
  });
});
