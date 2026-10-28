import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconSearch,
  IconClose,
  IconDashboard,
  IconCommunities,
  IconDiscover,
  IconTools,
  IconStudyBuddy,
  IconCompetency,
  IconRoadmap,
  IconFocus,
  IconLeaderboard,
  IconProgress,
  IconProfile
} from './Icons.tsx';
import { loadCommunities } from '../../utilities/storage.ts';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const communities = loadCommunities();

  const baseItems = [
    { id: 'dashboard', title: 'Dashboard', category: 'Navigation', path: '/dashboard', icon: <IconDashboard size={18} />, description: 'Your personalized learning hub & weekly analytics' },
    { id: 'communities', title: 'Communities & Chat', category: 'Social', path: '/', icon: <IconCommunities size={18} />, description: 'Discussion servers, doubts, resources & voice rooms' },
    { id: 'discover', title: 'Discover Communities', category: 'Social', path: '/discover', icon: <IconDiscover size={18} />, description: 'Explore and join active subject cohorts' },
    { id: 'tools-pdf', title: 'PDF Summarizer', category: 'Study Tools', path: '/tools?tab=pdf', icon: <IconTools size={18} />, description: 'Extractive bullet-point PDF document summarization' },
    { id: 'tools-flashcards', title: 'Flashcard Mastery', category: 'Study Tools', path: '/tools?tab=flashcards', icon: <IconTools size={18} />, description: 'Interactive active recall decks' },
    { id: 'tools-quizzes', title: 'Custom Quizzes', category: 'Study Tools', path: '/tools?tab=quizzes', icon: <IconTools size={18} />, description: 'Test yourself with instant feedback' },
    { id: 'study-buddy', title: 'Study Buddies & Peer Tutor', category: 'Peer Learning', path: '/study-buddy', icon: <IconStudyBuddy size={18} />, description: 'Find partners complementary to your skill gaps' },
    { id: 'competency', title: 'Competency Lab', category: 'Diagnostic', path: '/competency', icon: <IconCompetency size={18} />, description: 'Objective diagnostic evaluation & gap analysis' },
    { id: 'assessment', title: 'Take Diagnostic Assessment', category: 'Diagnostic', path: '/assessment', icon: <IconCompetency size={18} />, description: '12-question baseline diagnostic test' },
    { id: 'roadmap', title: 'Learning Roadmap', category: 'Curriculum', path: '/roadmap', icon: <IconRoadmap size={18} />, description: 'Prerequisite-sequenced milestone curriculum' },
    { id: 'focus', title: 'Pomodoro Focus Room', category: 'Productivity', path: '/focus', icon: <IconFocus size={18} />, description: '25-minute timed sprints with shared co-studiers' },
    { id: 'leaderboard', title: 'Cohort Leaderboard', category: 'Gamification', path: '/leaderboard', icon: <IconLeaderboard size={18} />, description: 'XP points, level tiers & weekly rankings' },
    { id: 'progress', title: 'Historical Progress', category: 'Analytics', path: '/progress', icon: <IconProgress size={18} />, description: 'View attempt scores and verified competencies' },
    { id: 'profile', title: 'Student Profile & Settings', category: 'Account', path: '/profile', icon: <IconProfile size={18} />, description: 'Manage goals, bio, interests and saved resources' }
  ];

  // Append community shortcuts
  const communityItems = communities.map((comm) => ({
    id: `comm-${comm.id}`,
    title: comm.name,
    category: 'Community Server',
    path: `/?community=${comm.id}`,
    icon: <span style={{ fontSize: '1.1rem' }}>{comm.icon}</span>,
    description: `${comm.category} • ${comm.memberCount} members`
  }));

  const allItems = [...baseItems, ...communityItems];

  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="quick-search-backdrop" onClick={onClose}>
      <div className="quick-search-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="quick-search-header">
          <IconSearch size={20} className="quick-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="quick-search-input"
            placeholder="Type a page, study tool, or community to jump..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button className="quick-search-close" onClick={onClose} aria-label="Close search">
            <IconClose size={18} />
          </button>
        </div>

        <div className="quick-search-list">
          {filteredItems.length === 0 ? (
            <div className="quick-search-empty">
              <span>No results found for "{query}"</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className={`quick-search-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="item-icon-box">{item.icon}</div>
                <div className="item-details">
                  <div className="item-title-row">
                    <span className="item-title">{item.title}</span>
                    <span className="item-category-pill">{item.category}</span>
                  </div>
                  <span className="item-desc">{item.description}</span>
                </div>
                {idx === selectedIndex && (
                  <span className="item-enter-hint">Press ↵</span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="quick-search-footer">
          <div className="footer-shortcuts">
            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
          <span className="footer-tagline">SkillForge Quick Jump</span>
        </div>
      </div>
    </div>
  );
};

