import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Sidebar from './Sidebar.jsx';
import { useAppStore } from '../store/useAppStore.js';

beforeEach(() => {
  useAppStore.setState({ currentUser: { id: 1, name: 'Ana', role: 'admin' } });
});

describe('Sidebar mobile drawer', () => {
  it('moves focus into the drawer and returns it when Escape closes it', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });

    fireEvent.click(toggle);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(toggle).toHaveFocus();
  });
});
