import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { loadGamificationState, loadStudentProfile } from '../../utilities/storage.ts';

interface NavbarProps {
  onResetDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [gamification, setGamification] = useState(loadGamificationState());
  const [profile, setProfile] = useState(loadStudentProfile());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  // Refresh gamification status periodically, on window focus, or on reset event
  useEffect(() => {
    const refresh = () => {
      setGamification(loadGamificationState());
      setProfile(loadStudentProfile());
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('skillforge-reset', refresh);
    const interval = setInterval(refresh, 2500);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('skillforge-reset', refresh);
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
            className={({ isActive }) => `nav-link ${isActive || location.pathname === '/dashboard' ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/communities"
            className={({ isActive }) => `nav-link ${isActive || location.pathname.startsWith('/community') ? 'nav-link-active' : ''}`}
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
            <span className="nav-icon">👥</span>
            <span>Study Buddies</span>
          </NavLink>
          <NavLink
            to="/competency"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🧪</span>
            <span>Competency Lab</span>
          </NavLink>
          <NavLink
            to="/roadmap"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="nav-icon">🎯</span>
            <span>Roadmap</span>
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

          {/* Student Profile & Settings Dropdown */}
          <div className="navbar-profile-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`user-profile-btn navbar-profile-trigger ${profileDropdownOpen ? 'active' : ''}`}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              title={`${profile.name} (${profile.handle}) - View options & settings`}
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
            >
              <span className="avatar-icon">{profile.avatar || '🎓'}</span>
              <span className="user-name-short">{profile.name.split(' ')[0]}</span>
              <span className="profile-caret">{profileDropdownOpen ? '▴' : '▾'}</span>
            </button>

            {profileDropdownOpen && (
              <div className="profile-dropdown-menu" role="menu">
                <div className="profile-menu-header">
                  <div className="profile-menu-avatar">{profile.avatar || '🎓'}</div>
                  <div className="profile-menu-info">
                    <span className="profile-menu-name">{profile.name}</span>
                    <span className="profile-menu-handle">{profile.handle}</span>
                    <div className="profile-menu-badges">
                      <span className="role-tag">Student</span>
                      <span className="level-tag">Lvl {gamification.level}</span>
                      <span className="xp-tag">⚡ {gamification.xp} XP</span>
                    </div>
                  </div>
                </div>

                <div className="profile-menu-divider" />

                <div className="profile-menu-links">
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/dashboard');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">📈</span>
                    <span className="item-label">Learning Dashboard</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/profile');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">👤</span>
                    <span className="item-label">Student Profile & Bio</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/roadmap');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">🎯</span>
                    <span className="item-label">Study Roadmap & Goals</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/competency');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">📊</span>
                    <span className="item-label">Competency Diagnostics</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/focus');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">⏱️</span>
                    <span className="item-label">Pomodoro Focus Room</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/leaderboard');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">🏆</span>
                    <span className="item-label">Leaderboard & Badges</span>
                  </button>

                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      navigate('/tools');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <span className="item-icon">🧰</span>
                    <span className="item-label">Study Tools (PDFs & Decks)</span>
                  </button>
                </div>

                <div className="profile-menu-divider" />

                <div className="profile-menu-footer">
                  <div className="profile-menu-status">
                    <span className="status-dot online" />
                    <span>Connected to Local Workspace</span>
                  </div>

                  {onResetDemo && (
                    <button
                      className="profile-menu-reset-btn"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onResetDemo();
                      }}
                      title="Reset all demo progress"
                    >
                      🔄 Reset Demo Data
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

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
