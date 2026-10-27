import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  CustomQuiz,
  FlashcardDeck,
  PDFDocumentNote,
  SkillId,
  StudyResource
} from '../types/index.ts';
import { SKILLS } from '../data/skills.ts';
import {
  addStudyResource,
  createCustomQuiz,
  createFlashcardDeck,
  loadCommunities,
  loadCustomQuizzes,
  loadFlashcardDecks,
  loadPDFNotes,
  loadResources,
  recordQuizAttempt,
  savePDFNote,
  sendChatMessage,
  toggleCardMastery,
  toggleSaveResource
} from '../utilities/storage.ts';

type ToolTab = 'pdf' | 'flashcards' | 'quizzes' | 'resources';

export const StudyToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ToolTab>('flashcards');

  // --- PDF Workspace State ---
  const [pdfNotes, setPdfNotes] = useState<PDFDocumentNote[]>(loadPDFNotes());
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState(0);
  const [pdfSnippet, setPdfSnippet] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [pdfError, setPdfError] = useState('');

  // --- Flashcards State ---
  const [decks, setDecks] = useState<FlashcardDeck[]>(loadFlashcardDecks());
  const [activeDeckId, setActiveDeckId] = useState<string>(decks[0]?.id || '');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('Web Development');
  const [newDeckSkillId, setNewDeckSkillId] = useState<SkillId>('html-structure');
  const [newCardsList, setNewCardsList] = useState<Array<{ front: string; back: string }>>([
    { front: '', back: '' },
    { front: '', back: '' }
  ]);

  // --- Quiz Maker State ---
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>(loadCustomQuizzes());
  const [activeQuizId, setActiveQuizId] = useState<string>(quizzes[0]?.id || '');
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showNewQuizModal, setShowNewQuizModal] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDesc, setNewQuizDesc] = useState('');
  const [newQuizSubject, setNewQuizSubject] = useState('Web Development');
  const [newQuizSkillId, setNewQuizSkillId] = useState<SkillId>('html-structure');
  const [newQuizQuestions, setNewQuizQuestions] = useState<
    Array<{ text: string; options: string[]; correctOptionIndex: number; explanation: string }>
  >([
    {
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: ''
    }
  ]);

  // --- Resources State ---
  const [resources, setResources] = useState<StudyResource[]>(loadResources());
  const [resourceFilterSkill, setResourceFilterSkill] = useState<string>('all');
  const [showNewResourceModal, setShowNewResourceModal] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResCategory, setNewResCategory] = useState('Web Development');
  const [newResSkillId, setNewResSkillId] = useState<SkillId>('html-structure');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const communities = loadCommunities();
  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const activeCard = activeDeck?.cards[currentCardIndex];
  const knownCardsCount = activeDeck?.cards.filter((c) => c.known).length || 0;
  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || quizzes[0];

  // ==========================================
  // PDF Upload & Notes Handlers
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setPdfError('File size exceeds 8MB limit. Please upload a smaller document.');
      return;
    }

    setPdfFileName(file.name);
    setPdfFileSize(file.size);

    // Read readable content
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const snippet = text.slice(0, 1500) || `[Uploaded file: ${file.name} (${Math.round(file.size / 1024)} KB). Document loaded into your study workspace.]`;
      setPdfSnippet(snippet);
    };
    reader.onerror = () => {
      setPdfSnippet(`[Uploaded binary PDF: ${file.name} (${Math.round(file.size / 1024)} KB). Document loaded into notes workspace.]`);
    };
    reader.readAsText(file);
  };

  const handleSavePdfNotes = () => {
    if (!pdfFileName) return;
    const newNote: PDFDocumentNote = {
      id: `doc-${Date.now()}`,
      fileName: pdfFileName,
      fileSize: pdfFileSize,
      extractedSnippet: pdfSnippet || 'Document text loaded into workspace.',
      manualNotes,
      manualSummary,
      uploadedAt: new Date().toISOString().slice(0, 10)
    };
    savePDFNote(newNote);
    const updated = loadPDFNotes();
    setPdfNotes(updated);
    alert('Notes and document summary saved successfully!');
  };

  // ==========================================
  // Flashcards Handlers
  // ==========================================
  const handleToggleCardKnown = () => {
    if (!activeDeck || !activeCard) return;
    const updated = toggleCardMastery(activeDeck.id, activeCard.id);
    setDecks(updated);
  };

  const handleNextCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.cards.length);
  };

  const handlePrevCard = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeDeck.cards.length) % activeDeck.cards.length);
  };

  const handleCreateDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    const validCards = newCardsList.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      alert('Please add at least one complete card with front and back.');
      return;
    }

    const created = createFlashcardDeck({
      title: newDeckTitle.trim(),
      description: newDeckDesc.trim(),
      subject: newDeckSubject,
      skillId: newDeckSkillId,
      cards: validCards
    });

    const updated = loadFlashcardDecks();
    setDecks(updated);
    setActiveDeckId(created.id);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowNewDeckModal(false);
    setNewDeckTitle('');
    setNewDeckDesc('');
  };

  // ==========================================
  // Quiz Handlers
  // ==========================================
  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setCurrentQuizAnswers({ ...currentQuizAnswers, [qIdx]: optIdx });
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (currentQuizAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / activeQuiz.questions.length) * 100);
    setQuizScore(scorePct);
    recordQuizAttempt(activeQuiz.id, scorePct);
    setQuizzes(loadCustomQuizzes());
  };

  const handleCreateQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    const validQuestions = newQuizQuestions
      .filter((q) => q.text.trim() && q.options.filter((o) => o.trim()).length >= 2)
      .map((q, idx) => ({
        id: `qz-q-${Date.now()}-${idx}`,
        text: q.text,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation || 'Verified correct answer.'
      }));

    if (validQuestions.length === 0) {
      alert('Please add at least one question with options.');
      return;
    }

    const created = createCustomQuiz({
      title: newQuizTitle.trim(),
      description: newQuizDesc.trim(),
      subject: newQuizSubject,
      skillId: newQuizSkillId,
      questions: validQuestions
    });

    setQuizzes(loadCustomQuizzes());
    setActiveQuizId(created.id);
    setTakingQuiz(false);
    setShowNewQuizModal(false);
    setNewQuizTitle('');
    setNewQuizDesc('');
  };

  // ==========================================
  // Resources Handlers
  // ==========================================
  const handleToggleSaveResource = (id: string) => {
    const updated = toggleSaveResource(id);
    setResources(updated);
  };

  const handleShareToChannel = (res: StudyResource) => {
    const targetCommunity = communities.find((c) => c.isJoined) || communities[0];
    if (!targetCommunity) return;

    const defaultChannel =
      targetCommunity.channels.find((ch) => ch.type === 'resources') ||
      targetCommunity.channels[0];

    sendChatMessage({
      communityId: targetCommunity.id,
      channelId: defaultChannel.id,
      content: `Sharing study resource: **${res.title}** (${res.category})`,
      resourceLink: {
        title: res.title,
        url: res.url,
        skillId: res.skillId
      }
    });

    setShareFeedback(`Shared "${res.title}" to #${defaultChannel.name} in ${targetCommunity.name}!`);
    setTimeout(() => setShareFeedback(null), 4000);
  };

  const handleCreateResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResUrl.trim()) return;

    addStudyResource({
      title: newResTitle.trim(),
      description: newResDesc.trim(),
      url: newResUrl.trim(),
      category: newResCategory,
      skillId: newResSkillId
    });

    setResources(loadResources());
    setShowNewResourceModal(false);
    setNewResTitle('');
    setNewResDesc('');
    setNewResUrl('');
  };

  return (
    <div className="page study-tools-page">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Study Toolkit & Collaborative Workspace</h1>
          <p className="page-subtitle">
            Curate learning resources, practice with active-recall flashcards, create custom quizzes, and synthesize study notes.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/study-buddy')}
          >
            Ask Study Buddy 🤖
          </button>
        </div>
      </header>

      {/* Toolkit Navigation Tabs */}
      <nav className="toolkit-tab-bar" aria-label="Study tools switcher">
        <button
          className={`toolkit-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          <span>🃏</span> Flashcard Decks
        </button>
        <button
          className={`toolkit-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          <span>📝</span> Practice Quizzes
        </button>
        <button
          className={`toolkit-tab ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          <span>📄</span> PDF & Notes Workspace
        </button>
        <button
          className={`toolkit-tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <span>📌</span> Resource Library
        </button>
      </nav>

      {shareFeedback && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>✓ {shareFeedback}</span>
        </div>
      )}

      {/* ========================================================
          TAB 1: FLASHCARDS
          ======================================================== */}
      {activeTab === 'flashcards' && (
        <section className="flashcards-section">
          <div className="section-toolbar">
            <div className="deck-selector">
              <label>Select Deck:</label>
              <select
                value={activeDeckId}
                onChange={(e) => {
                  setActiveDeckId(e.target.value);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.cards.length} cards)
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewDeckModal(true)}
            >
              + Create Deck
            </button>
          </div>

          {activeDeck && activeCard ? (
            <div className="flashcard-study-container">
              {/* Progress Bar */}
              <div className="deck-progress-bar">
                <span>
                  Card {currentCardIndex + 1} of {activeDeck.cards.length}
                </span>
                <span className="mastery-count">
                  {knownCardsCount} / {activeDeck.cards.length} mastered (
                  {Math.round((knownCardsCount / activeDeck.cards.length) * 100)}%)
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                className={`flashcard-card ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                aria-label="Click to flip card"
              >
                <div className="card-face card-front">
                  <span className="face-tag">QUESTION / PROMPT</span>
                  <div className="card-content-text">{activeCard.front}</div>
                  <span className="flip-hint">Click or press Space to flip ↺</span>
                </div>
                <div className="card-face card-back">
                  <span className="face-tag">ANSWER / EXPLANATION</span>
                  <div className="card-content-text">{activeCard.back}</div>
                  <span className="flip-hint">Click to flip back ↺</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flashcard-controls">
                <button className="btn btn-secondary" onClick={handlePrevCard}>
                  ← Previous
                </button>

                <button
                  className={`btn ${activeCard.known ? 'btn-success' : 'btn-outline'}`}
                  onClick={handleToggleCardKnown}
                >
                  {activeCard.known ? '✓ Mastered' : 'Mark as Known'}
                </button>

                <button className="btn btn-secondary" onClick={handleNextCard}>
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state-box">
              <p>No cards in this deck. Add cards or create a new deck!</p>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 2: QUIZZES
          ======================================================== */}
      {activeTab === 'quizzes' && (
        <section className="quiz-section">
          <div className="section-toolbar">
            <div className="deck-selector">
              <label>Select Practice Quiz:</label>
              <select
                value={activeQuizId}
                onChange={(e) => {
                  setActiveQuizId(e.target.value);
                  setTakingQuiz(false);
                  setQuizScore(null);
                  setCurrentQuizAnswers({});
                }}
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.questions.length} Qs) {q.bestScore ? `— Best: ${q.bestScore}%` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewQuizModal(true)}
            >
              + Create Quiz
            </button>
          </div>

          {activeQuiz && (
            <div className="quiz-viewer-card">
              <header className="quiz-info-header">
                <div>
                  <h2>{activeQuiz.title}</h2>
                  <p>{activeQuiz.description}</p>
                </div>
                <div className="quiz-meta-pill">
                  <span>{activeQuiz.subject}</span>
                  {activeQuiz.bestScore !== undefined && (
                    <span className="score-badge">High Score: {activeQuiz.bestScore}%</span>
                  )}
                </div>
              </header>

              {!takingQuiz ? (
                <div className="quiz-start-box">
                  <p>
                    This quiz contains <strong>{activeQuiz.questions.length}</strong> multiple-choice questions.
                    Test your understanding with instant score calculation and detailed explanations.
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      setTakingQuiz(true);
                      setQuizScore(null);
                      setCurrentQuizAnswers({});
                    }}
                  >
                    Start Practice Quiz 🚀
                  </button>
                </div>
              ) : (
                <div className="quiz-questions-stream">
                  {activeQuiz.questions.map((q, qIdx) => (
                    <div key={q.id} className="quiz-question-item">
                      <span className="q-number">Question {qIdx + 1}</span>
                      <h3 className="q-text">{q.text}</h3>
                      <div className="q-options-grid">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = currentQuizAnswers[qIdx] === optIdx;
                          const showCorrect =
                            quizScore !== null && optIdx === q.correctOptionIndex;
                          const showWrong =
                            quizScore !== null && isSelected && optIdx !== q.correctOptionIndex;

                          return (
                            <button
                              key={optIdx}
                              className={`quiz-option-btn ${isSelected ? 'selected' : ''} ${
                                showCorrect ? 'correct' : ''
                              } ${showWrong ? 'wrong' : ''}`}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              disabled={quizScore !== null}
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="option-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {quizScore !== null && (
                        <div className="q-explanation-box">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {quizScore === null ? (
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(currentQuizAnswers).length < activeQuiz.questions.length}
                    >
                      Submit Quiz Answers ↵
                    </button>
                  ) : (
                    <div className="quiz-result-summary">
                      <h3>Quiz Completed!</h3>
                      <div className="score-display">Your Score: {quizScore}%</div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setTakingQuiz(false);
                          setQuizScore(null);
                          setCurrentQuizAnswers({});
                        }}
                      >
                        Retake or Choose Another Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          TAB 3: PDF & NOTES WORKSPACE
          ======================================================== */}
      {activeTab === 'pdf' && (
        <section className="pdf-workspace-section">
          {/* Disclaimer banner */}
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>
              ℹ️ <strong>Manual Notes Workspace:</strong> Upload lecture documents (PDF/TXT) to view text and write manual notes and summaries. No automated AI summarization model is connected.
            </span>
          </div>

          <div className="pdf-workspace-grid">
            {/* Left: Upload & Document Viewer */}
            <div className="pdf-viewer-pane">
              <div className="upload-box">
                <label className="upload-label">
                  <span className="upload-icon">📁</span>
                  <span>Upload PDF or Text Document</span>
                  <span className="upload-sub">Supports PDF, TXT (up to 8MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {pdfError && <div className="alert alert-danger">{pdfError}</div>}

              {pdfFileName && (
                <div className="uploaded-file-meta">
                  <span className="file-name">📄 {pdfFileName}</span>
                  <span className="file-size">({Math.round(pdfFileSize / 1024)} KB)</span>
                </div>
              )}

              <div className="document-preview-container">
                <h4>Document Content Preview</h4>
                <div className="document-text-box">
                  {pdfSnippet || (
                    <p className="placeholder-text">
                      Upload a study document or syllabus note to view content preview here.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Manual Notes & Summary Editor */}
            <div className="notes-editor-pane">
              <h3>Manual Notes & Synthesis</h3>

              <div className="form-group">
                <label>Key Takeaways & Summary</label>
                <textarea
                  rows={4}
                  placeholder="Synthesize the primary core ideas in your own words..."
                  value={manualSummary}
                  onChange={(e) => setManualSummary(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Study Notes & Code Snippets</label>
                <textarea
                  rows={8}
                  placeholder="Capture detailed definitions, formula derivations, questions, and revision notes..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={handleSavePdfNotes}
                disabled={!pdfFileName && !manualNotes.trim()}
              >
                Save Notes & Summary to Library (+25 XP)
              </button>

              {pdfNotes.length > 0 && (
                <div className="saved-notes-history" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Saved Document Notes ({pdfNotes.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {pdfNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setPdfFileName(note.fileName);
                          setPdfSnippet(note.extractedSnippet);
                          setManualNotes(note.manualNotes);
                          setManualSummary(note.manualSummary);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem',
                          backgroundColor: '#0f172a',
                          borderRadius: '4px',
                          border: '1px solid #1e293b',
                          cursor: 'pointer',
                          fontSize: '0.78rem'
                        }}
                      >
                        <strong>📄 {note.fileName}</strong> — <span style={{ color: 'var(--text-muted)' }}>{note.uploadedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 4: RESOURCE LIBRARY
          ======================================================== */}
      {activeTab === 'resources' && (
        <section className="resources-section">
          <div className="section-toolbar">
            <div className="deck-selector">
              <label>Filter by Competency Skill:</label>
              <select
                value={resourceFilterSkill}
                onChange={(e) => setResourceFilterSkill(e.target.value)}
              >
                <option value="all">All Competencies</option>
                {SKILLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowNewResourceModal(true)}
            >
              + Add Resource
            </button>
          </div>

          <div className="resources-grid">
            {resources
              .filter(
                (r) =>
                  resourceFilterSkill === 'all' || r.skillId === resourceFilterSkill
              )
              .map((res) => (
                <article key={res.id} className="resource-card">
                  <div className="res-card-top">
                    <span className="res-badge">{res.category}</span>
                    <button
                      className={`bookmark-btn ${res.isSaved ? 'bookmarked' : ''}`}
                      onClick={() => handleToggleSaveResource(res.id)}
                      title={res.isSaved ? 'Saved in personal library' : 'Save to library'}
                    >
                      {res.isSaved ? '★ Saved' : '☆ Save'}
                    </button>
                  </div>

                  <h3 className="res-title">
                    <a href={res.url} target="_blank" rel="noopener noreferrer">
                      {res.title} ↗
                    </a>
                  </h3>
                  <p className="res-desc">{res.description}</p>

                  <div className="res-meta-row">
                    <span>Shared by {res.sharedBy}</span>
                    <span>❤️ {res.likes} likes</span>
                  </div>

                  <div className="res-actions-row">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      Open Link ↗
                    </a>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleShareToChannel(res)}
                      title="Share to an active study circle channel"
                    >
                      Share to Channel 💬
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      )}

      {/* Modal: New Flashcard Deck */}
      {showNewDeckModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <h3>Create Flashcard Deck</h3>
              <button className="close-btn" onClick={() => setShowNewDeckModal(false)}>
                ✕
              </button>
            </header>
            <form onSubmit={handleCreateDeckSubmit} className="modal-form">
              <div className="form-group">
                <label>Deck Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript Array Methods"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Map, filter, reduce, find, and slice concepts"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Subject Category</label>
                <select
                  value={newDeckSubject}
                  onChange={(e) => setNewDeckSubject(e.target.value)}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="CSS">CSS</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Associated Competency Skill</label>
                <select
                  value={newDeckSkillId}
                  onChange={(e) => setNewDeckSkillId(e.target.value as SkillId)}
                >
                  {SKILLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="cards-creator-list">
                <h4>Cards ({newCardsList.length})</h4>
                {newCardsList.map((c, i) => (
                  <div key={i} className="card-input-row">
                    <input
                      type="text"
                      placeholder={`Front ${i + 1} (Prompt / Question)`}
                      value={c.front}
                      onChange={(e) => {
                        const copy = [...newCardsList];
                        copy[i].front = e.target.value;
                        setNewCardsList(copy);
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`Back ${i + 1} (Answer / Solution)`}
                      value={c.back}
                      onChange={(e) => {
                        const copy = [...newCardsList];
                        copy[i].back = e.target.value;
                        setNewCardsList(copy);
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setNewCardsList([...newCardsList, { front: '', back: '' }])}
                >
                  + Add Another Card
                </button>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowNewDeckModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Deck (+60 XP)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Custom Quiz */}
      {showNewQuizModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <h3>Create Custom Practice Quiz</h3>
              <button className="close-btn" onClick={() => setShowNewQuizModal(false)}>
                ✕
              </button>
            </header>
            <form onSubmit={handleCreateQuizSubmit} className="modal-form">
              <div className="form-group">
                <label>Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSS Flexbox Fundamentals"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Subject Category</label>
                <select
                  value={newQuizSubject}
                  onChange={(e) => setNewQuizSubject(e.target.value)}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="CSS">CSS</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Associated Competency Skill</label>
                <select
                  value={newQuizSkillId}
                  onChange={(e) => setNewQuizSkillId(e.target.value as SkillId)}
                >
                  {SKILLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Questions Builder */}
              {newQuizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="quiz-builder-card">
                  <h4>Question {qIdx + 1}</h4>
                  <input
                    type="text"
                    required
                    placeholder="Enter question text..."
                    value={q.text}
                    onChange={(e) => {
                      const copy = [...newQuizQuestions];
                      copy[qIdx].text = e.target.value;
                      setNewQuizQuestions(copy);
                    }}
                    style={{ marginBottom: '0.5rem' }}
                  />

                  <div className="options-inputs">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="opt-row">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => {
                            const copy = [...newQuizQuestions];
                            copy[qIdx].correctOptionIndex = optIdx;
                            setNewQuizQuestions(copy);
                          }}
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newQuizQuestions];
                            copy[qIdx].options[optIdx] = e.target.value;
                            setNewQuizQuestions(copy);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Explanation for the correct answer..."
                    value={q.explanation}
                    onChange={(e) => {
                      const copy = [...newQuizQuestions];
                      copy[qIdx].explanation = e.target.value;
                      setNewQuizQuestions(copy);
                    }}
                    style={{ marginTop: '0.5rem' }}
                  />
                </div>
              ))}

              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowNewQuizModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Quiz (+80 XP)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Resource */}
      {showNewResourceModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <header className="modal-header">
              <h3>Add Study Resource</h3>
              <button className="close-btn" onClick={() => setShowNewResourceModal(false)}>
                ✕
              </button>
            </header>
            <form onSubmit={handleCreateResourceSubmit} className="modal-form">
              <div className="form-group">
                <label>Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript Event Loop Explained"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Resource URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief note on what this resource covers..."
                  value={newResDesc}
                  onChange={(e) => setNewResDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Resource Category</label>
                <select
                  value={newResCategory}
                  onChange={(e) => setNewResCategory(e.target.value)}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="HTML">HTML</option>
                  <option value="CSS">CSS</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Competency Skill Tag</label>
                <select
                  value={newResSkillId}
                  onChange={(e) => setNewResSkillId(e.target.value as SkillId)}
                >
                  {SKILLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowNewResourceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Publish Resource (+40 XP)
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
