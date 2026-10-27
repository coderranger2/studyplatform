import React, { useState } from 'react';
import type { Question, SkillCategory, SkillId } from '../types/index.ts';
import { SKILLS, SKILL_MAP } from '../data/skills.ts';
import { SAMPLE_QUESTIONS } from '../data/questions.ts';
import { analyzeSkillGaps } from '../engine/skillGapAnalyzer.ts';
import { awardXP, loadUserProgress } from '../utilities/storage.ts';

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

export const StudyBuddyPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<SkillCategory>('HTML');
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId>('html-structure');
  const [userInput, setUserInput] = useState('');
  const [answeredQuestionId, setAnsweredQuestionId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const progress = loadUserProgress();
  const latestAttempt = progress.latestAttempt;
  const skillGaps = analyzeSkillGaps(SKILLS, latestAttempt || null);

  const [conversation, setConversation] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: 'Hello! I am your SkillForge Study Buddy. I provide deterministic, rule-based study assistance, structured study plans, concept breakdowns, and practice questions calibrated to your competency gaps.'
    }
  ]);

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
    const matching = SAMPLE_QUESTIONS.filter((q) => q.skillId === selectedSkillId);
    const question = matching[conversation.length % (matching.length || 1)] || SAMPLE_QUESTIONS[0];

    setAnsweredQuestionId(null);
    setSelectedOptionId(null);

    addAssistantResponse(
      `Here is a practice question for **${SKILL_MAP[question.skillId]?.name}**:`,
      question
    );
  }, [selectedSkillId, conversation.length, addAssistantResponse]);

  const handleGenerateStudyPlan = React.useCallback(() => {
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
  }, [skillGaps, addAssistantResponse]);

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

    // Rule-based deterministic response matching
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
      const currentSkill = SKILL_MAP[selectedSkillId];
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
          <h1 className="page-title">Study Buddy Assistant</h1>
          <p className="page-subtitle">
            Deterministic, rule-based learning tutor that provides instant explanations, calibrated practice questions, and prerequisite study schedules.
          </p>
        </div>
      </header>

      {/* Prominent Honesty Disclaimer */}
      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>
          🤖 <strong>Rule-Based Architecture:</strong> This assistant operates deterministically using SkillForge's curated question banks and competency engine. No external AI model or paid API is connected.
        </span>
      </div>

      <div className="study-buddy-container">
        {/* Left Control & Subject Panel */}
        <aside className="buddy-controls-pane">
          <h3>Study Parameters</h3>

          <div className="form-group">
            <label>Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                const sub = e.target.value as SkillCategory;
                setSelectedSubject(sub);
                const firstSkill = SKILLS.find((s) => s.category === sub);
                if (firstSkill) setSelectedSkillId(firstSkill.id);
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
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value as SkillId)}
            >
              {SKILLS.filter((s) => s.category === selectedSubject).map((s) => (
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
            <h4>Detected Skill Gaps ({skillGaps.filter((g) => g.hasGap).length})</h4>
            <ul className="gap-bullets">
              {skillGaps
                .filter((g) => g.hasGap)
                .slice(0, 3)
                .map((g) => (
                  <li key={g.skillId}>
                    <span>{g.skillName}</span>
                  </li>
                ))}
            </ul>
          </div>
        </aside>

        {/* Central Conversational Transcript Area */}
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
  );
};
