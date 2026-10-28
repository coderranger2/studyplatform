import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
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
  deletePDFNote,
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
import { showToast } from '../components/common/Toast.tsx';

// Configure PDF.js worker using Vite asset URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type ToolTab = 'pdf' | 'flashcards' | 'quizzes' | 'resources';

export const StudyToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as ToolTab | null;
  const queryDeck = searchParams.get('deck');
  const queryQuiz = searchParams.get('quiz');

  const [activeTab, setActiveTab] = useState<ToolTab>(
    queryTab && ['pdf', 'flashcards', 'quizzes', 'resources'].includes(queryTab) ? queryTab : 'flashcards'
  );

  // --- PDF Workspace State ---
  const [pdfNotes, setPdfNotes] = useState<PDFDocumentNote[]>(loadPDFNotes());
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState(0);
  const [pdfSnippet, setPdfSnippet] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [pdfFeedback, setPdfFeedback] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  // Auto-dismiss feedback toast after 4s
  useEffect(() => {
    if (pdfFeedback) {
      const timer = setTimeout(() => setPdfFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [pdfFeedback]);

  // Sync tab/deck/quiz query params if navigated with specific target
  useEffect(() => {
    if (queryTab && ['pdf', 'flashcards', 'quizzes', 'resources'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
    if (queryDeck) {
      const matchedDeck = decks.find((d) => d.id === queryDeck || d.skillId === queryDeck);
      if (matchedDeck) {
        setActiveDeckId(matchedDeck.id);
        setCurrentCardIndex(0);
        setIsFlipped(false);
      }
    }
    if (queryQuiz) {
      const matchedQuiz = quizzes.find((q) => q.id === queryQuiz || q.skillId === queryQuiz);
      if (matchedQuiz) {
        setActiveQuizId(matchedQuiz.id);
      }
    }
  }, [queryTab, queryDeck, queryQuiz, decks, quizzes]);

  /**
   * Client-side extractive summarizer: extracts, deduplicates, and organizes
   * core key takeaways from study documents into clean, readable points.
   */
  const generateSummary = (text: string): string => {
    if (!text || text.length < 30) return '';

    // 1. Repair hyphenated words broken across line breaks (e.g. "perfor- mance" -> "performance")
    const repaired = text
      .replace(/(\b[a-zA-Z]+)-\s*[\r\n]+\s*([a-zA-Z]+\b)/g, '$1$2')
      .replace(/\r\n/g, '\n');

    // 2. Split into distinct lines / segments
    const rawLines = repaired
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    // 3. Filter boilerplate and extract candidate complete statements
    const boilerplateRegex = /^(page\s+\d+(\s+of\s+\d+)?|\d+|\u00a9.*|all rights reserved.*|table of contents.*|index.*)$/i;
    const candidates: string[] = [];

    for (const line of rawLines) {
      if (boilerplateRegex.test(line)) continue;

      // Split line into sentences if it contains multiple statements
      const sentences = line.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
      for (const rawS of sentences) {
        // Strip leading numbering, bullets, list markers (e.g. "1. ", "• ", "- ", "a) ")
        const cleaned = rawS
          .replace(/^[\s•*–—\d.)\]-]+/, '')
          .replace(/\s{2,}/g, ' ')
          .trim();

        const words = cleaned.split(/\s+/);
        if (
          words.length >= 6 &&
          words.length <= 45 &&
          cleaned.length >= 25 &&
          cleaned.length <= 250 &&
          /[a-zA-Z]/.test(cleaned)
        ) {
          candidates.push(cleaned);
        }
      }
    }

    if (candidates.length === 0) {
      return 'Could not extract organized key points from this document.';
    }

    // 4. Deduplicate sentences (exact or high prefix similarity)
    const uniqueCandidates: string[] = [];
    const seenPrefixes = new Set<string>();
    for (const c of candidates) {
      const key = c.toLowerCase().slice(0, 45);
      if (!seenPrefixes.has(key)) {
        seenPrefixes.add(key);
        uniqueCandidates.push(c);
      }
    }

    // 5. Score candidate points by relevance, length, and document coverage
    const keywords = [
      'important', 'key', 'main', 'summary', 'conclusion', 'result', 'define',
      'concept', 'principle', 'method', 'approach', 'objective', 'purpose',
      'function', 'component', 'system', 'process', 'theory', 'learn', 'study',
      'overview', 'introduction', 'performance', 'architecture', 'strategy',
      'technique', 'critical', 'fundamental', 'requires', 'measures', 'optimal',
      'essential', 'benefit', 'advantage', 'feature', 'structure', 'analyze'
    ];

    const scored = uniqueCandidates.map((sentence, idx) => {
      const words = sentence.toLowerCase().split(/\W+/).filter(Boolean);
      const wordCount = words.length;

      // Ideal study takeaway length (10-32 words)
      const lengthScore = wordCount >= 10 && wordCount <= 32 ? 3 : 1.5;

      // Keyword relevance score
      const keywordMatches = words.filter((w) => keywords.some((k) => w.startsWith(k))).length;
      const keywordScore = Math.min(keywordMatches * 1.5, 6);

      // Distribute coverage across document sections
      const total = uniqueCandidates.length;
      const posRatio = idx / Math.max(1, total - 1);
      const positionScore = posRatio < 0.2 ? 2.5 : posRatio > 0.8 ? 2.2 : 1.8;

      return {
        sentence,
        score: lengthScore + keywordScore + positionScore,
        origIndex: idx
      };
    });

    // 6. Select top 4 to 6 representative points
    const targetCount = Math.min(6, Math.max(3, Math.round(uniqueCandidates.length * 0.45)));
    const topPoints = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      // Re-order by document sequence for coherent logical progression
      .sort((a, b) => a.origIndex - b.origIndex)
      .map((item) => {
        let pt = item.sentence;
        // Capitalize first character
        pt = pt.charAt(0).toUpperCase() + pt.slice(1);
        // Ensure terminates with punctuation
        if (!/[.!?]$/.test(pt)) {
          pt += '.';
        }
        return `• ${pt}`;
      });

    return topPoints.join('\n\n');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError('');
    setPdfFeedback(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setPdfError('File size exceeds 8MB limit. Please upload a smaller document.');
      return;
    }

    setPdfFileName(file.name);
    setPdfFileSize(file.size);
    setIsSummarizing(true);

    try {
      let extractedText = '';

      if (file.name.toLowerCase().endsWith('.pdf')) {
        // Read binary array buffer for PDF.js parsing
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true
        });
        const pdfDoc = await loadingTask.promise;
        const pageTexts: string[] = [];

        console.log(`[PDF Diagnostics] File: "${file.name}", Size: ${file.size} bytes, Pages: ${pdfDoc.numPages}`);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageLines: string[] = [];
          let currentLine = '';
          let lastY: number | null = null;

          for (const item of textContent.items) {
            if ('str' in item && typeof item.str === 'string') {
              if (!item.str && !item.hasEOL) continue;
              const currentY = Array.isArray(item.transform) ? item.transform[5] : null;
              const isNewLine = (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4) || item.hasEOL;

              if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
                currentLine += ' ';
              }
              currentLine += item.str;

              if (isNewLine) {
                if (currentLine.trim()) {
                  pageLines.push(currentLine.trim());
                }
                currentLine = '';
              }
              lastY = currentY;
            }
          }
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }

          console.log(`[PDF Diagnostics] Page ${pageNum}: ${textContent.items.length} text items`);
          const pageStr = pageLines.join('\n');
          if (pageStr) {
            pageTexts.push(pageStr);
          }
        }

        extractedText = pageTexts.join('\n\n');

        // Log diagnostics for raw extracted text & cleaned text
        console.log('[PDF Diagnostics] Raw extracted (first 300 chars):', extractedText.slice(0, 300));
        const cleanedPreview = extractedText.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
        console.log('[PDF Diagnostics] After cleaning (first 300 chars):', cleanedPreview.slice(0, 300));

        if (extractedText.length > 0) {
          const sample = extractedText.slice(0, 20);
          const sampleCodes = Array.from(sample)
            .map((c) => `${c} (U+${c.charCodeAt(0).toString(16).padStart(4, '0')})`)
            .join(', ');
          console.log('[PDF Diagnostics] Character codes sample:', sampleCodes);
        }
      } else {
        // Text / Markdown documents
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        const fallbackMsg = `[Uploaded file: ${file.name} (${Math.round(file.size / 1024)} KB). No selectable text content could be extracted from this document.]`;
        setPdfSnippet(fallbackMsg);
        setManualSummary('');
        setPdfFeedback({
          type: 'info',
          message: 'Document loaded, but no selectable text was found. You can add notes & summary manually.'
        });
        setIsSummarizing(false);
        return;
      }

      const snippet = extractedText.slice(0, 1500);
      setPdfSnippet(snippet);

      // Auto-generate summary from valid extracted text
      const autoSummary = generateSummary(extractedText);
      if (autoSummary) {
        setManualSummary(autoSummary);
        setPdfFeedback({
          type: 'success',
          message: `Auto-summary generated from "${file.name}"! You can edit it below.`
        });
      }
    } catch (err: unknown) {
      console.error('[PDF Diagnostics] Extraction failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown parsing error';
      setPdfError(`Failed to extract text from "${file.name}": ${errMsg}`);
      setPdfSnippet(`[Uploaded file: ${file.name} (${Math.round(file.size / 1024)} KB). Extraction error.]`);
      setManualSummary('');
      setPdfFeedback({
        type: 'warning',
        message: 'Could not extract text automatically. Write your summary manually below.'
      });
    } finally {
      setIsSummarizing(false);
    }
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
    const result = savePDFNote(newNote);
    if (result.duplicate) {
      setPdfFeedback({ type: 'warning', message: `"${pdfFileName}" is already saved! Remove it first to save again.` });
      return;
    }
    const updated = loadPDFNotes();
    setPdfNotes(updated);
    setPdfFeedback({ type: 'success', message: 'Notes & summary saved successfully! +25 XP' });
  };

  const handleDeletePdfNote = (noteId: string) => {
    const updated = deletePDFNote(noteId);
    setPdfNotes(updated);
    setPdfFeedback({ type: 'info', message: 'Saved note removed from library.' });
  };

  const handleClearPdfWorkspace = () => {
    setPdfFileName('');
    setPdfFileSize(0);
    setPdfSnippet('');
    setManualNotes('');
    setManualSummary('');
    setPdfError('');
    setPdfFeedback(null);
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
      showToast('Please add at least one complete card with front and back.', 'warning');
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
      showToast('Please add at least one question with options.', 'warning');
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
          {/* Info banner */}
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>
              ℹ️ <strong>PDF & Notes Workspace:</strong> Upload study documents to auto-summarize content, write notes, and save to your library. Text files get auto-summaries; binary PDFs can be summarized manually.
            </span>
          </div>

          {/* Feedback Toast */}
          {pdfFeedback && (
            <div
              className={`alert ${
                pdfFeedback.type === 'success' ? 'alert-success' :
                pdfFeedback.type === 'warning' ? 'alert-warning' : 'alert-info'
              }`}
              style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              <span>
                {pdfFeedback.type === 'success' && '✓ '}
                {pdfFeedback.type === 'warning' && '⚠ '}
                {pdfFeedback.type === 'info' && 'ℹ️ '}
                {pdfFeedback.message}
              </span>
              <button
                onClick={() => setPdfFeedback(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0 0.25rem'
                }}
              >
                ✕
              </button>
            </div>
          )}

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
                <div className="uploaded-file-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span className="file-name">📄 {pdfFileName}</span>
                    <span className="file-size">({Math.round(pdfFileSize / 1024)} KB)</span>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={handleClearPdfWorkspace}
                    title="Clear current document"
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    ✕ Clear
                  </button>
                </div>
              )}

              {isSummarizing && (
                <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  ⏳ Generating auto-summary...
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

            {/* Right: Notes & Summary Editor */}
            <div className="notes-editor-pane">
              <h3>Notes & Auto-Summary</h3>

              <div className="form-group">
                <label>Key Takeaways & Summary {manualSummary && '(auto-generated, editable)'}</label>
                <textarea
                  rows={8}
                  placeholder="Summary will be auto-generated on upload, or write your own..."
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
                    📚 Saved Document Notes ({pdfNotes.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {pdfNotes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          padding: '0.45rem 0.65rem',
                          backgroundColor: '#0f172a',
                          borderRadius: '4px',
                          border: '1px solid #1e293b',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div
                          onClick={() => {
                            setPdfFileName(note.fileName);
                            setPdfFileSize(note.fileSize);
                            setPdfSnippet(note.extractedSnippet);
                            setManualNotes(note.manualNotes);
                            setManualSummary(note.manualSummary);
                          }}
                          style={{ cursor: 'pointer', flex: 1 }}
                        >
                          <strong>📄 {note.fileName}</strong> — <span style={{ color: 'var(--text-muted)' }}>{note.uploadedAt}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePdfNote(note.id);
                          }}
                          className="btn btn-sm btn-ghost"
                          title="Remove this saved note"
                          style={{
                            color: '#ef4444',
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.4rem',
                            flexShrink: 0
                          }}
                        >
                          🗑 Remove
                        </button>
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
