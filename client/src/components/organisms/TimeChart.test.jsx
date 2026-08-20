import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('shows every category and value in the compact non-date chart', () => {
    render(<TimeChart dimension="tag" series={[
      { key: 'customer-support', hours: 1094 },
      { key: 'operations', hours: 987.5 },
      { key: 'design', hours: 42 },
    ]} />);

    const chart = screen.getByRole('list', { name: 'Time by tag chart' });
    const rows = within(chart).getAllByRole('listitem');

    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('customer-support')).toBeInTheDocument();
    expect(within(rows[0]).getByText('1,094 hrs')).toBeInTheDocument();
    expect(within(rows[1]).getByText('987.5 hrs')).toBeInTheDocument();
  });

  it('normalizes invalid and negative hour values to zero', () => {
    render(<TimeChart dimension="tag" series={[
      { key: 'negative', hours: -5 },
      { key: 'infinite', hours: Infinity },
      { key: 'invalid', hours: 'not-a-number' },
    ]} />);

    const rows = screen.getAllByRole('listitem');
    rows.forEach((row) => {
      expect(within(row).getByText('0 hrs')).toBeInTheDocument();
      expect(row.querySelector('.compact-chart-track span')).toHaveStyle({ '--chart-value': '0%' });
    });
  });

  it('limits long category lists until the user asks to expand them', () => {
    const series = Array.from({ length: 14 }, (_, index) => ({ key: `User ${index + 1}`, hours: 14 - index }));
    render(<TimeChart dimension="user" series={series} />);

    expect(screen.getByText('Showing top 12 of 14')).toBeInTheDocument();
    const showMore = screen.getByRole('button', { name: 'Show 2 more' });
    expect(showMore.closest('.compact-time-chart')).toBeNull();
    expect(screen.queryByText('User 14')).not.toBeInTheDocument();

    fireEvent.click(showMore);
    expect(screen.getByText('User 14')).toBeInTheDocument();
    expect(screen.getByText('Showing all 14')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show top 12' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Time by user chart' })).toHaveClass('is-expanded');
    expect(document.querySelector('.time-chart-plot-desktop')).toHaveClass('is-hidden');
  });
});
