import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import * as api from './api.js';
import CheckInsPage from './pages/CheckInsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import DocumentDetailPage from './pages/DocumentDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
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
            <Link to="/admin">Admin</Link>
          </nav>
          <ThemeToggle />
        </header>
        <main id="main" className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/check-ins" element={<CheckInsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
