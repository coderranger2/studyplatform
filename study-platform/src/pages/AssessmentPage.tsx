import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_QUESTIONS } from '../data/questions.ts';
import { SKILL_MAP } from '../data/skills.ts';
import { scoreAssessment } from '../engine/assessmentScorer.ts';
import { recordAssessmentAttempt } from '../utilities/storage.ts';
import { SkillBadge } from '../components/common/SkillBadge.tsx';
import { ProgressBar } from '../components/common/ProgressBar.tsx';
import type { UserAnswers } from '../types/index.ts';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalQuestions = SAMPLE_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount === 0) {
      setValidationError('Please answer at least one question before submitting your assessment.');
      return;
    }

    // Pure deterministic scoring
    const attempt = scoreAssessment(SAMPLE_QUESTIONS, answers);
    // Persist to local storage
    recordAssessmentAttempt(attempt);
    // Navigate to results
    navigate('/results');
  };

  // Demo helpers for easy verification without manual clicking
  const fillSampleAllCorrect = () => {
    const perfect: UserAnswers = {};
    for (const q of SAMPLE_QUESTIONS) {
      perfect[q.id] = q.correctOptionId;
    }
    setAnswers(perfect);
    setValidationError(null);
  };

  const fillSampleMixedGaps = () => {
    // HTML questions correct, CSS & JS with gaps
    const mixed: UserAnswers = {
      'q-html-1': 'b', // correct
      'q-html-2': 'b', // correct
      'q-form-1': 'a', // incorrect
      'q-form-2': 'c', // correct
      'q-css-1': 'a',  // incorrect
      'q-css-2': 'b',  // incorrect
      'q-resp-1': 'b', // correct
      'q-resp-2': 'a', // incorrect
      'q-js-1': 'c',   // correct
      'q-js-2': 'b',   // incorrect
      'q-dom-1': 'a',  // correct
      'q-dom-2': 'a'   // incorrect
    };
    setAnswers(mixed);
    setValidationError(null);
  };

  const handleClear = () => {
    setAnswers({});
    setValidationError(null);
  };

  return (
    <div className="page assessment-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Diagnostic Skill Assessment</h1>
          <p className="page-subtitle">
            Evaluate your knowledge across HTML Structure, Forms, CSS Fundamentals, Responsive Layouts, JavaScript, and DOM Events.
          </p>
        </div>

        <div className="demo-actions-bar">
          <span className="demo-label">Testing Shortcuts:</span>
          <button type="button" onClick={fillSampleAllCorrect} className="btn-sm btn-outline">
            Prefill 100% Correct
          </button>
          <button type="button" onClick={fillSampleMixedGaps} className="btn-sm btn-outline">
            Prefill Mixed Gaps
          </button>
          <button type="button" onClick={handleClear} className="btn-sm btn-ghost">
            Clear All
          </button>
        </div>
      </header>

      {/* Sticky Progress Bar */}
      <div className="assessment-sticky-progress">
        <ProgressBar
          value={progressPercent}
          label={`Answered ${answeredCount} of ${totalQuestions} questions`}
        />
      </div>

      {validationError && (
        <div className="alert alert-error">
          <span>⚠️ {validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="assessment-form">
        <div className="questions-list">
          {SAMPLE_QUESTIONS.map((question, index) => {
            const skill = SKILL_MAP[question.skillId];
            const selectedOption = answers[question.id];

            return (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  <div className="question-badges">
                    <SkillBadge category={skill?.category} text={skill?.name} />
                    <span className={`difficulty-badge diff-${question.difficulty}`}>
                      {question.difficulty}
                    </span>
                  </div>
                </div>

                <div className="question-body">
                  <p className="question-text">{question.text}</p>

                  {question.codeSnippet && (
                    <pre className="code-snippet">
                      <code>{question.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="options-grid">
                    {question.options.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`option-label ${isSelected ? 'option-selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => handleSelectOption(question.id, opt.id)}
                            className="option-radio"
                          />
                          <span className="option-indicator">{opt.id.toUpperCase()}</span>
                          <span className="option-text">{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="submit-bar">
          <div className="submit-summary">
            <span>
              {answeredCount === totalQuestions
                ? 'All questions completed!'
                : `${totalQuestions - answeredCount} question(s) remaining`}
            </span>
          </div>
          <button type="submit" className="btn btn-primary btn-lg">
            Submit Assessment & Analyze Gaps →
          </button>
        </div>
      </form>
    </div>
  );
};
