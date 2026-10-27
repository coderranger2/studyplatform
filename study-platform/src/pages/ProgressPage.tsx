import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import {
  loadUserProgress,
  resetUserProgress
} from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';

export const ProgressPage: React.FC = () => {
  const [progressState, setProgressState] = useState(loadUserProgress());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const latestAttempt = progressState.latestAttempt;
  const skillGaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  const handleReset = () => {
    const cleared = resetUserProgress();
    setProgressState(cleared);
    setShowResetConfirm(false);
  };

  const attemptsCount = progressState.assessmentAttempts.length;
  const completedCount = progressState.completedActivityIds.length;

  return (
    <div className="page progress-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Learning & Competency Progress</h1>
          <p className="page-subtitle">
            Historical diagnostic evaluations, activity milestones, and verified skill mastery records.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="btn btn-outline-danger"
          >
            Reset Demo Progress
          </button>
        </div>
      </header>

      {showResetConfirm && (
        <div className="alert alert-warning reset-confirm-box">
          <div>
            <strong>Are you sure you want to reset all demo progress?</strong>
            <p>This will erase stored assessment attempts and activity completion flags from localStorage.</p>
          </div>
          <div className="reset-confirm-actions">
            <button onClick={handleReset} className="btn btn-danger btn-sm">
              Confirm Reset
            </button>
            <button onClick={() => setShowResetConfirm(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress Metric Highlights */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Assessment Submissions</span>
          <span className="stat-value">{attemptsCount}</span>
          <span className="stat-hint">
            {attemptsCount === 0 ? 'No attempts recorded yet' : 'Attempts saved in localStorage'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Latest Overall Score</span>
          <span className="stat-value">
            {latestAttempt ? `${latestAttempt.overallScorePercentage}%` : 'N/A'}
          </span>
          <span className="stat-hint">
            {latestAttempt
              ? `${latestAttempt.correctQuestions}/${latestAttempt.totalQuestions} questions correct`
              : 'Take the assessment to score'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Completed Activities</span>
          <span className="stat-value text-success">{completedCount}</span>
          <span className="stat-hint">Roadmap checkpoints checked off</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Competencies</span>
          <span className="stat-value">{SKILLS.length}</span>
          <span className="stat-hint">HTML, CSS, and JS modules</span>
        </div>
      </section>

      {/* Current Competency Matrix */}
      <section className="section-block">
        <div className="section-title-row">
          <h2 className="section-title">Current Competency Matrix</h2>
          <span className="text-muted">Mastery derived from latest evaluation</span>
        </div>

        <div className="matrix-table-card">
          <table className="progress-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th>Evaluated Score</th>
                <th>Mastery Level</th>
                <th>Prerequisites</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SKILLS.map((skill) => {
                const gap = skillGaps.find((g) => g.skillId === skill.id);
                const score = latestAttempt?.skillScores[skill.id];
                const percentage = score?.percentage ?? 0;
                const total = score?.total ?? 0;
                const correct = score?.correct ?? 0;

                return (
                  <tr key={skill.id}>
                    <td>
                      <strong>{skill.name}</strong>
                    </td>
                    <td>
                      <SkillBadge category={skill.category} />
                    </td>
                    <td>
                      {total > 0 ? (
                        <div className="table-score-cell">
                          <span className="table-score-text">
                            {percentage}% ({correct}/{total})
                          </span>
                          <ProgressBar value={percentage} showPercent={false} height={5} />
                        </div>
                      ) : (
                        <span className="text-muted">Not Evaluated</span>
                      )}
                    </td>
                    <td>
                      <SkillBadge level={gap?.masteryLevel || 'unassessed'} />
                    </td>
                    <td>
                      {skill.prerequisites.length > 0 ? (
                        <div className="prereq-cell-tags">
                          {skill.prerequisites.map((p) => (
                            <span key={p} className="tag-prereq-sm">
                              {SKILL_MAP[p]?.name || p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="tag-none-sm">None</span>
                      )}
                    </td>
                    <td>
                      {gap?.hasGap ? (
                        <span className="badge badge-warning">Gap</span>
                      ) : (
                        <span className="badge badge-success">Proficient</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical Assessment Attempts */}
      <section className="section-block">
        <div className="section-title-row">
          <h2 className="section-title">Assessment History</h2>
          <span className="text-muted">{attemptsCount} Recorded Submission(s)</span>
        </div>

        {attemptsCount === 0 ? (
          <div className="empty-sub-card">
            <p>No historical attempts recorded yet.</p>
            <Link to="/assessment" className="btn btn-sm btn-primary">
              Take First Assessment
            </Link>
          </div>
        ) : (
          <div className="attempts-list">
            {progressState.assessmentAttempts
              .slice()
              .reverse()
              .map((att, idx) => {
                const dateStr = new Date(att.timestamp).toLocaleString();
                const isLatest = att.id === latestAttempt?.id;

                return (
                  <div key={att.id} className="attempt-card">
                    <div className="attempt-header">
                      <div>
                        <span className="attempt-index">Attempt #{attemptsCount - idx}</span>
                        {isLatest && <span className="badge badge-primary">Latest</span>}
                        <span className="attempt-date">{dateStr}</span>
                      </div>
                      <div className="attempt-score-tag">
                        <strong>{att.overallScorePercentage}%</strong> ({att.correctQuestions}/{att.totalQuestions} correct)
                      </div>
                    </div>

                    <div className="attempt-skills-strip">
                      {Object.values(att.skillScores).map((sScore) => {
                        const skill = SKILL_MAP[sScore.skillId];
                        return (
                          <div key={sScore.skillId} className="strip-skill-item">
                            <span className="strip-skill-name">{skill?.name || sScore.skillId}:</span>
                            <span
                              className={`strip-skill-score ${
                                sScore.percentage >= 70 ? 'text-success' : 'text-warning'
                              }`}
                            >
                              {sScore.percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
};
