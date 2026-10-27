import React from 'react';
import { Link } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import { loadUserProgress } from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';

export const DashboardPage: React.FC = () => {
  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;
  const gaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  const totalSkills = SKILLS.length;
  const masteredSkillsCount = gaps.filter((g) => !g.hasGap).length;
  const gapSkillsCount = gaps.filter((g) => g.hasGap && g.totalQuestions > 0).length;
  const unassessedCount = gaps.filter((g) => g.masteryLevel === 'unassessed').length;
  const completedActivitiesCount = progress.completedActivityIds.length;

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Competency Dashboard</h1>
          <p className="page-subtitle">
            Master HTML, CSS, and JavaScript through diagnostic evaluation, targeted gap remediation, and prerequisite-aligned activities.
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/assessment" className="btn btn-primary">
            {latestAttempt ? 'Retake Assessment' : 'Start Diagnostic Assessment'}
          </Link>
          <Link to="/roadmap" className="btn btn-secondary">
            View Learning Roadmap
          </Link>
        </div>
      </header>

      {/* Metric Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Assessment Status</span>
          <span className="stat-value">
            {latestAttempt ? `${latestAttempt.overallScorePercentage}%` : 'Not Taken'}
          </span>
          <span className="stat-hint">
            {latestAttempt ? `${latestAttempt.correctQuestions} / ${latestAttempt.totalQuestions} questions correct` : 'Complete the diagnostic to discover gaps'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Proficient Skills</span>
          <span className="stat-value text-success">
            {masteredSkillsCount} <span className="stat-sub">/ {totalSkills}</span>
          </span>
          <span className="stat-hint">Skills verified at ≥ 70% threshold</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Detected Skill Gaps</span>
          <span className="stat-value text-warning">
            {gapSkillsCount}
          </span>
          <span className="stat-hint">
            {unassessedCount > 0 ? `${unassessedCount} unassessed skill(s)` : 'Priority areas on your roadmap'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Activities Completed</span>
          <span className="stat-value text-info">
            {completedActivitiesCount}
          </span>
          <span className="stat-hint">Roadmap modules marked complete</span>
        </div>
      </section>

      {/* Curriculum & Skills Overview */}
      <section className="section-block">
        <div className="section-title-row">
          <h2 className="section-title">Core Competencies & Prerequisite Flow</h2>
          <span className="text-muted">6 Core Web Development Competencies</span>
        </div>

        <div className="skills-grid">
          {SKILLS.map((skill) => {
            const gap = gaps.find((g) => g.skillId === skill.id);
            const score = latestAttempt?.skillScores[skill.id];
            const hasPrereqs = skill.prerequisites.length > 0;

            return (
              <div key={skill.id} className="skill-card">
                <div className="skill-card-header">
                  <SkillBadge category={skill.category} />
                  <SkillBadge level={gap?.masteryLevel || 'unassessed'} />
                </div>

                <h3 className="skill-name">{skill.name}</h3>
                <p className="skill-desc">{skill.description}</p>

                {score && score.total > 0 && (
                  <div className="skill-score-row">
                    <ProgressBar
                      value={score.percentage}
                      label="Evaluated Mastery"
                      height={6}
                    />
                  </div>
                )}

                <div className="skill-meta-footer">
                  <div className="prereq-block">
                    <span className="meta-label">Prerequisites:</span>
                    {hasPrereqs ? (
                      <div className="prereq-tags">
                        {skill.prerequisites.map((preId) => (
                          <span key={preId} className="tag-prereq">
                            {SKILL_MAP[preId]?.name || preId}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="tag-none">None (Foundational)</span>
                    )}
                  </div>

                  <span className="est-hours">~{skill.estimatedHours} hrs</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommended Next Step Callout */}
      <section className="callout-card">
        <div className="callout-content">
          <h3>
            {!latestAttempt
              ? 'Ready to pinpoint your web development competency level?'
              : gapSkillsCount > 0
              ? 'Your personalized learning roadmap is waiting!'
              : 'All assessed skills meet proficiency thresholds!'}
          </h3>
          <p>
            {!latestAttempt
              ? 'Take our 12-question diagnostic test to immediately analyze your strengths and identify specific learning gaps.'
              : gapSkillsCount > 0
              ? 'Follow the prerequisite-aware learning roadmap to resolve identified bottlenecks in an optimal, structured sequence.'
              : 'Review your activity progress or retake the assessment at any time to verify retention.'}
          </p>
        </div>
        <div className="callout-action">
          {!latestAttempt ? (
            <Link to="/assessment" className="btn btn-primary">
              Begin Assessment
            </Link>
          ) : (
            <Link to="/roadmap" className="btn btn-primary">
              Go to Roadmap
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};
