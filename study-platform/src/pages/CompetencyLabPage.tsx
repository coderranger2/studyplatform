import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { LEARNING_GOALS, getGoalById } from '../data/goals.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import {
  loadBuddyRequests,
  loadPeerProfiles,
  loadSelectedGoal,
  loadUserProgress,
  saveSelectedGoal,
  sendBuddyRequest
} from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';
import { showToast } from '../components/common/Toast.tsx';
import type { StudyBuddyProfile } from '../types/index.ts';

export const CompetencyLabPage: React.FC = () => {
  const navigate = useNavigate();
  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;
  const gaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  const [currentGoalId, setCurrentGoalId] = useState<string>(loadSelectedGoal());
  const currentGoalDef = getGoalById(currentGoalId);

  const peers = loadPeerProfiles();
  const [requests, setRequests] = useState(loadBuddyRequests());

  const totalSkills = SKILLS.length;
  const masteredSkillsCount = gaps.filter((g) => !g.hasGap).length;
  const gapSkillsCount = gaps.filter((g) => g.hasGap && g.totalQuestions > 0).length;
  const unassessedCount = gaps.filter((g) => g.masteryLevel === 'unassessed').length;
  const completedActivitiesCount = progress.completedActivityIds.length;

  // Filter skills with active gaps
  const activeGaps = gaps.filter((g) => g.hasGap);
  const activeGapIds = activeGaps.map((g) => g.skillId);

  // Match peer study buddies who complement detected gaps or match goal
  const matchedPeers = peers.filter((p) => {
    // Peers who excel at student's gap skills
    const hasComplementarySkill = p.complementarySkills.some((sId) => activeGapIds.includes(sId));
    // Or peers who share the same target goal track
    const sharesGoal = p.targetGoalCategory === currentGoalDef.shortTitle || p.learningGoal.toLowerCase().includes(currentGoalDef.shortTitle.toLowerCase());
    return hasComplementarySkill || sharesGoal;
  });

  const handleGoalChange = (newGoalId: string) => {
    setCurrentGoalId(newGoalId);
    saveSelectedGoal(newGoalId);
    showToast(`Learning goal target switched to "${getGoalById(newGoalId).title}"`, 'info');
  };

  const handleQuickConnect = (peer: StudyBuddyProfile) => {
    const isAlreadySent = requests.some((r) => r.peerId === peer.id);
    if (isAlreadySent) {
      navigate('/study-buddy');
      return;
    }

    sendBuddyRequest({
      peerId: peer.id,
      peerName: peer.name,
      peerAvatar: peer.avatar,
      topic: `${currentGoalDef.shortTitle} Study Pact`,
      studyMode: peer.studyMode,
      note: `Hi ${peer.name}! I am working on my SkillForge goal "${currentGoalDef.title}" and would love to study together.`
    });

    setRequests(loadBuddyRequests());
    showToast(`🎉 Study buddy request sent to ${peer.name}! Recorded locally (+25 XP awarded).`, 'success');
  };

  return (
    <div className="page competency-lab-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Competency Development Lab</h1>
          <p className="page-subtitle">
            The core deterministic learning engine: define your learning target, evaluate your baseline knowledge, remediate gaps with peer study buddies, and advance along dependency-sequenced roadmaps.
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
            <h3>Active Learning Goal Target</h3>
            <p>Your skill gap remediation, peer partner matching, and roadmap curriculum are calibrated to this milestone.</p>
          </div>
        </div>
        <div className="goal-selector">
          <select
            value={currentGoalId}
            onChange={(e) => handleGoalChange(e.target.value)}
            aria-label="Select learning goal"
          >
            {LEARNING_GOALS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Goal Overview Details */}
      <div className="goal-summary-strip">
        <div className="goal-summary-text">
          <strong>Curriculum Objective:</strong> {currentGoalDef.description}
        </div>
        <div className="goal-target-skills">
          <span className="target-skills-label">Target Competencies:</span>
          <div className="target-skill-chips">
            {currentGoalDef.targetSkillIds.map((sId) => {
              const skill = SKILL_MAP[sId];
              const gap = gaps.find((g) => g.skillId === sId);
              return (
                <span
                  key={sId}
                  className={`target-skill-chip ${gap?.hasGap ? 'chip-gap' : 'chip-proficient'}`}
                >
                  {skill?.name || sId} {gap && !gap.hasGap ? '✓' : ''}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          USEFUL EMPTY STATE (IF NO ASSESSMENT TAKEN YET)
          ======================================================== */}
      {!latestAttempt ? (
        <section className="diagnostic-empty-hero">
          <div className="empty-hero-icon">📝</div>
          <div className="empty-hero-content">
            <h2>Take Your Baseline Diagnostic Assessment</h2>
            <p>
              You haven't completed a diagnostic evaluation yet for <strong>{currentGoalDef.title}</strong>. Taking our 12-question evaluation analyzes your HTML, CSS, and JavaScript knowledge deterministically to pinpoint specific skill gaps, unlock personalized flashcard drills, and match you with study partners.
            </p>

            <div className="workflow-steps-row">
              <div className="wf-step wf-step-done">
                <span className="wf-num">1</span>
                <div>
                  <strong>Choose Goal</strong>
                  <span>{currentGoalDef.shortTitle}</span>
                </div>
              </div>
              <div className="wf-step-arrow">→</div>
              <div className="wf-step wf-step-active">
                <span className="wf-num">2</span>
                <div>
                  <strong>Diagnostic Test</strong>
                  <span>12 questions (~5 mins)</span>
                </div>
              </div>
              <div className="wf-step-arrow">→</div>
              <div className="wf-step">
                <span className="wf-num">3</span>
                <div>
                  <strong>Gap Analysis</strong>
                  <span>Deterministic breakdown</span>
                </div>
              </div>
              <div className="wf-step-arrow">→</div>
              <div className="wf-step">
                <span className="wf-num">4</span>
                <div>
                  <strong>Peer Learning</strong>
                  <span>Study buddy matching</span>
                </div>
              </div>
              <div className="wf-step-arrow">→</div>
              <div className="wf-step">
                <span className="wf-num">5</span>
                <div>
                  <strong>Personal Roadmap</strong>
                  <span>Prerequisite mastery</span>
                </div>
              </div>
            </div>

            <div className="empty-hero-actions">
              <Link to="/assessment" className="btn btn-primary btn-lg">
                Begin Diagnostic Assessment Now 🚀
              </Link>
              <Link to="/study-buddy" className="btn btn-secondary btn-lg">
                Explore Study Buddies 👥
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Metric Cards */
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Diagnostic Status</span>
            <span className="stat-value">
              {latestAttempt.overallScorePercentage}%
            </span>
            <span className="stat-hint">
              {latestAttempt.correctQuestions} / {latestAttempt.totalQuestions} questions correct
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
      )}

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

      {/* ========================================================
          PEER STUDY BUDDIES MATCHED TO DETECTED GAPS & GOAL
          ======================================================== */}
      {matchedPeers.length > 0 && (
        <section className="matched-buddies-section">
          <header className="section-header">
            <div>
              <h2>Collaborative Study Buddies for Your Gaps & Goal</h2>
              <p>
                {latestAttempt
                  ? `These students excel in the competencies where you have active gaps or share your "${currentGoalDef.shortTitle}" target:`
                  : `Active peers working on similar competencies in "${currentGoalDef.shortTitle}":`}
              </p>
            </div>
            <Link to="/study-buddy" className="btn btn-sm btn-outline">
              View All Study Buddies →
            </Link>
          </header>

          <div className="matched-buddies-row">
            {matchedPeers.slice(0, 3).map((peer) => {
              const isSent = requests.some((r) => r.peerId === peer.id);
              const matchingGaps = peer.complementarySkills.filter((sId) => activeGapIds.includes(sId));

              return (
                <div key={peer.id} className="matched-buddy-card">
                  <div className="mb-top">
                    <span className="mb-avatar">{peer.avatar}</span>
                    <div className="mb-info">
                      <h4>{peer.name}</h4>
                      <span className="mb-handle">{peer.handle} • Lvl {peer.level}</span>
                    </div>
                  </div>

                  <p className="mb-goal">🎯 "{peer.learningGoal}"</p>

                  <div className="mb-skills">
                    <span className="mb-skills-label">
                      {matchingGaps.length > 0 ? 'Excels in your gaps:' : 'Strengths:'}
                    </span>
                    <div className="mb-skill-tags">
                      {peer.complementarySkills.map((sId) => (
                        <span
                          key={sId}
                          className={`mini-skill-pill ${activeGapIds.includes(sId) ? 'pill-gap-matched' : ''}`}
                        >
                          {SKILL_MAP[sId]?.name || sId}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-actions">
                    <button
                      type="button"
                      onClick={() => handleQuickConnect(peer)}
                      className={`btn btn-sm ${isSent ? 'btn-outline-success' : 'btn-primary'}`}
                    >
                      {isSent ? '✓ Request Sent (Demo)' : 'Connect as Buddy 🤝'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const comm = peer.matchedCommunities[0];
                        if (comm) {
                          navigate(`/?community=${comm.id}&channel=${comm.channelId || ''}`);
                        }
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      Chat in Community 💬
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          RECOMMENDED COMMUNITIES & CHANNELS FOR PEER SUPPORT
          ======================================================== */}
      <section className="goal-communities-section">
        <header className="section-header">
          <div>
            <h2>Recommended Communities & Channels for Peer Support</h2>
            <p>
              Connect with active study groups calibrated to <strong>{currentGoalDef.title}</strong> and resolve questions together:
            </p>
          </div>
          <Link to="/" className="btn btn-sm btn-outline">
            Open Community Hub 💬
          </Link>
        </header>

        <div className="recommended-channels-grid">
          {currentGoalDef.recommendedChannelIds.map((item) => (
            <div key={`${item.communityId}-${item.channelId}`} className="recommended-channel-card">
              <div className="rec-ch-header">
                <span className="ch-icon">💬</span>
                <div>
                  <h4>{item.label}</h4>
                  <span className="text-muted">{item.reason}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/?community=${item.communityId}&channel=${item.channelId}`)}
                className="btn btn-sm btn-primary"
              >
                Join & Open Channel →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SKILL GAP ANALYSIS & MATRIX GRID
          ======================================================== */}
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

                {/* Practical Remediation Quick Links */}
                {gap.hasGap && (
                  <div className="skill-remediation-actions">
                    <Link
                      to={`/tools?tab=flashcards&deck=${gap.skillId}`}
                      className="btn btn-sm btn-secondary"
                    >
                      Practice Flashcards 🃏
                    </Link>
                    <Link
                      to={`/tools?tab=quizzes&quiz=${gap.skillId}`}
                      className="btn btn-sm btn-outline"
                    >
                      Take Quiz 📝
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
