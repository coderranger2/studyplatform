import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.tsx';
import { ToastContainer } from '../common/Toast.tsx';
import { ErrorBoundary } from '../common/ErrorBoundary.tsx';

interface LayoutProps {
  onResetDemo?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onResetDemo }) => {
  const location = useLocation();
  const isCommunityView =
    location.pathname === '/communities' ||
    location.pathname === '/community';

  return (
    <div className="app-shell">
      <Navbar onResetDemo={onResetDemo} />
      <main className={`main-content ${isCommunityView ? 'main-content-fluid' : ''}`}>
        <div className={isCommunityView ? 'content-fluid' : 'content-container'}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <ToastContainer />
      <footer className="footer">
        <div className="footer-container">
          <p>
            <strong>SkillForge</strong> — Social study platform combining collaborative communities, study tools, gamification, and competency diagnostics.
          </p>
          <span className="footer-meta">Local Demo Mode • Deterministic Engine • Zero External AI Hallucinations</span>
        </div>
      </footer>
    </div>
  );
};
