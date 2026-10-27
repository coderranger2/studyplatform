import React, { useState } from 'react';
import { loadBadges, loadGamificationState, loadLeaderboard } from '../utilities/storage.ts';

export const LeaderboardPage: React.FC = () => {
  const [gamification] = useState(loadGamificationState());
  const [badges] = useState(loadBadges());
  const [leaderboard] = useState(loadLeaderboard());

  const currentLevel = gamification.level;
  const currentXP = gamification.xp;
  const currentLevelBaseXP = (currentLevel - 1) * 250;
  const progressInLevel = Math.max(0, currentXP - currentLevelBaseXP);
  const progressPercent = Math.min(100, Math.round((progressInLevel / 250) * 100));

  const unlockedBadges = badges.filter((b) => b.unlockedAt);
  const lockedBadges = badges.filter((b) => !b.unlockedAt);

  return (
    <div className="page leaderboard-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Study Gamification & Leaderboard</h1>
          <p className="page-subtitle">
            Earn experience points by solving diagnostic assessments, completing roadmap milestones, reviewing flashcards, and maintaining focus streaks.
          </p>
        </div>
      </header>

      {/* Honest Prototype Notice */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>
          ℹ️ <strong>Local Demo Leaderboard:</strong> Your XP, badges, and streaks are earned from actual platform activities. Peer profiles on the leaderboard are simulated locally to demonstrate the social ranking experience.
        </span>
      </div>

      {/* Stats Summary Grid */}
      <section className="gamification-summary-grid">
        <div className="summary-stat-card">
          <span className="stat-label">Current Level</span>
          <div className="stat-highlight">
            <span className="level-number">Level {currentLevel}</span>
          </div>
          <div className="level-progress-wrapper">
            <div className="progress-info-row">
              <span>{progressInLevel} / 250 XP</span>
              <span>{progressPercent}% to Lvl {currentLevel + 1}</span>
            </div>
            <div className="level-bar-track">
              <div className="level-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="summary-stat-card">
          <span className="stat-label">Total Experience</span>
          <div className="stat-highlight">
            <span className="xp-number">⚡ {currentXP} XP</span>
          </div>
          <span className="stat-subtext">Earned through verified study milestones</span>
        </div>

        <div className="summary-stat-card">
          <span className="stat-label">Study Streak</span>
          <div className="stat-highlight">
            <span className="streak-number">🔥 {gamification.streakDays} Days</span>
          </div>
          <span className="stat-subtext">Active daily study streak</span>
        </div>

        <div className="summary-stat-card">
          <span className="stat-label">Badges Unlocked</span>
          <div className="stat-highlight">
            <span className="badge-number">🏆 {unlockedBadges.length} / {badges.length}</span>
          </div>
          <span className="stat-subtext">Achievements unlocked in profile</span>
        </div>
      </section>

      {/* Main Layout: Leaderboard Table on Left, Badges & How to Earn on Right */}
      <div className="leaderboard-layout-grid">
        {/* Left: Leaderboard Table */}
        <section className="leaderboard-table-card">
          <header className="card-header">
            <h2>🏆 Weekly Cohort Leaderboard</h2>
            <span className="cohort-tag">Cohort: Fall 2026</span>
          </header>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Learner</th>
                <th>Subject</th>
                <th>Streak</th>
                <th>XP Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.id}
                  className={`leaderboard-row ${entry.isCurrentUser ? 'current-user-row' : ''}`}
                >
                  <td className="rank-cell">
                    {entry.rank === 1 ? (
                      <span className="medal gold">🥇 1</span>
                    ) : entry.rank === 2 ? (
                      <span className="medal silver">🥈 2</span>
                    ) : entry.rank === 3 ? (
                      <span className="medal bronze">🥉 3</span>
                    ) : (
                      <span className="rank-number">#{entry.rank}</span>
                    )}
                  </td>
                  <td className="user-cell">
                    <span className="user-avatar">{entry.avatar}</span>
                    <div className="user-meta">
                      <strong>
                        {entry.name} {entry.isCurrentUser ? '(You)' : ''}
                      </strong>
                      <span className="user-sub">Lvl {entry.level} • {entry.badgeCount} badges</span>
                    </div>
                  </td>
                  <td>
                    <span className="subject-tag">{entry.primarySubject}</span>
                  </td>
                  <td>
                    <span className="streak-tag">🔥 {entry.streakDays}d</span>
                  </td>
                  <td className="xp-cell">
                    <strong>{entry.xp} XP</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Right: Badges & Earning Rules */}
        <aside className="badges-aside">
          {/* Unlocked Badges */}
          <section className="badges-card">
            <h3>Unlocked Achievements ({unlockedBadges.length})</h3>
            <div className="badges-grid">
              {unlockedBadges.map((badge) => (
                <div key={badge.id} className="badge-item unlocked">
                  <span className="badge-icon">{badge.icon}</span>
                  <div className="badge-info">
                    <h4>{badge.title}</h4>
                    <p>{badge.description}</p>
                    <time>Unlocked {badge.unlockedAt}</time>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Locked Badges */}
          <section className="badges-card">
            <h3>In Progress ({lockedBadges.length})</h3>
            <div className="badges-grid">
              {lockedBadges.map((badge) => (
                <div key={badge.id} className="badge-item locked">
                  <span className="badge-icon">🔒</span>
                  <div className="badge-info">
                    <h4>{badge.title}</h4>
                    <p>{badge.description}</p>
                    <span className="locked-tag">Not yet unlocked</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* XP Earning Rules */}
          <section className="earning-rules-card">
            <h3>How to Earn XP (Deduplicated)</h3>
            <ul className="earning-list">
              <li>
                <span className="earn-action">Take Diagnostic Assessment</span>
                <span className="earn-val">+200 XP</span>
              </li>
              <li>
                <span className="earn-action">Create a Study Circle</span>
                <span className="earn-val">+100 XP</span>
              </li>
              <li>
                <span className="earn-action">Create Custom Quiz</span>
                <span className="earn-val">+80 XP</span>
              </li>
              <li>
                <span className="earn-action">Create Flashcard Deck</span>
                <span className="earn-val">+60 XP</span>
              </li>
              <li>
                <span className="earn-action">Complete Roadmap Milestone</span>
                <span className="earn-val">+50 XP</span>
              </li>
              <li>
                <span className="earn-action">Complete Pomodoro Focus Sprint</span>
                <span className="earn-val">+35 XP</span>
              </li>
              <li>
                <span className="earn-action">Share Resource in Community</span>
                <span className="earn-val">+40 XP</span>
              </li>
              <li>
                <span className="earn-action">Review Flashcards in Toolkit</span>
                <span className="earn-val">+5 XP</span>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};
