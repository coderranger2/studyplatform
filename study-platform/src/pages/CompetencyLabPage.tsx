import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import { loadTeachers, loadUserProgress } from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';

export const CompetencyLabPage: React.FC = () => {
  const progress = loadUserProgress();
  const teachers = loadTeachers();
  const latestAttempt = progress.latestAttempt;
  const gaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  const [learningGoal, setLearningGoal] = useState<string>('Frontend Developer Competency');

  const totalSkills = SKILLS.length;
  const masteredSkillsCount = gaps.filter((g) => !g.hasGap).length;
  const gapSkillsCount = gaps.filter((g) => g.hasGap && g.totalQuestions > 0).length;
  const unassessedCount = gaps.filter((g) => g.masteryLevel === 'unassessed').length;
  const completedActivitiesCount = progress.completedActivityIds.length;

  // Filter skills with active gaps
  const activeGaps = gaps.filter((g) => g.hasGap);

  // Match teachers who teach these gap skills
  const matchedTeachers = teachers.filter((t) =>
    t.matchingSkillIds.some((sId) => activeGaps.some((g) => g.skillId === sId))
  );

  return (
    <div className="page competency-lab-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Competency Development Lab</h1>
          <p className="page-subtitle">
            The signature deterministic engine: choose a learning target, take diagnostic evaluations, remediate skill gaps, and get prerequisite-sequenced roadmaps.
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/assessment" className="btn btn-primary">
            {latestAttempt ? 'Retake Assessment 📝' : 'Start Diagnostic Assessment 🚀'}
          </Link>
          <Link to="/roadmap" className="btn btn-secondary">
            View Roadmap 🗺️
          </Link>
        </div>
      </header>

      {/* Target Goal Selector Bar */}
      <section className="learning-goal-banner">
        <div className="goal-banner-left">
          <span className="goal-badge-icon">🎯</span>
          <div>
            <h3>Current Learning Goal Target</h3>
            <p>Your competency analysis and teacher recommendations are calibrated to this milestone.</p>
          </div>
        </div>
        <div className="goal-selector">
          <select
            value={learningGoal}
            onChange={(e) => setLearningGoal(e.target.value)}
          >
            <option value="Frontend Developer Competency">Frontend Developer Competency</option>
            <option value="Fullstack Web Mastery">Fullstack Web Mastery</option>
            <option value="Semester Exam & Placement Prep">Semester Exam & Placement Prep</option>
            <option value="Accessible UI Engineering">Accessible UI Engineering</option>
          </select>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Diagnostic Status</span>
          <span className="stat-value">
            {latestAttempt ? `${latestAttempt.overallScorePercentage}%` : 'Not Taken'}
          </span>
          <span className="stat-hint">
            {latestAttempt
              ? `${latestAttempt.correctQuestions} / ${latestAttempt.totalQuestions} questions correct`
              : 'Complete the diagnostic to discover gaps'}
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
          <span className="stat-value text-warning">{gapSkillsCount}</span>
          <span className="stat-hint">
            {unassessedCount > 0
              ? `${unassessedCount} unassessed skill(s)`
              : 'Priority areas on your roadmap'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Activities Completed</span>
          <span className="stat-value text-primary">{completedActivitiesCount}</span>
          <span className="stat-hint">Roadmap exercises completed</span>
        </div>
      </section>

      {/* Navigation Quick Links to Sub-routes */}
      <nav className="competency-subnav">
        <Link to="/assessment" className="subnav-card">
          <span className="subnav-icon">📝</span>
          <h4>Diagnostic Assessment</h4>
          <p>Evaluate your foundational HTML, CSS, and JS knowledge.</p>
        </Link>
        <Link to="/results" className="subnav-card">
          <span className="subnav-icon">📊</span>
          <h4>Assessment Results</h4>
          <p>Review detailed category breakdowns and question explanations.</p>
        </Link>
        <Link to="/roadmap" className="subnav-card">
          <span className="subnav-icon">🗺️</span>
          <h4>Prerequisite Roadmap</h4>
          <p>Structured, dependency-aware milestone curriculum.</p>
        </Link>
        <Link to="/progress" className="subnav-card">
          <span className="subnav-icon">📈</span>
          <h4>Historical Progress</h4>
          <p>Track test attempt improvements and verified competencies over time.</p>
        </Link>
      </nav>

      {/* Matched Mentors for Detected Gaps */}
      {matchedTeachers.length > 0 && (
        <section className="matched-mentors-section">
          <header className="section-header">
            <div>
              <h2>Mentors Matched to Your Detected Gaps</h2>
              <p>These educators specialize in the exact skills identified for remediation:</p>
            </div>
            <Link to="/teachers" className="btn btn-sm btn-outline">
              View All Mentors →
            </Link>
          </header>

          <div className="matched-teachers-row">
            {matchedTeachers.slice(0, 3).map((teacher) => (
              <div key={teacher.id} className="matched-teacher-mini-card">
                <span className="mini-avatar">{teacher.avatar}</span>
                <div className="mini-details">
                  <h4>{teacher.name}</h4>
                  <span className="mini-title">{teacher.title}</span>
                  <div className="mini-skills">
                    {teacher.matchingSkillIds.map((sId) => (
                      <span key={sId} className="mini-skill-pill">
                        {SKILL_MAP[sId]?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <Link to="/teachers" className="btn btn-sm btn-secondary">
                  Request Help ✉️
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skill Gap Analysis Grid */}
      <section className="competency-matrix-section">
        <header className="section-header">
          <div>
            <h2>Verified Competencies & Detected Gaps</h2>
            <p>Calculated deterministically by evaluating question responses against prerequisites.</p>
          </div>
        </header>

        <div className="skills-grid">
          {gaps.map((gap) => {
            const skill = SKILL_MAP[gap.skillId];
            return (
              <div
                key={gap.skillId}
                className={`skill-card ${gap.hasGap ? 'skill-card-gap' : 'skill-card-mastered'}`}
              >
                <div className="skill-card-header">
                  <div className="skill-header-meta">
                    <span className="skill-cat-pill">{skill.category}</span>
                    <SkillBadge level={gap.masteryLevel} />
                  </div>
                  <h3 className="skill-name">{skill.name}</h3>
                </div>

                <div className="skill-score-row">
                  <span className="score-label">Proficiency Score:</span>
                  <span className="score-val">
                    {gap.totalQuestions > 0 ? `${gap.scorePercentage}%` : 'Unassessed'}
                  </span>
                </div>
                <ProgressBar
                  value={gap.scorePercentage}
                  showPercent={false}
                />

                <p className="skill-desc">{skill.description}</p>

                {gap.unmetPrerequisites.length > 0 && (
                  <div className="unmet-prereqs-box">
                    <span className="prereq-label">Unresolved Prerequisites:</span>
                    <div className="prereq-tags">
                      {gap.unmetPrerequisites.map((pId) => (
                        <span key={pId} className="prereq-tag">
                          ⚠️ {SKILL_MAP[pId]?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="skill-recommendation">
                  <strong>Recommendation:</strong> {gap.recommendation}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
