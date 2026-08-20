import Sidebar from '../organisms/Sidebar.jsx';

export default function AppShell({ children }) {
  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <Sidebar />
      <main id="main" className="content">{children}</main>
    </div>
  );
}
