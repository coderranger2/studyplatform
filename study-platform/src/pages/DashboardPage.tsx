import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { LEARNING_GOALS, getGoalById } from '../data/goals.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import {
  awardXP,
  loadCommunities,
  loadGamificationState,
  loadSelectedGoal,
  loadStudentProfile,
  loadUserProgress,
  saveSelectedGoal
} from '../utilities/storage.ts';
import {
  IconTarget,
  IconFlame,
  IconZap,
  IconArrowRight,
  IconFocus,
  IconCheck,
  IconRoadmap,
  IconSparkles
} from '../components/common/Icons.tsx';
import { showToast } from '../components/common/Toast.tsx';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Load persistent user data
  const [profile] = useState(loadStudentProfile());
  const [gamification] = useState(loadGamificationState());
  const [progress] = useState(loadUserProgress());
  const [currentGoalId, setCurrentGoalId] = useState<string>(loadSelectedGoal());
  const communities = loadCommunities();

  const currentGoalDef = getGoalById(currentGoalId);
  const latestAttempt = progress.latestAttempt;
  const gaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  const totalSkills = SKILLS.length;
  const masteredSkillsCount = gaps.filter((g) => !g.hasGap).length;
  const gapSkillsCount = gaps.filter((g) => g.hasGap && g.totalQuestions > 0).length;
  const completedActivitiesCount = progress.completedActivityIds.length;

  // Daily Study Goals checklist state (persisted locally)
  const [dailyTasks, setDailyTasks] = useState<{ id: string; label: string; xp: number; done: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('skillforge_daily_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: 'task-focus', label: 'Complete 25m Pomodoro Focus Session', xp: 35, done: false },
      { id: 'task-flashcard', label: 'Practice 5 Flashcards in Study Toolkit', xp: 15, done: true },
      { id: 'task-chat', label: 'Share insight or question in Community Chat', xp: 20, done: false }
    ];
  });

  const handleToggleDailyTask = (id: string) => {
    setDailyTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          if (nextDone) {
            awardXP(`daily_task_${id}_${Date.now()}`, t.xp, `Completed daily goal: ${t.label}`);
            showToast(`✓ Completed daily goal! (+${t.xp} XP)`, 'success');
          }
          return { ...t, done: nextDone };
        }
        return t;
      });
      try {
        localStorage.setItem('skillforge_daily_tasks', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const completedTasksCount = dailyTasks.filter((t) => t.done).length;
  const dailyProgressPercent = Math.round((completedTasksCount / dailyTasks.length) * 100);

  // Time-of-day greeting
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  // Switch Goal handler
  const handleGoalChange = (newGoalId: string) => {
    setCurrentGoalId(newGoalId);
    saveSelectedGoal(newGoalId);
    showToast(`Active goal switched to "${getGoalById(newGoalId).title}"`, 'info');
  };

  // Weekly study data for SVG bar chart
  const weeklyData = [
    { day: 'Mon', minutes: 45, xp: 110 },
    { day: 'Tue', minutes: 60, xp: 160 },
    { day: 'Wed', minutes: 30, xp: 80 },
    { day: 'Thu', minutes: 75, xp: 210 },
    { day: 'Fri', minutes: 90, xp: 250 },
    { day: 'Sat', minutes: 45, xp: 130 },
    { day: 'Sun', minutes: 55, xp: 150, isToday: true }
  ];
  const maxMinutes = 90;

  // Filter recommended communities based on goal
  const recommendedCommunities = communities.slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* ========================================================
          1. WELCOME HERO SECTION WITH TASTEFUL 3D GEOMETRY
          ======================================================== */}
      <section className="dashboard-hero-3d">
        <div className="hero-content-col">
          <div className="hero-badge-pill">
            <IconSparkles size={14} className="sparkle-icon" />
            <span>Interactive Learning Dashboard</span>
          </div>

          <h1 className="hero-greeting">
            {greeting}, <span className="greeting-name">{profile.name}</span>
          </h1>

          <p className="hero-subtext">
            Consistency beats intensity. You have maintained a <strong>{gamification.streakDays}-day streak</strong> and verified <strong>{masteredSkillsCount} of {totalSkills}</strong> competencies for <em>{currentGoalDef.title}</em>.
          </p>

          <div className="hero-actions-row">
            <Link to="/roadmap" className="btn btn-primary btn-lg shadow-lift">
              <span>Continue Learning Roadmap</span>
              <IconArrowRight size={17} />
            </Link>
            <Link to="/focus" className="btn btn-secondary btn-lg">
              <IconFocus size={17} />
              <span>Start 25m Focus Sprint</span>
            </Link>
          </div>
        </div>

        {/* 3D Visual Floating Geometry (CSS 3D Transforms) */}
        <div className="hero-3d-stage" aria-hidden="true">
          {/* Main Translucent Glass Sphere */}
          <div className="glass-orb-wrapper">
            <div className="glass-orb-3d">
              <div className="orb-specular" />
              <div className="orb-core" />
              <div className="orb-ring" />
            </div>
          </div>

          {/* Floating Isometric Prism / Crystal Cube */}
          <div className="floating-prism-3d">
            <div className="prism-face face-top" />
            <div className="prism-face face-front" />
            <div className="prism-face face-side" />
            <div className="prism-face face-back" />
            <div className="prism-face face-bottom" />
          </div>

          {/* Floating 3D XP Target Pill */}
          <div className="floating-xp-pill-3d">
            <span className="pill-dot">⚡</span>
            <span>+100 XP Goal</span>
          </div>

          {/* Secondary Mini Glass Sphere */}
          <div className="mini-glass-orb" />

          {/* Ambient Glowing Backdrop Aura */}
          <div className="hero-aura-light" />
        </div>
      </section>

      {/* ========================================================
          2. STATS & DAILY PROGRESS ROW
          ======================================================== */}
      <section className="dashboard-metrics-grid">
        {/* Streak Card */}
        <div className="metric-card-3d card-streak" onClick={() => navigate('/leaderboard')} role="button" tabIndex={0}>
          <div className="metric-icon-bubble bubble-streak">
            <IconFlame size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Study Streak</span>
            <div className="metric-value-row">
              <span className="metric-number">{gamification.streakDays}</span>
              <span className="metric-unit">Days</span>
            </div>
            <span className="metric-hint text-success">🔥 Top 15% cohort streak</span>
          </div>
          <div className="metric-corner-glow" />
        </div>

        {/* Total XP Card */}
        <div className="metric-card-3d card-xp" onClick={() => navigate('/leaderboard')} role="button" tabIndex={0}>
          <div className="metric-icon-bubble bubble-xp">
            <IconZap size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Experience Points</span>
            <div className="metric-value-row">
              <span className="metric-number">{gamification.xp}</span>
              <span className="metric-unit">XP</span>
            </div>
            <span className="metric-hint text-primary">Level {gamification.level} Scholar</span>
          </div>
          <div className="metric-corner-glow" />
        </div>

        {/* Competencies Verified */}
        <div className="metric-card-3d card-skills" onClick={() => navigate('/competency')} role="button" tabIndex={0}>
          <div className="metric-icon-bubble bubble-skills">
            <IconTarget size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Verified Competencies</span>
            <div className="metric-value-row">
              <span className="metric-number">{masteredSkillsCount}</span>
              <span className="metric-unit">/ {totalSkills}</span>
            </div>
            <span className="metric-hint text-warning">
              {gapSkillsCount > 0 ? `${gapSkillsCount} skills to remediate` : '100% verified baseline'}
            </span>
          </div>
          <div className="metric-corner-glow" />
        </div>

        {/* Completed Milestones */}
        <div className="metric-card-3d card-activities" onClick={() => navigate('/roadmap')} role="button" tabIndex={0}>
          <div className="metric-icon-bubble bubble-activities">
            <IconRoadmap size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Roadmap Activities</span>
            <div className="metric-value-row">
              <span className="metric-number">{completedActivitiesCount}</span>
              <span className="metric-unit">Done</span>
            </div>
            <span className="metric-hint text-info">Dependency-sequenced</span>
          </div>
          <div className="metric-corner-glow" />
        </div>
      </section>

      {/* ========================================================
          3. MAIN DASHBOARD SPLIT: PRIMARY CURRICULUM + DAILY TASKS
          ======================================================== */}
      <div className="dashboard-main-grid">
        {/* Left Column: Primary Learning Target & Weekly Activity */}
        <div className="dashboard-col-primary">
          {/* Active Goal Spotlight Card */}
          <article className="card-spotlight">
            <div className="spotlight-header">
              <div className="spotlight-title-group">
                <span className="spotlight-badge">🎯 Active Curriculum Goal</span>
                <h2 className="spotlight-heading">{currentGoalDef.title}</h2>
              </div>

              {/* Goal Selector */}
              <div className="goal-switch-wrapper">
                <select
                  value={currentGoalId}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="goal-dropdown-select"
                  aria-label="Switch active learning goal"
                >
                  {LEARNING_GOALS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="spotlight-desc">{currentGoalDef.description}</p>

            {/* Target Competency Chips */}
            <div className="spotlight-skills-row">
              <span className="skills-sublabel">Core Competencies:</span>
              <div className="chips-flow">
                {currentGoalDef.targetSkillIds.map((sId) => {
                  const skill = SKILL_MAP[sId];
                  const gap = gaps.find((g) => g.skillId === sId);
                  const isMastered = gap && !gap.hasGap;
                  return (
                    <span
                      key={sId}
                      className={`goal-skill-chip ${isMastered ? 'chip-verified' : 'chip-needs-work'}`}
                    >
                      {isMastered && <IconCheck size={13} className="chip-check" />}
                      <span>{skill?.name || sId}</span>
                      <span className="chip-score-tag">
                        {gap?.totalQuestions ? `${gap.scorePercentage}%` : 'Pending'}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Next Recommended Step */}
            <div className="spotlight-next-step">
              <div className="next-step-icon">💡</div>
              <div className="next-step-info">
                <strong>Recommended Next Milestone:</strong>
                <span>
                  {!latestAttempt
                    ? 'Take your 12-question diagnostic assessment to identify exact foundational gaps.'
                    : gapSkillsCount > 0
                    ? `Resolve prerequisite bottleneck: practice concept modules for ${gaps.find((g) => g.hasGap)?.skillName || 'HTML/CSS'}.`
                    : 'All foundational competencies verified! Proceed to advanced synthesis projects.'}
                </span>
              </div>
              <Link
                to={!latestAttempt ? '/assessment' : '/roadmap'}
                className="btn btn-sm btn-primary"
              >
                {!latestAttempt ? 'Take Diagnostic 📝' : 'Open Milestone →'}
              </Link>
            </div>
          </article>

          {/* Weekly Study Activity Vector Chart */}
          <article className="card-chart">
            <div className="card-chart-header">
              <div>
                <h3 className="chart-heading">Weekly Study Sprints & Velocity</h3>
                <span className="chart-sub">Tracked daily focus and assessment time</span>
              </div>
              <div className="chart-legend">
                <span className="legend-total">Total: <strong>6.7 hrs</strong> this week</span>
              </div>
            </div>

            <div className="svg-chart-container">
              <div className="chart-bars-row">
                {weeklyData.map((d) => {
                  const barHeight = Math.round((d.minutes / maxMinutes) * 120);
                  return (
                    <div key={d.day} className={`chart-col ${d.isToday ? 'col-today' : ''}`}>
                      <div className="bar-wrapper" title={`${d.day}: ${d.minutes} mins (${d.xp} XP)`}>
                        <div
                          className="bar-fill"
                          style={{ height: `${barHeight}px` }}
                        >
                          <span className="bar-tooltip">{d.minutes}m</span>
                        </div>
                      </div>
                      <span className="day-label">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        </div>

        {/* Right Column: Daily Goals, Quick Actions & Communities */}
        <div className="dashboard-col-aside">
          {/* Daily Goals Widget */}
          <article className="card-aside daily-goals-widget">
            <div className="widget-header">
              <div className="widget-title-row">
                <span className="widget-icon">⚡</span>
                <h3 className="widget-heading">Daily Study Target</h3>
              </div>
              <span className="widget-percent">{dailyProgressPercent}%</span>
            </div>

            <div className="daily-progress-bar">
              <div className="daily-progress-fill" style={{ width: `${dailyProgressPercent}%` }} />
            </div>

            <div className="daily-tasks-list">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`daily-task-item ${task.done ? 'task-done' : ''}`}
                  onClick={() => handleToggleDailyTask(task.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`task-checkbox ${task.done ? 'checked' : ''}`}>
                    {task.done && <IconCheck size={12} />}
                  </div>
                  <div className="task-content">
                    <span className="task-label">{task.label}</span>
                    <span className="task-xp">+{task.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Quick Action Shortcuts */}
          <article className="card-aside quick-actions-widget">
            <h3 className="widget-heading">Instant Study Tools</h3>
            <div className="quick-actions-list">
              <Link to="/tools?tab=pdf" className="quick-action-btn">
                <span className="action-emoji">📄</span>
                <div>
                  <strong>PDF Summarizer</strong>
                  <span>Line-aware extractive notes</span>
                </div>
              </Link>
              <Link to="/tools?tab=flashcards" className="quick-action-btn">
                <span className="action-emoji">🃏</span>
                <div>
                  <strong>Flashcard Drills</strong>
                  <span>Active recall mastery</span>
                </div>
              </Link>
              <Link to="/study-buddy" className="quick-action-btn">
                <span className="action-emoji">👥</span>
                <div>
                  <strong>Study Buddy Match</strong>
                  <span>Complementary peer pairing</span>
                </div>
              </Link>
              <Link to="/assessment" className="quick-action-btn">
                <span className="action-emoji">📝</span>
                <div>
                  <strong>Diagnostic Test</strong>
                  <span>Evaluate foundational skills</span>
                </div>
              </Link>
            </div>
          </article>

          {/* Recommended Communities */}
          <article className="card-aside communities-preview-widget">
            <div className="widget-header">
              <h3 className="widget-heading">Cohort Study Circles</h3>
              <Link to="/discover" className="link-sm">
                Explore All →
              </Link>
            </div>

            <div className="community-mini-list">
              {recommendedCommunities.map((comm) => (
                <div
                  key={comm.id}
                  className="community-mini-card"
                  onClick={() => navigate(`/communities?community=${comm.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="comm-icon-mini">{comm.icon}</span>
                  <div className="comm-mini-info">
                    <strong>{comm.name}</strong>
                    <span>{comm.memberCount} active learners</span>
                  </div>
                  <span className="comm-open-btn">Chat →</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
