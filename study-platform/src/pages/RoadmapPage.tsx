import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import { generateRoadmap } from '../engine/roadmapGenerator.ts';
import {
  loadUserProgress,
  toggleActivityCompletion
} from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';
import type { ActivityType } from '../types/index.ts';

export const RoadmapPage: React.FC = () => {
  const [progressState, setProgressState] = useState(loadUserProgress());

  const latestAttempt = progressState.latestAttempt;
  const skillGaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  // Pure deterministic prerequisite-aware roadmap generation
  const roadmap = generateRoadmap(
    SKILLS,
    skillGaps,
    progressState.completedActivityIds
  );

  const handleToggleActivity = (activityId: string) => {
    const updated = toggleActivityCompletion(activityId);
    setProgressState(updated);
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'learn':
        return '📖 Concept Module';
      case 'practice':
        return '💻 Guided Practice';
      case 'project':
        return '🛠️ Milestone Challenge';
      case 'review':
        return '🔍 Review';
    }
  };

  return (
    <div className="page roadmap-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Personalized Learning Roadmap</h1>
          <p className="page-subtitle">
            Prerequisite-aware progression sequenced to resolve skill gaps without skipping foundational dependencies.
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/assessment" className="btn btn-secondary">
            {latestAttempt ? 'Retake Assessment' : 'Take Diagnostic'}
          </Link>
          <Link to="/progress" className="btn btn-secondary">
            View Full Progress
          </Link>
        </div>
      </header>

      {!latestAttempt && (
        <div className="alert alert-info">
          <span>
            ℹ️ You haven't completed a diagnostic assessment yet. All competencies are currently scheduled in foundational sequence. Take the assessment to calibrate your roadmap to specific gaps.
          </span>
        </div>
      )}

      {/* Roadmap Summary Card */}
      <section className="roadmap-progress-card">
        <div className="roadmap-progress-details">
          <h2>Roadmap Completion Status</h2>
          <p>
            {roadmap.completedActivitiesCount} of {roadmap.totalActivities} learning activities completed.
          </p>
          <ProgressBar
            value={roadmap.progressPercentage}
            label="Total Curriculum Progress"
            height={10}
          />
        </div>

        <div className="roadmap-stats-side">
          <div className="r-stat">
            <span className="r-stat-label">Active Gaps</span>
            <span className="r-stat-val text-warning">{roadmap.targetSkillsWithGaps.length}</span>
          </div>
          <div className="r-stat">
            <span className="r-stat-label">Proficient</span>
            <span className="r-stat-val text-success">{roadmap.masteredSkills.length}</span>
          </div>
        </div>
      </section>

      {/* Activities Timeline */}
      <section className="section-block">
        <div className="section-title-row">
          <h2 className="section-title">Prerequisite-Aware Sequence</h2>
          <span className="text-muted">Activities unlock as prerequisites are mastered</span>
        </div>

        <div className="activities-list">
          {roadmap.activities.map((activity, index) => {
            const skill = SKILL_MAP[activity.skillId];
            const isCompleted = activity.status === 'completed';
            const isLocked = activity.status === 'locked';
            const isAvailable = activity.status === 'available';

            return (
              <div
                key={activity.id}
                className={`activity-card act-status-${activity.status} ${
                  activity.isMilestone ? 'act-milestone' : ''
                }`}
              >
                <div className="activity-status-column">
                  <div className={`status-indicator indicator-${activity.status}`}>
                    {isCompleted ? '✓' : isLocked ? '🔒' : index + 1}
                  </div>
                  {index < roadmap.activities.length - 1 && <div className="activity-line" />}
                </div>

                <div className="activity-content-box">
                  <div className="activity-top-bar">
                    <div className="activity-tags">
                      <SkillBadge category={skill?.category} text={skill?.name} />
                      <span className="act-type-tag">{getActivityTypeLabel(activity.type)}</span>
                      {activity.isMilestone && (
                        <span className="badge badge-milestone">⭐ Milestone</span>
                      )}
                    </div>

                    <div className="activity-status-badge">
                      {isCompleted && <span className="status-badge status-badge-done">Completed</span>}
                      {isAvailable && <span className="status-badge status-badge-open">Ready to Learn</span>}
                      {isLocked && <span className="status-badge status-badge-locked">Prerequisite Locked</span>}
                    </div>
                  </div>

                  <h3 className="activity-title">{activity.title}</h3>
                  <p className="activity-description">{activity.description}</p>

                  <div className="activity-footer">
                    <div className="activity-meta">
                      <span className="act-duration">⏱️ ~{activity.estimatedMinutes} mins</span>
                      {isLocked && activity.prerequisiteSkillIds.length > 0 && (
                        <span className="lock-reason">
                          Requires: {activity.prerequisiteSkillIds.map((p) => SKILL_MAP[p]?.name || p).join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="activity-action-btn">
                      <button
                        type="button"
                        onClick={() => handleToggleActivity(activity.id)}
                        disabled={isLocked}
                        className={`btn btn-sm ${
                          isCompleted
                            ? 'btn-outline'
                            : isAvailable
                            ? 'btn-primary'
                            : 'btn-disabled'
                        }`}
                        title={
                          isLocked
                            ? 'Complete prerequisites first to unlock this activity'
                            : isCompleted
                            ? 'Click to mark incomplete'
                            : 'Click to mark completed'
                        }
                      >
                        {isCompleted
                          ? 'Mark Incomplete'
                          : isLocked
                          ? 'Locked'
                          : 'Mark Completed ✓'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
