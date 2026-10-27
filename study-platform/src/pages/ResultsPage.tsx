import React from 'react';
import { Link } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import { loadUserProgress } from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';

export const ResultsPage: React.FC = () => {
  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;

  if (!latestAttempt) {
    return (
      <div className="page results-page empty-state">
        <div className="empty-card">
          <span className="empty-icon">📝</span>
          <h2>No Assessment Results Found</h2>
          <p>
            You have not submitted a diagnostic assessment yet. Complete the assessment to uncover your baseline skill gaps.
          </p>
          <Link to="/assessment" className="btn btn-primary">
            Take Diagnostic Assessment
          </Link>
        </div>
      </div>
    );
  }

  const gaps = analyzeSkillGaps(SKILLS, latestAttempt);
  const gapsCount = gaps.filter((g) => g.hasGap).length;
  const masteredCount = gaps.filter((g) => !g.hasGap).length;

  const formattedDate = new Date(latestAttempt.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="page results-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Diagnostic Results & Skill Gap Analysis</h1>
          <p className="page-subtitle">
            Attempt completed on {formattedDate} • ID: {latestAttempt.id}
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/roadmap" className="btn btn-primary">
            View Personalized Roadmap →
          </Link>
          <Link to="/assessment" className="btn btn-secondary">
            Retake Assessment
          </Link>
        </div>
      </header>

      {/* Overview Score Banner */}
      <section className="results-overview-card">
        <div className="score-circle-block">
          <div className="score-circle">
            <span className="score-num">{latestAttempt.overallScorePercentage}%</span>
            <span className="score-sub">Overall</span>
          </div>
        </div>

        <div className="score-summary-details">
          <h2>
            {latestAttempt.overallScorePercentage >= 70
              ? 'Great Foundation!'
              : 'Skill Gaps Identified'}
          </h2>
          <p>
            You answered <strong>{latestAttempt.correctQuestions}</strong> out of{' '}
            <strong>{latestAttempt.totalQuestions}</strong> questions correctly across 6 core competencies.
          </p>
          <div className="score-meta-tags">
            <span className="pill pill-success">{masteredCount} Proficient Skills</span>
            <span className="pill pill-warning">{gapsCount} Skills Requiring Focus</span>
          </div>
        </div>
      </section>

      {/* Skill Breakdown */}
      <section className="section-block">
        <h2 className="section-title">Competency Breakdown & Recommendations</h2>
        <div className="results-breakdown-list">
          {gaps.map((gap) => {
            return (
              <div
                key={gap.skillId}
                className={`result-skill-card ${gap.hasGap ? 'card-has-gap' : 'card-proficient'}`}
              >
                <div className="result-card-top">
                  <div className="result-card-heading">
                    <SkillBadge category={gap.category} />
                    <h3 className="result-skill-title">{gap.skillName}</h3>
                  </div>
                  <div className="result-card-badges">
                    <SkillBadge level={gap.masteryLevel} />
                    {gap.hasGap ? (
                      <span className="status-tag status-gap">Needs Focus</span>
                    ) : (
                      <span className="status-tag status-passed">Proficient</span>
                    )}
                  </div>
                </div>

                <div className="result-card-metrics">
                  <div className="metric-score-row">
                    <span>
                      Score: <strong>{gap.scorePercentage}%</strong> ({gap.correctAnswers}/{gap.totalQuestions} correct)
                    </span>
                    <span className="threshold-note">Proficiency Threshold: 70%</span>
                  </div>
                  <ProgressBar value={gap.scorePercentage} showPercent={false} height={6} />
                </div>

                <div className="result-card-feedback">
                  <div className="recommendation-box">
                    <span className="rec-icon">💡</span>
                    <p className="rec-text">{gap.recommendation}</p>
                  </div>

                  {gap.unmetPrerequisites.length > 0 && (
                    <div className="prereq-alert">
                      <span className="alert-icon">⚠️</span>
                      <span>
                        Unmet prerequisite dependency:{' '}
                        <strong>
                          {gap.unmetPrerequisites.map((p) => SKILL_MAP[p]?.name || p).join(', ')}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA to Roadmap */}
      <section className="callout-card">
        <div className="callout-content">
          <h3>Ready to start your targeted learning plan?</h3>
          <p>
            Your personalized roadmap automatically sequences topics so you master foundational prerequisites before advancing.
          </p>
        </div>
        <div className="callout-action">
          <Link to="/roadmap" className="btn btn-primary btn-lg">
            Open Learning Roadmap →
          </Link>
        </div>
      </section>
    </div>
  );
};
