import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { getGoalById } from '../data/goals.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import {
  loadBuddyRequests,
  loadPeerProfiles,
  loadSelectedGoal,
  loadUserProgress,
  sendBuddyRequest
} from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';
import type { StudyBuddyProfile } from '../types/index.ts';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;

  const currentGoalId = loadSelectedGoal();
  const currentGoalDef = getGoalById(currentGoalId);

  const peers = loadPeerProfiles();
  const [requests, setRequests] = useState(loadBuddyRequests());
  const [connectToast, setConnectToast] = useState<string | null>(null);

  if (!latestAttempt) {
    return (
      <div className="page results-page empty-state">
        <div className="empty-card">
          <span className="empty-icon">📝</span>
          <h2>No Assessment Results Found</h2>
          <p>
            You have not submitted a diagnostic assessment yet for <strong>{currentGoalDef.title}</strong>. Complete the evaluation to uncover your baseline skill gaps, unlock recommended exercises, and match with peer study buddies.
          </p>
          <div className="empty-actions-row">
            <Link to="/assessment" className="btn btn-primary btn-lg">
              Take Diagnostic Assessment 🚀
            </Link>
            <Link to="/competency" className="btn btn-secondary">
              Go to Competency Lab
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gaps = analyzeSkillGaps(SKILLS, latestAttempt);
  const gapsCount = gaps.filter((g) => g.hasGap).length;
  const masteredCount = gaps.filter((g) => !g.hasGap).length;

  const activeGaps = gaps.filter((g) => g.hasGap);
  const activeGapIds = activeGaps.map((g) => g.skillId);

  // Find peers who excel in these exact gaps
  const matchedPeers = peers.filter((p) =>
    p.complementarySkills.some((sId) => activeGapIds.includes(sId))
  );

  const formattedDate = new Date(latestAttempt.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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
      topic: `${currentGoalDef.shortTitle} Study Group`,
      studyMode: peer.studyMode,
      note: `Hi ${peer.name}! I just completed my diagnostic assessment for "${currentGoalDef.title}" and would love to pair up for study sessions.`
    });

    setRequests(loadBuddyRequests());
    setConnectToast(`🎉 Study buddy request sent to ${peer.name}! Saved locally (+25 XP awarded).`);
    setTimeout(() => setConnectToast(null), 4000);
  };

  return (
    <div className="page results-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Diagnostic Results & Skill Gap Analysis</h1>
          <p className="page-subtitle">
            Attempt completed on {formattedDate} • ID: {latestAttempt.id} • Goal: <strong>{currentGoalDef.title}</strong>
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

      {/* Toast */}
      {connectToast && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <span>{connectToast}</span>
        </div>
      )}

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
              : 'Skill Gaps Identified for Remediation'}
          </h2>
          <p>
            You answered <strong>{latestAttempt.correctQuestions}</strong> out of{' '}
            <strong>{latestAttempt.totalQuestions}</strong> questions correctly across 6 core web competencies.
          </p>
          <div className="score-meta-tags">
            <span className="pill pill-success">{masteredCount} Proficient Skills</span>
            <span className="pill pill-warning">{gapsCount} Skills Requiring Focus</span>
          </div>
        </div>
      </section>

      {/* Skill Breakdown */}
      <section className="section-block">
        <div className="section-title-row">
          <h2 className="section-title">Competency Breakdown & Targeted Practice</h2>
          <span className="text-muted">Exercises and flashcards calibrated to your answers</span>
        </div>

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

                  {/* Targeted Practice Actions */}
                  {gap.hasGap && (
                    <div className="result-actions-row">
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
                        Take Practice Quiz 📝
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          MATCHED PEER STUDY BUDDIES FOR DETECTED GAPS
          ======================================================== */}
      {matchedPeers.length > 0 && (
        <section className="matched-buddies-section" style={{ marginTop: '2rem' }}>
          <header className="section-header">
            <div>
              <h2>Matched Study Buddies for Your Gaps</h2>
              <p>
                These peers excel in the specific skills where your assessment revealed learning gaps:
              </p>
            </div>
            <Link to="/study-buddy" className="btn btn-sm btn-outline">
              Explore All Study Buddies →
            </Link>
          </header>

          <div className="matched-buddies-row">
            {matchedPeers.slice(0, 3).map((peer) => {
              const isSent = requests.some((r) => r.peerId === peer.id);

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
                    <span className="mb-skills-label">Excels in:</span>
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
          COMMUNITY SUPPORT CHANNELS
          ======================================================== */}
      <section className="goal-communities-section" style={{ marginTop: '2rem' }}>
        <header className="section-header">
          <div>
            <h2>Peer Study Channels for Your Learning Goal</h2>
            <p>
              Get feedback on code snippets, ask questions on detected gaps, and join study rooms:
            </p>
          </div>
          <Link to="/" className="btn btn-sm btn-outline">
            Open Chat 💬
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
                Join Channel →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA to Roadmap */}
      <section className="callout-card" style={{ marginTop: '2.5rem' }}>
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
