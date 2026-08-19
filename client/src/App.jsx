import { BrowserRouter, Link, Routes, Route, Navigate } from 'react-router-dom';
import CheckInsPage from './pages/CheckInsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import DocumentDetailPage from './pages/DocumentDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import { useAppStore } from './store/useAppStore.js';
import './styles.css';

export default function App() {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  return (
    <BrowserRouter>
      {!currentUser ? (
        <LoginPage />
      ) : (
        <div className="app">
          <a href="#main" className="skip-link">Skip to content</a>
          <header className="topbar">
            <Link to="/" className="brand">WorkSmart</Link>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/check-ins">Check-ins</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/documents">Documents</Link>
              <Link to="/search">Search</Link>
              {currentUser.role === 'admin' && <Link to="/admin">Admin</Link>}
            </nav>
            <div className="topbar-right">
              <span className="topbar-user">{currentUser.name}</span>
              <button type="button" className="btn-ghost" onClick={() => setCurrentUser(null)}>Switch</button>
              <ThemeToggle />
            </div>
          </header>
          <main id="main" className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/check-ins" element={<CheckInsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              {currentUser.role === 'admin' && <Route path="/admin" element={<AdminPage />} />}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}