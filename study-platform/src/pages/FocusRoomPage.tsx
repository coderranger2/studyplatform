import React, { useState, useEffect } from 'react';
import type { SkillId } from '../types/index.ts';
import { SKILLS } from '../data/skills.ts';
import { awardXP, unlockBadge } from '../utilities/storage.ts';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface CoStudier {
  name: string;
  avatar: string;
  goal: string;
  timeRemaining: string;
}

export const FocusRoomPage: React.FC = () => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId>('html-structure');
  const [customGoal, setCustomGoal] = useState('Deep focus on responsive layout refactoring');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Simulated active co-studiers in the room
  const coStudiers: CoStudier[] = [
    { name: 'Ananya Sharma', avatar: '👩‍💻', goal: 'HTML semantic elements review', timeRemaining: '18:24' },
    { name: 'Rohan Patel', avatar: '👨‍💻', goal: 'CSS Grid & Flexbox challenges', timeRemaining: '11:45' },
    { name: 'Marcus Chen', avatar: '🧑‍🎓', goal: 'DOM manipulation exercises', timeRemaining: '06:12' },
    { name: 'Sana Khan', avatar: '👩‍🔬', goal: 'Exam paper review', timeRemaining: '22:50' }
  ];

  const handleSessionComplete = React.useCallback(() => {
    if (mode === 'work') {
      setCompletedSessionsCount((c) => c + 1);
      awardXP(`pomodoro_session_${Date.now()}`, 35, `Completed ${workMinutes}m focus session`);
      unlockBadge('badge-pomodoro-focus');
      alert(`🎉 Focus session complete! Great work on "${customGoal}". Take a break!`);
      setMode('shortBreak');
      setTimeLeft(breakMinutes * 60);
    } else {
      alert(`☕ Break time is over! Ready for the next focus sprint?`);
      setMode('work');
      setTimeLeft(workMinutes * 60);
    }
  }, [mode, workMinutes, breakMinutes, customGoal]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleSessionComplete]);

  const handleSwitchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') {
      setTimeLeft(workMinutes * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(breakMinutes * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(workMinutes * 60);
    else if (mode === 'shortBreak') setTimeLeft(breakMinutes * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration =
    mode === 'work' ? workMinutes * 60 : mode === 'shortBreak' ? breakMinutes * 60 : 15 * 60;
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div className="page focus-room-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Pomodoro & Shared Focus Room</h1>
          <p className="page-subtitle">
            Sprint with timed intervals, associate sessions with specific study competencies, and stay accountable alongside co-studiers.
          </p>
        </div>
      </header>

      {/* Honest Prototype Notice */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>
          ℹ️ <strong>Prototype Study Room:</strong> The timer operates fully locally. Active co-studiers and their goals are simulated to demonstrate the shared room experience in this local prototype.
        </span>
      </div>

      <div className="focus-room-layout">
        {/* Main Pomodoro Clock Area */}
        <div className="pomodoro-timer-card">
          {/* Mode Switcher */}
          <div className="pomodoro-tabs">
            <button
              className={`pomodoro-tab ${mode === 'work' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('work')}
            >
              Focus Sprint ({workMinutes}m)
            </button>
            <button
              className={`pomodoro-tab ${mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('shortBreak')}
            >
              Short Break ({breakMinutes}m)
            </button>
            <button
              className={`pomodoro-tab ${mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('longBreak')}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Configurable duration pills */}
          <div className="duration-picker-row" style={{ display: 'flex', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center' }}>Duration:</span>
            {mode === 'work' ? (
              [15, 25, 45, 50].map((mins) => (
                <button
                  key={mins}
                  className={`chip ${workMinutes === mins ? 'chip-active' : ''}`}
                  onClick={() => {
                    setWorkMinutes(mins);
                    if (!isRunning) setTimeLeft(mins * 60);
                  }}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {mins}m
                </button>
              ))
            ) : (
              [5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  className={`chip ${breakMinutes === mins ? 'chip-active' : ''}`}
                  onClick={() => {
                    setBreakMinutes(mins);
                    if (!isRunning) setTimeLeft(mins * 60);
                  }}
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {mins}m
                </button>
              ))
            )}
          </div>

          {/* Digital Time Display */}
          <div className="timer-display-box">
            <div className="time-digits">{formatTime(timeLeft)}</div>
            <span className="mode-label">
              {mode === 'work' ? '🎯 FOCUS TIME' : '☕ REST & RECHARGE'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="timer-progress-track">
            <div
              className="timer-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timer Controls */}
          <div className="timer-controls-row">
            <button
              className={`btn btn-lg ${isRunning ? 'btn-outline-danger' : 'btn-primary'}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause ⏸' : 'Start Focus Sprint ▶'}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handleReset}>
              Reset ↺
            </button>
          </div>

          {/* Study Goal Association */}
          <div className="goal-association-card">
            <h4>Link Session to Study Goal</h4>
            <div className="form-group">
              <label>Current Intention / Milestone</label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="What are you focusing on during this sprint?"
              />
            </div>
            <div className="form-group">
              <label>Target Competency Skill</label>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value as SkillId)}
              >
                {SKILLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="session-summary-footer">
            <span>Completed Today: <strong>{completedSessionsCount} sessions</strong></span>
            <span>•</span>
            <span>Earned: <strong>{completedSessionsCount * 35} XP</strong></span>
          </div>
        </div>

        {/* Right Sidebar: Shared Focus Room Co-Studiers */}
        <aside className="room-participants-sidebar">
          <header className="room-header">
            <h3>🎧 Silent Co-Working Room</h3>
            <span className="room-live-badge">4 Online</span>
          </header>

          <p className="room-desc">
            Co-studiers currently working in this community room.
          </p>

          <ul className="co-studiers-list">
            {coStudiers.map((peer, idx) => (
              <li key={idx} className="co-studier-item">
                <span className="co-avatar">{peer.avatar}</span>
                <div className="co-details">
                  <div className="co-name-row">
                    <strong>{peer.name}</strong>
                    <span className="co-timer">{peer.timeRemaining}</span>
                  </div>
                  <span className="co-goal">🎯 {peer.goal}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};
