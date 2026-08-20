import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/templates/AppShell.jsx';
import CheckInsPage from './pages/CheckInsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import DocumentDetailPage from './pages/DocumentDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { useAppStore } from './store/useAppStore.js';
import './styles.css';

export default function App() {
  const currentUser = useAppStore((s) => s.currentUser);

  return (
    <BrowserRouter>
      {!currentUser ? (
        <LoginPage />
      ) : (
        <AppShell>
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
        </AppShell>
      )}
    </BrowserRouter>
  );
}
