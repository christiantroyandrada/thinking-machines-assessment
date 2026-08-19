import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore.js';
import ThemeToggle from './ThemeToggle.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/check-ins', label: 'Check-ins' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/documents', label: 'Documents' },
  { to: '/search', label: 'Search' },
  { to: '/admin', label: 'Admin', adminOnly: true },
];

const ACTIVE_LINK = ({ isActive }) => (isActive ? 'active' : '');

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const location = useLocation();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => { close(); }, [location.pathname, close]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || currentUser?.role === 'admin');

  return (
    <>
      <header className="mobile-bar">
        <button type="button" className="hamburger" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link to="/" className="brand">WorkSmart</Link>
      </header>

      {open && (
        <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={close} />
      )}

      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Primary">
        <div className="sidebar-header">
          <Link to="/" className="brand">WorkSmart</Link>
          <button type="button" className="sidebar-close" aria-label="Close navigation" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={ACTIVE_LINK}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-user">{currentUser?.name}</span>
          <div className="sidebar-actions">
            <button type="button" className="btn-ghost" onClick={() => setCurrentUser(null)}>Switch</button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}