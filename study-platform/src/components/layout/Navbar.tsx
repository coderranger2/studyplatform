import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { loadGamificationState, loadStudentProfile } from '../../utilities/storage.ts';

interface NavbarProps {
  onResetDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gamification, setGamification] = useState(loadGamificationState());
  const [profile, setProfile] = useState(loadStudentProfile());
  const navigate = useNavigate();

  // Refresh gamification status periodically or on focus
  useEffect(() => {
    const refresh = () => {
      setGamification(loadGamificationState());
      setProfile(loadStudentProfile());
    };
    window.addEventListener('focus', refresh);
    const interval = setInterval(refresh, 2500);
    return () => {
      window.removeEventListener('focus', refresh);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="brand-icon">⚡</span>
          <div className="brand-text">
            <span className="brand-title">SkillForge</span>
            <span className="brand-subtitle">Social Study Platform</span>
          </div>
        </NavLink>

        {/* Desktop Nav Links */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'navbar-nav-mobile-open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">💬</span>
            <span>Communities</span>
          </NavLink>
          <NavLink
            to="/discover"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🧭</span>
            <span>Discover</span>
          </NavLink>
          <NavLink
            to="/tools"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🧰</span>
            <span>Study Tools</span>
          </NavLink>
          <NavLink
            to="/study-buddy"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🤖</span>
            <span>Study Buddy</span>
          </NavLink>
          <NavLink
            to="/competency"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">📊</span>
            <span>Competency Lab</span>
          </NavLink>
          <NavLink
            to="/teachers"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">👨‍🏫</span>
            <span>Teachers</span>
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🏆</span>
            <span>Leaderboard</span>
          </NavLink>
          <NavLink
            to="/focus"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">⏱️</span>
            <span>Focus</span>
          </NavLink>
        </nav>

        {/* Right Actions & Gamification Status */}
        <div className="navbar-actions">
          {/* Quick Streak & XP Badge */}
          <div
            className="gamification-pill"
            onClick={() => navigate('/leaderboard')}
            title="Your current streak and XP level. Click to view leaderboard & badges!"
          >
            <span className="streak-indicator">🔥 {gamification.streakDays}d</span>
            <span className="divider">|</span>
            <span className="xp-indicator">⚡ {gamification.xp} XP</span>
            <span className="level-badge">Lvl {gamification.level}</span>
          </div>

          {/* Student Profile Quick View */}
          <NavLink
            to="/profile"
            className="user-profile-btn"
            title={`${profile.name} (${profile.handle}) - Click to manage profile & settings`}
          >
            <span className="avatar-icon">{profile.avatar || '🎓'}</span>
            <span className="user-name-short">{profile.name.split(' ')[0]}</span>
          </NavLink>

          {/* Reset Demo */}
          {onResetDemo && (
            <button
              onClick={onResetDemo}
              className="btn-outline-sm reset-btn"
              title="Reset saved study community, assessment, and activity progress"
            >
              Reset Demo
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
};
