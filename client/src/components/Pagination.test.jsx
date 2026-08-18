import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders page info and disables prev on first page', () => {
    render(<Pagination page={1} pageSize={25} total={100} onChange={() => {}} />);
    expect(screen.getByText(/Page 1 of 4/)).toBeInTheDocument();
    expect(screen.getByText('‹ Prev')).toBeDisabled();
  });
  it('calls onChange with next page', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageSize={25} total={100} onChange={onChange} />);
    fireEvent.click(screen.getByText('Next ›'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
