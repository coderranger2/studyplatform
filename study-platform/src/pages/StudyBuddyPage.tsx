import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type {
  Question,
  SkillCategory,
  SkillId,
  StudyBuddyProfile,
  StudyBuddyRequest
} from '../types/index.ts';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { LEARNING_GOALS, getGoalById } from '../data/goals.ts';
import { SAMPLE_QUESTIONS } from '../data/questions.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import {
  awardXP,
  cancelBuddyRequest,
  loadBuddyRequests,
  loadPeerProfiles,
  loadSelectedGoal,
  loadUserProgress,
  saveSelectedGoal,
  sendBuddyRequest
} from '../utilities/storage.ts';
import { showToast } from '../components/common/Toast.tsx';

interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  practiceQuestion?: Question;
  studyPlanSteps?: string[];
}

let buddyMsgCounter = 0;
function getBuddyMsgId(prefix: string): string {
  buddyMsgCounter += 1;
  return `${prefix}-${Date.now()}-${buddyMsgCounter}`;
}

function getDisplayTime(): string {
  const d = new Date();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

type BuddyTab = 'peers' | 'requests' | 'tutor';

export const StudyBuddyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySubject = searchParams.get('subject');

  // Primary tab: 'peers' | 'requests' | 'tutor'
  const [activeTab, setActiveTab] = useState<BuddyTab>('peers');

  // Peer discovery state
  const [peers] = useState<StudyBuddyProfile[]>(loadPeerProfiles());
  const [requests, setRequests] = useState<StudyBuddyRequest[]>(loadBuddyRequests());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(querySubject || 'All');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('All');
  const [selectedStudyMode, setSelectedStudyMode] = useState<string>('All');
  const [onlyComplementary, setOnlyComplementary] = useState<boolean>(false);

  // Student progress & goals
  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;
  const skillGaps = analyzeSkillGaps(SKILLS, latestAttempt || null);
  const activeGaps = skillGaps.filter((g) => g.hasGap);
  const activeGapSkillIds = activeGaps.map((g) => g.skillId);

  const [currentGoalId, setCurrentGoalId] = useState<string>(loadSelectedGoal());
  const currentGoalDef = getGoalById(currentGoalId);

  // Connect Modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPeerForConnect, setSelectedPeerForConnect] = useState<StudyBuddyProfile | null>(null);
  const [connectTopic, setConnectTopic] = useState('');
  const [connectMode, setConnectMode] = useState<string>('Pair Coding');
  const [connectNote, setConnectNote] = useState('');

  // AI Assistant Tutor state
  const [tutorSubject, setTutorSubject] = useState<SkillCategory>('HTML');
  const [tutorSkillId, setTutorSkillId] = useState<SkillId>('html-structure');
  const [userInput, setUserInput] = useState('');
  const [answeredQuestionId, setAnsweredQuestionId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: 'Hello! I am your SkillForge Study Buddy Assistant. I provide deterministic, rule-based concept explanations, instant practice challenges, and sequenced study schedules calibrated to your competency gaps.'
    }
  ]);

  // Goal switch handler
  const handleGoalChange = (newGoalId: string) => {
    setCurrentGoalId(newGoalId);
    saveSelectedGoal(newGoalId);
    showToast(
      `Updated learning goal to "${getGoalById(newGoalId).title}". Peer recommendations recalibrated.`,
      'info'
    );
  };

  // Check if peer complements current student's gaps
  const isComplementaryPeer = (peer: StudyBuddyProfile) => {
    return peer.complementarySkills.some((sId) => activeGapSkillIds.includes(sId));
  };

  // Filter peers
  const filteredPeers = useMemo(() => {
    return peers.filter((peer) => {
      // Text search
      const matchesSearch =
        peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.learningGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

      // Subject filter
      const matchesSubject =
        selectedSubject === 'All' ||
        peer.primarySubject === selectedSubject ||
        peer.subjects.includes(selectedSubject);

      // Goal filter
      const matchesGoal =
        selectedGoalFilter === 'All' ||
        peer.targetGoalCategory === selectedGoalFilter;

      // Study mode filter
      const matchesMode =
        selectedStudyMode === 'All' || peer.studyMode === selectedStudyMode;

      // Complementary filter
      const matchesComplementary =
        !onlyComplementary || peer.complementarySkills.some((sId) => activeGapSkillIds.includes(sId));

      return (
        matchesSearch &&
        matchesSubject &&
        matchesGoal &&
        matchesMode &&
        matchesComplementary
      );
    });
  }, [peers, searchQuery, selectedSubject, selectedGoalFilter, selectedStudyMode, onlyComplementary, activeGapSkillIds]);

  // Handle open connect modal
  const handleOpenConnect = (peer: StudyBuddyProfile) => {
    setSelectedPeerForConnect(peer);
    // Prefill topic with shared gap or goal
    const sharedGap = peer.complementarySkills.find((s) => activeGapSkillIds.includes(s));
    const prefillTopic = sharedGap
      ? `${SKILL_MAP[sharedGap]?.name || sharedGap} Mastery`
      : peer.learningGoal.slice(0, 45);
    setConnectTopic(prefillTopic);
    setConnectMode(peer.studyMode);
    setConnectNote(
      `Hi ${peer.name}! I noticed you are working on "${peer.learningGoal}". I would love to pair up for study sessions and keep each other accountable.`
    );
    setShowConnectModal(true);
  };

  // Submit connect request
  const handleSubmitConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeerForConnect) return;

    sendBuddyRequest({
      peerId: selectedPeerForConnect.id,
      peerName: selectedPeerForConnect.name,
      peerAvatar: selectedPeerForConnect.avatar,
      topic: connectTopic.trim() || 'Collaborative Study',
      studyMode: connectMode,
      note: connectNote.trim()
    });

    setRequests(loadBuddyRequests());
    setShowConnectModal(false);
    showToast(`🎉 Study buddy invite sent to ${selectedPeerForConnect.name}! Saved locally (+25 XP awarded).`, 'success');
  };

  const handleCancelRequest = (reqId: string) => {
    cancelBuddyRequest(reqId);
    setRequests(loadBuddyRequests());
    showToast('Study buddy invitation cancelled.', 'info');
  };

  // AI Assistant Tutor helpers
  const addAssistantResponse = React.useCallback(
    (text: string, practiceQuestion?: Question, studyPlanSteps?: string[]) => {
      const newMsg: AssistantMessage = {
        id: getBuddyMsgId('buddy'),
        sender: 'assistant',
        timestamp: getDisplayTime(),
        text,
        practiceQuestion,
        studyPlanSteps
      };
      setConversation((prev) => [...prev, newMsg]);
      awardXP(getBuddyMsgId('action_buddy'), 15, 'Consulted Study Buddy');
    },
    []
  );

  const handleRequestPractice = React.useCallback(() => {
    const matching = SAMPLE_QUESTIONS.filter((q) => q.skillId === tutorSkillId);
    const question = matching[conversation.length % (matching.length || 1)] || SAMPLE_QUESTIONS[0];

    setAnsweredQuestionId(null);
    setSelectedOptionId(null);

    addAssistantResponse(
      `Here is a practice question for **${SKILL_MAP[question.skillId]?.name}**:`,
      question
    );
  }, [tutorSkillId, conversation.length, addAssistantResponse]);

  const handleGenerateStudyPlan = () => {
    const gaps = skillGaps.filter((g) => g.hasGap);
    const planSteps: string[] = [];

    if (gaps.length === 0) {
      planSteps.push('Day 1: Comprehensive review of core semantic HTML and accessibility.');
      planSteps.push('Day 2: Advanced CSS Grid micro-challenges & responsive breakpoint audits.');
      planSteps.push('Day 3: JavaScript DOM event delegation and state persistence.');
      planSteps.push('Day 4: End-to-end interactive portfolio milestone project.');
    } else {
      gaps.forEach((gap, idx) => {
        planSteps.push(
          `Day ${idx + 1} (${gap.skillName}): Complete ${gap.recommendation}. Spend 45 minutes on concept modules and flashcards in the Study Toolkit.`
        );
      });
      planSteps.push(
        `Day ${gaps.length + 1}: Take the SkillForge reassessment to verify resolved gaps and calibrate your roadmap.`
      );
    }

    addAssistantResponse(
      `Here is your prerequisite-aligned study plan calibrated to your current progress:`,
      undefined,
      planSteps
    );
  };

  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    const userMsg: AssistantMessage = {
      id: getBuddyMsgId('user'),
      sender: 'user',
      timestamp: getDisplayTime(),
      text: userText
    };

    setConversation((prev) => [...prev, userMsg]);
    setUserInput('');

    const lower = userText.toLowerCase();
    if (lower.includes('question') || lower.includes('practice') || lower.includes('quiz')) {
      handleRequestPractice();
    } else if (lower.includes('plan') || lower.includes('schedule') || lower.includes('gap')) {
      handleGenerateStudyPlan();
    } else if (lower.includes('flexbox') || lower.includes('grid')) {
      addAssistantResponse(
        '**CSS Layout Breakdown:**\n\n- **Flexbox (1D):** Ideal for aligning items along a single axis (either row or column). Use `justify-content` for the main axis and `align-items` for the cross axis.\n- **CSS Grid (2D):** Ideal for simultaneous rows and columns. Use `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` for fluid responsive cards without media queries.'
      );
    } else if (lower.includes('dom') || lower.includes('event')) {
      addAssistantResponse(
        '**DOM Manipulation Principles:**\n\n1. Select elements cleanly with `document.querySelector`.\n2. Always prevent form reloads with `event.preventDefault()` if handling submissions via JavaScript.\n3. Leverage Event Delegation by attaching a single listener to a parent container rather than each list item.'
      );
    } else if (lower.includes('form') || lower.includes('input') || lower.includes('label')) {
      addAssistantResponse(
        '**Accessible HTML Forms:**\n\n- Associate `<label>` elements with `<input>` by setting matching `for` (or `htmlFor`) and `id` attributes.\n- Use native validation attributes like `required`, `type="email"`, and `minlength` to ensure clean client validation.'
      );
    } else {
      const currentSkill = SKILL_MAP[tutorSkillId];
      addAssistantResponse(
        `**${currentSkill.name} Overview:**\n\n${currentSkill.description}\n\n**Key Learning Objectives:**\n${currentSkill.learningObjectives
          .map((obj) => `• ${obj}`)
          .join('\n')}\n\n*Estimated study time: ${currentSkill.estimatedHours} hours. You can request a practice question or study plan below!*`
      );
    }
  };

  const handleAnswerPractice = (question: Question, optionId: string) => {
    setSelectedOptionId(optionId);
    setAnsweredQuestionId(question.id);

    const isCorrect = optionId === question.correctOptionId;
    if (isCorrect) {
      awardXP(`practice_q_${question.id}`, 20, 'Correct Study Buddy practice answer');
    }
  };

  return (
    <div className="page study-buddy-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Study Buddies & Peer Learning</h1>
          <p className="page-subtitle">
            Discover study partners matched to your subject, learning goal, and complementary skill gaps. Form accountability pacts and collaborate across Discord-style study circles.
          </p>
        </div>
      </header>

      {/* Toast Feedback */}
      {/* Navigation Tabs Bar */}
      <nav className="buddy-tabs-bar" aria-label="Study Buddy Navigation">
        <button
          className={`buddy-tab-btn ${activeTab === 'peers' ? 'active' : ''}`}
          onClick={() => setActiveTab('peers')}
        >
          <span className="tab-icon">👥</span>
          <span>Find Study Buddies</span>
          <span className="tab-pill">{filteredPeers.length}</span>
        </button>

        <button
          className={`buddy-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <span className="tab-icon">📬</span>
          <span>My Study Requests</span>
          {requests.length > 0 && <span className="tab-pill tab-pill-highlight">{requests.length}</span>}
        </button>

        <button
          className={`buddy-tab-btn ${activeTab === 'tutor' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutor')}
        >
          <span className="tab-icon">🤖</span>
          <span>AI Assistant Tutor</span>
        </button>
      </nav>

      {/* ========================================================
          TAB 1: FIND STUDY BUDDIES (PEER DISCOVERY)
          ======================================================== */}
      {activeTab === 'peers' && (
        <div className="peers-tab-content">
          {/* Goal & Competency Gap Insight Banner */}
          <section className="buddy-goal-banner">
            <div className="buddy-goal-info">
              <span className="goal-flag-icon">🎯</span>
              <div>
                <div className="goal-title-row">
                  <span className="subhead-label">Active Learning Milestone:</span>
                  <strong>{currentGoalDef.title}</strong>
                </div>
                <p className="goal-desc">{currentGoalDef.description}</p>
                {latestAttempt ? (
                  <div className="gap-inline-pills">
                    <span className="gap-inline-label">Your Identified Gaps:</span>
                    {activeGaps.length === 0 ? (
                      <span className="badge badge-success">All skills proficient! 🎉</span>
                    ) : (
                      activeGaps.map((g) => (
                        <span key={g.skillId} className="badge badge-warning">
                          ⚠️ {g.skillName}
                        </span>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="gap-empty-hint">
                    💡 <em>Take the diagnostic assessment in Competency Lab to highlight peers with complementary strengths for your exact skill gaps!</em>
                  </p>
                )}
              </div>
            </div>

            <div className="goal-switch-col">
              <label>Switch Learning Goal:</label>
              <select
                value={currentGoalId}
                onChange={(e) => handleGoalChange(e.target.value)}
                className="goal-select"
              >
                {LEARNING_GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.shortTitle}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Search and Filters Controls */}
          <section className="peer-filters-card">
            <div className="peer-search-row">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by student name, handle, interests, or goal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-select-group">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  aria-label="Filter by subject"
                >
                  <option value="All">All Subjects</option>
                  <option value="HTML">HTML</option>
                  <option value="CSS">CSS</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                </select>

                <select
                  value={selectedStudyMode}
                  onChange={(e) => setSelectedStudyMode(e.target.value)}
                  aria-label="Filter by study mode"
                >
                  <option value="All">All Study Modes</option>
                  <option value="Pair Coding">Pair Coding</option>
                  <option value="Flashcards & Quizzes">Flashcards & Quizzes</option>
                  <option value="Pomodoro Co-study">Pomodoro Co-study</option>
                  <option value="Doubt Clearing">Doubt Clearing</option>
                </select>

                <select
                  value={selectedGoalFilter}
                  onChange={(e) => setSelectedGoalFilter(e.target.value)}
                  aria-label="Filter by goal category"
                >
                  <option value="All">All Goal Tracks</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Fullstack Web Mastery">Fullstack Web</option>
                  <option value="Accessible UI Engineering">Accessible UI</option>
                </select>
              </div>
            </div>

            <div className="filter-extras-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyComplementary}
                  onChange={(e) => setOnlyComplementary(e.target.checked)}
                />
                <span>⭐ Show only complementary skill matches for my gaps</span>
              </label>

              {(searchQuery ||
                selectedSubject !== 'All' ||
                selectedGoalFilter !== 'All' ||
                selectedStudyMode !== 'All' ||
                onlyComplementary) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('All');
                    setSelectedGoalFilter('All');
                    setSelectedStudyMode('All');
                    setOnlyComplementary(false);
                  }}
                  className="btn btn-sm btn-ghost"
                >
                  Reset Filters ✕
                </button>
              )}
            </div>
          </section>

          {/* Peer Profiles Grid */}
          <section className="peer-grid-section">
            <div className="section-title-row">
              <h2>Available Study Buddies ({filteredPeers.length})</h2>
              <span className="text-muted">Filtered by active subject and learning goal parameters</span>
            </div>

            {filteredPeers.length === 0 ? (
              <div className="empty-sub-card">
                <span className="empty-icon">👥</span>
                <h3>No study partners matched your filters</h3>
                <p>Try clearing your search query or broadening your subject and study mode selections.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('All');
                    setSelectedGoalFilter('All');
                    setSelectedStudyMode('All');
                    setOnlyComplementary(false);
                  }}
                  className="btn btn-sm btn-primary"
                >
                  Show All Study Buddies
                </button>
              </div>
            ) : (
              <div className="peer-cards-grid">
                {filteredPeers.map((peer) => {
                  const isSent = requests.some((r) => r.peerId === peer.id);
                  const isComp = isComplementaryPeer(peer);

                  return (
                    <article key={peer.id} className={`peer-card ${isComp ? 'peer-card-recommended' : ''}`}>
                      {/* Top Bar with Avatar, Name, and Status */}
                      <div className="peer-card-header">
                        <div className="peer-avatar-wrapper">
                          <span className="peer-avatar">{peer.avatar}</span>
                          <span className={`status-dot dot-${peer.status}`} title={`Status: ${peer.status}`} />
                        </div>

                        <div className="peer-title-info">
                          <div className="peer-name-row">
                            <h3>{peer.name}</h3>
                            <span className="peer-handle">{peer.handle}</span>
                          </div>

                          <div className="peer-stats-row">
                            <span className="peer-level-badge">Lvl {peer.level}</span>
                            <span className="peer-xp">⚡ {peer.xp} XP</span>
                            <span className="peer-streak">🔥 {peer.streakDays}d</span>
                          </div>
                        </div>

                        {isComp && (
                          <div className="recommended-badge" title="Excels at competencies where you have identified gaps">
                            ⭐ Skill Match
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="peer-bio">{peer.bio}</p>

                      {/* Learning Goal */}
                      <div className="peer-goal-box">
                        <span className="meta-heading">🎯 Current Goal:</span>
                        <p className="peer-goal-text">{peer.learningGoal}</p>
                      </div>

                      {/* Skills Matrix Pill Tags */}
                      <div className="peer-skills-matrix">
                        <div className="skills-subgroup">
                          <span className="skills-label">Strengths:</span>
                          <div className="skill-pills-row">
                            {peer.complementarySkills.map((sId) => {
                              const isMyGap = activeGapSkillIds.includes(sId);
                              return (
                                <span
                                  key={sId}
                                  className={`peer-skill-pill ${isMyGap ? 'pill-gap-matched' : 'pill-standard'}`}
                                  title={isMyGap ? 'Matches one of your active skill gaps!' : undefined}
                                >
                                  {isMyGap && '🤝 '}
                                  {SKILL_MAP[sId]?.name || sId}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="skills-subgroup">
                          <span className="skills-label">Practicing:</span>
                          <div className="skill-pills-row">
                            {peer.weakSkills.map((sId) => (
                              <span key={sId} className="peer-skill-pill pill-learning">
                                🎯 {SKILL_MAP[sId]?.name || sId}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Interests Chips */}
                      <div className="peer-interests-row">
                        <span className="meta-heading">Interests:</span>
                        <div className="chips-list">
                          {peer.interests.map((interest) => (
                            <span key={interest} className="interest-chip">
                              #{interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Availability & Preferred Study Mode */}
                      <div className="peer-mode-row">
                        <div className="mode-item">
                          <span className="mode-icon">⏱️</span>
                          <span>{peer.studyMode}</span>
                        </div>
                        <div className="avail-item">
                          <span className="mode-icon">📅</span>
                          <span>{peer.availability}</span>
                        </div>
                      </div>

                      {/* Linked Communities */}
                      <div className="peer-communities-row">
                        <span className="comm-label">Active Communities:</span>
                        <div className="comm-badges-list">
                          {peer.matchedCommunities.map((comm) => (
                            <button
                              key={comm.id}
                              type="button"
                              onClick={() =>
                                navigate(`/?community=${comm.id}&channel=${comm.channelId || ''}`)
                              }
                              className="comm-link-btn"
                              title={`Jump into ${comm.name} chat`}
                            >
                              <span>{comm.icon}</span>
                              <span>{comm.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="peer-card-actions">
                        {isSent ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('requests')}
                            className="btn btn-sm btn-outline-success"
                          >
                            ✓ Request Sent (Demo)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenConnect(peer)}
                            className="btn btn-sm btn-primary"
                          >
                            Connect as Study Buddy 🤝
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const firstComm = peer.matchedCommunities[0];
                            if (firstComm) {
                              navigate(`/communities?community=${firstComm.id}&channel=${firstComm.channelId || ''}`);
                            }
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Message in Community 💬
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================
          TAB 2: MY STUDY REQUESTS
          ======================================================== */}
      {activeTab === 'requests' && (
        <div className="requests-tab-content">
          <div className="section-title-row">
            <div>
              <h2>Your Sent Study Buddy Invitations ({requests.length})</h2>
              <p className="text-muted">
                Invitations you have dispatched to prospective learning partners.
              </p>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>
              ℹ️ <strong>Local Demo Persistence:</strong> Study partner invites are recorded in your browser's localStorage. In this demo application, requests are simulated locally without connecting to live external user mailboxes.
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="empty-sub-card">
              <span className="empty-icon">📬</span>
              <h3>No study requests sent yet</h3>
              <p>Browse the study buddy directory and express interest in collaborating on shared goals!</p>
              <button
                type="button"
                onClick={() => setActiveTab('peers')}
                className="btn btn-primary"
              >
                Browse Study Buddies →
              </button>
            </div>
          ) : (
            <div className="requests-list">
              {requests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-card-left">
                    <span className="req-peer-avatar">{req.peerAvatar}</span>
                    <div className="req-details">
                      <div className="req-header-line">
                        <h4>Study Invitation to {req.peerName}</h4>
                        <span className="req-badge-status">Sent (Demo)</span>
                        <span className="req-time">{req.sentAt}</span>
                      </div>
                      <div className="req-meta-line">
                        <span>
                          <strong>Topic:</strong> {req.topic}
                        </span>
                        <span>•</span>
                        <span>
                          <strong>Format:</strong> {req.studyMode}
                        </span>
                      </div>
                      {req.note && <p className="req-note">"{req.note}"</p>}
                    </div>
                  </div>

                  <div className="request-card-actions">
                    <button
                      type="button"
                      onClick={() => navigate('/communities?community=comm-web-dev')}
                      className="btn btn-sm btn-secondary"
                    >
                      Open Study Community 💬
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(req.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Withdraw Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: AI ASSISTANT TUTOR (PRESERVED)
          ======================================================== */}
      {activeTab === 'tutor' && (
        <div className="tutor-tab-content">
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>
              🤖 <strong>Rule-Based Learning Tutor:</strong> Provides deterministic concept breakdowns, practice questions, and prerequisite-aligned study plans.
            </span>
          </div>

          <div className="study-buddy-container">
            {/* Left Control Panel */}
            <aside className="buddy-controls-pane">
              <h3>Study Parameters</h3>

              <div className="form-group">
                <label>Subject</label>
                <select
                  value={tutorSubject}
                  onChange={(e) => {
                    const sub = e.target.value as SkillCategory;
                    setTutorSubject(sub);
                    const firstSkill = SKILLS.find((s) => s.category === sub);
                    if (firstSkill) setTutorSkillId(firstSkill.id);
                  }}
                >
                  <option value="HTML">HTML & Semantics</option>
                  <option value="CSS">CSS & Layouts</option>
                  <option value="JavaScript">JavaScript & DOM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Specific Skill Target</label>
                <select
                  value={tutorSkillId}
                  onChange={(e) => setTutorSkillId(e.target.value as SkillId)}
                >
                  {SKILLS.filter((s) => s.category === tutorSubject).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quick-action-prompts">
                <h4>Quick Actions</h4>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleRequestPractice}
                >
                  🎯 Request Practice Question
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleGenerateStudyPlan}
                >
                  📅 Generate Study Plan for Gaps
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setUserInput(`Explain the box model and selector priority`);
                  }}
                >
                  💡 Explain Box Model Concept
                </button>
              </div>

              <div className="engine-link-box">
                <h4>Detected Skill Gaps ({activeGaps.length})</h4>
                <ul className="gap-bullets">
                  {activeGaps.slice(0, 3).map((g) => (
                    <li key={g.skillId}>
                      <span>{g.skillName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Central Chat Transcript */}
            <main className="buddy-chat-pane">
              <div className="buddy-messages-list">
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`buddy-message ${msg.sender === 'user' ? 'msg-user' : 'msg-assistant'}`}
                  >
                    <div className="msg-avatar">
                      {msg.sender === 'user' ? '🎓' : '🤖'}
                    </div>
                    <div className="msg-body">
                      <div className="msg-header">
                        <strong>{msg.sender === 'user' ? 'You' : 'Study Buddy'}</strong>
                        <time>{msg.timestamp}</time>
                      </div>
                      <div className="msg-content">
                        {msg.text.split('\n\n').map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>

                      {/* Render Practice Question if attached */}
                      {msg.practiceQuestion && (
                        <div className="practice-question-card">
                          <div className="pq-header">
                            <span className="badge badge-primary">Practice Question</span>
                            <span className="pq-difficulty">
                              Difficulty: {msg.practiceQuestion.difficulty}
                            </span>
                          </div>
                          <h4 className="pq-text">{msg.practiceQuestion.text}</h4>

                          {msg.practiceQuestion.codeSnippet && (
                            <pre className="pq-code">
                              <code>{msg.practiceQuestion.codeSnippet}</code>
                            </pre>
                          )}

                          <div className="pq-options">
                            {msg.practiceQuestion.options.map((opt) => {
                              const isSelected =
                                answeredQuestionId === msg.practiceQuestion?.id &&
                                selectedOptionId === opt.id;
                              const isCorrect = opt.id === msg.practiceQuestion?.correctOptionId;
                              const showResult = answeredQuestionId === msg.practiceQuestion?.id;

                              return (
                                <button
                                  key={opt.id}
                                  className={`pq-opt-btn ${isSelected ? 'selected' : ''} ${
                                    showResult && isCorrect ? 'correct' : ''
                                  } ${showResult && isSelected && !isCorrect ? 'wrong' : ''}`}
                                  onClick={() =>
                                    handleAnswerPractice(msg.practiceQuestion!, opt.id)
                                  }
                                  disabled={answeredQuestionId === msg.practiceQuestion?.id}
                                >
                                  <span className="pq-opt-letter">{opt.id.toUpperCase()}</span>
                                  <span>{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {answeredQuestionId === msg.practiceQuestion.id && (
                            <div className="pq-explanation">
                              <strong>Explanation:</strong> {msg.practiceQuestion.explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Render Structured Study Plan Steps if present */}
                      {msg.studyPlanSteps && (
                        <div className="study-plan-card">
                          <h4>Sequenced Action Milestones</h4>
                          <ol className="plan-steps-list">
                            {msg.studyPlanSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* User Input Bar */}
              <form onSubmit={handleSendPrompt} className="buddy-input-bar">
                <input
                  type="text"
                  placeholder="Ask a concept question, request practice, or ask for a study plan..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="buddy-input"
                />
                <button type="submit" className="btn btn-primary" disabled={!userInput.trim()}>
                  Ask ↵
                </button>
              </form>
            </main>
          </div>
        </div>
      )}

      {/* ========================================================
          CONNECT AS STUDY BUDDY MODAL (DEMO INTERACTION)
          ======================================================== */}
      {showConnectModal && selectedPeerForConnect && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <div className="modal-peer-summary">
                <span className="modal-avatar">{selectedPeerForConnect.avatar}</span>
                <div>
                  <h3>Connect with {selectedPeerForConnect.name}</h3>
                  <span className="text-muted">{selectedPeerForConnect.handle} • Lvl {selectedPeerForConnect.level}</span>
                </div>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowConnectModal(false)}
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleSubmitConnect} className="modal-form">
              <div className="form-group">
                <label>Study Topic / Competency Focus</label>
                <input
                  type="text"
                  required
                  value={connectTopic}
                  onChange={(e) => setConnectTopic(e.target.value)}
                  placeholder="e.g. JavaScript DOM Events & API Integration"
                />
              </div>

              <div className="form-group">
                <label>Collaboration Format</label>
                <select
                  value={connectMode}
                  onChange={(e) => setConnectMode(e.target.value)}
                >
                  <option value="Pair Coding">Pair Coding Session</option>
                  <option value="Flashcards & Quizzes">Flashcard & Quiz Drill</option>
                  <option value="Pomodoro Co-study">Pomodoro Sprint (25m Focus)</option>
                  <option value="Doubt Clearing">Doubt Clearing & Code Review</option>
                </select>
              </div>

              <div className="form-group">
                <label>Personal Invitation Note</label>
                <textarea
                  rows={3}
                  required
                  value={connectNote}
                  onChange={(e) => setConnectNote(e.target.value)}
                />
              </div>

              {/* Explicit Demo Notification */}
              <div className="demo-notice-box">
                <span className="notice-icon">ℹ️</span>
                <span className="notice-text">
                  <strong>Local Demo Interaction:</strong> Requests are saved locally in your study progress state and award <strong>+25 XP</strong>. No emails or network requests are sent to external users.
                </span>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Study Buddy Invite (+25 XP) 🚀
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
