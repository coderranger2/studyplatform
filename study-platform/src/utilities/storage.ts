import type {
  AssessmentAttempt,
  Badge,
  ChatMessage,
  Community,
  CustomQuiz,
  FlashcardDeck,
  GuidanceRequest,
  LeaderboardEntry,
  PDFDocumentNote,
  ReportedItem,
  StudentProfile,
  StudyResource,
  TeacherProfile,
  TeacherVerificationApplication,
  UserGamificationState,
  UserProgressState
} from '../types/index.ts';

import {
  INITIAL_BADGES,
  INITIAL_COMMUNITIES,
  INITIAL_FLASHCARDS,
  INITIAL_LEADERBOARD,
  INITIAL_MESSAGES,
  INITIAL_QUIZZES,
  INITIAL_RESOURCES,
  INITIAL_STUDENT_PROFILE,
  INITIAL_TEACHERS
} from '../data/socialData.ts';

const PROGRESS_STORAGE_KEY = 'study_platform_progress_v1';
const COMMUNITIES_STORAGE_KEY = 'study_platform_communities_v1';
const MESSAGES_STORAGE_KEY = 'study_platform_messages_v1';
const RESOURCES_STORAGE_KEY = 'study_platform_resources_v1';
const FLASHCARDS_STORAGE_KEY = 'study_platform_flashcards_v1';
const QUIZZES_STORAGE_KEY = 'study_platform_quizzes_v1';
const PDF_NOTES_STORAGE_KEY = 'study_platform_pdf_notes_v1';
const TEACHERS_STORAGE_KEY = 'study_platform_teachers_v1';
const GUIDANCE_STORAGE_KEY = 'study_platform_guidance_v1';
const TEACHER_APPS_STORAGE_KEY = 'study_platform_teacher_apps_v1';
const GAMIFICATION_STORAGE_KEY = 'study_platform_gamification_v1';
const PROFILE_STORAGE_KEY = 'study_platform_profile_v1';
const REPORTS_STORAGE_KEY = 'study_platform_reports_v1';

const DEFAULT_PROGRESS: UserProgressState = {
  completedActivityIds: [],
  assessmentAttempts: []
};

const DEFAULT_GAMIFICATION: UserGamificationState = {
  xp: 850,
  level: 4,
  streakDays: 3,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  unlockedBadgeIds: ['badge-first-step', 'badge-streak-3'],
  completedActionKeys: ['seed_welcome_bonus', 'seed_streak_bonus']
};

// In-memory fallback if localStorage is unavailable
const memoryCache: Record<string, string> = {};

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // Storage access may throw in security restricted environments
  }
  return null;
}

function readStorage(key: string): string | null {
  const storage = getStorage();
  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      return memoryCache[key] ?? null;
    }
  }
  return memoryCache[key] ?? null;
}

function writeStorage(key: string, value: string): void {
  const storage = getStorage();
  memoryCache[key] = value;
  if (storage) {
    try {
      storage.setItem(key, value);
    } catch {
      // Quota exceeded or disabled
    }
  }
}

function removeStorage(key: string): void {
  delete memoryCache[key];
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      // Ignored
    }
  }
}

// ==========================================
// Competency & Learning Progress (Preserved)
// ==========================================

export function loadUserProgress(): UserProgressState {
  try {
    const raw = readStorage(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PROGRESS };
    }
    const parsed = JSON.parse(raw) as UserProgressState;
    return {
      completedActivityIds: Array.isArray(parsed.completedActivityIds)
        ? [...parsed.completedActivityIds]
        : [],
      assessmentAttempts: Array.isArray(parsed.assessmentAttempts)
        ? [...parsed.assessmentAttempts]
        : [],
      latestAttempt: parsed.latestAttempt ?? parsed.assessmentAttempts?.[parsed.assessmentAttempts.length - 1]
    };
  } catch (err) {
    console.warn('Failed to parse user progress from storage, resetting to default:', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveUserProgress(state: UserProgressState): void {
  try {
    writeStorage(PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save user progress to storage:', err);
  }
}

export function recordAssessmentAttempt(attempt: AssessmentAttempt): UserProgressState {
  const current = loadUserProgress();
  const updatedAttempts = [...current.assessmentAttempts, attempt];
  const newState: UserProgressState = {
    ...current,
    assessmentAttempts: updatedAttempts,
    latestAttempt: attempt
  };
  saveUserProgress(newState);

  // Award XP for completing diagnostic assessment
  awardXP(`assessment_${attempt.id}`, 200, 'Completed diagnostic competency assessment');
  unlockBadge('badge-diagnostic-ready');

  return newState;
}

export function toggleActivityCompletion(activityId: string): UserProgressState {
  const current = loadUserProgress();
  const exists = current.completedActivityIds.includes(activityId);
  const updatedCompleted = exists
    ? current.completedActivityIds.filter((id) => id !== activityId)
    : [...current.completedActivityIds, activityId];

  const newState: UserProgressState = {
    ...current,
    completedActivityIds: updatedCompleted
  };
  saveUserProgress(newState);

  if (!exists) {
    // Award XP for completing a new activity
    awardXP(`activity_${activityId}`, 50, 'Completed roadmap activity');
    if (updatedCompleted.length >= 3) {
      unlockBadge('badge-roadmap-pioneer');
    }
  }

  return newState;
}

// ==========================================
// Communities & Channels
// ==========================================

export function loadCommunities(): Community[] {
  try {
    const raw = readStorage(COMMUNITIES_STORAGE_KEY);
    if (!raw) {
      writeStorage(COMMUNITIES_STORAGE_KEY, JSON.stringify(INITIAL_COMMUNITIES));
      return INITIAL_COMMUNITIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMUNITIES;
  }
}

export function saveCommunities(communities: Community[]): void {
  writeStorage(COMMUNITIES_STORAGE_KEY, JSON.stringify(communities));
}

export function toggleJoinCommunity(communityId: string): Community[] {
  const communities = loadCommunities();
  const updated = communities.map((c) => {
    if (c.id === communityId) {
      const nextJoined = !c.isJoined;
      return {
        ...c,
        isJoined: nextJoined,
        memberCount: nextJoined ? c.memberCount + 1 : Math.max(1, c.memberCount - 1)
      };
    }
    return c;
  });
  saveCommunities(updated);

  const joined = updated.find((c) => c.id === communityId)?.isJoined;
  if (joined) {
    awardXP(`join_community_${communityId}`, 30, 'Joined a study community');
    unlockBadge('badge-first-step');
  }

  return updated;
}

export function createCommunity(data: {
  name: string;
  category: Community['category'];
  description: string;
  icon: string;
  activeStudyGoal?: string;
}): Community {
  const communities = loadCommunities();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = `comm-${Date.now()}`;
  const newCommunity: Community = {
    id,
    name: data.name,
    slug,
    category: data.category,
    description: data.description,
    icon: data.icon || '📚',
    memberCount: 1,
    isJoined: true,
    isCustom: true,
    activeStudyGoal: data.activeStudyGoal,
    channels: [
      { id: `${id}-gen`, communityId: id, name: 'general-chat', description: 'General community conversations', type: 'text', isDefault: true },
      { id: `${id}-doubts`, communityId: id, name: 'doubts', description: 'Ask questions and help peers', type: 'doubts' },
      { id: `${id}-res`, communityId: id, name: 'resources', description: 'Curated study materials', type: 'resources' },
      { id: `${id}-room`, communityId: id, name: 'study-room', description: 'Silent focus session room', type: 'study-room' }
    ]
  };

  const updated = [newCommunity, ...communities];
  saveCommunities(updated);
  awardXP(`create_community_${id}`, 100, 'Founded a new study circle');
  return newCommunity;
}

// ==========================================
// Chat Messages
// ==========================================

export function loadMessages(): ChatMessage[] {
  try {
    const raw = readStorage(MESSAGES_STORAGE_KEY);
    if (!raw) {
      writeStorage(MESSAGES_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES;
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  writeStorage(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

export function sendChatMessage(data: {
  communityId: string;
  channelId: string;
  content: string;
  authorName?: string;
  authorAvatar?: string;
  replyToId?: string;
  resourceLink?: ChatMessage['resourceLink'];
}): ChatMessage {
  const messages = loadMessages();
  const student = loadStudentProfile();

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeStr = `${displayHours}:${minutes} ${ampm}`;

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    communityId: data.communityId,
    channelId: data.channelId,
    authorName: data.authorName || student.name || 'You',
    authorAvatar: data.authorAvatar || student.avatar || '🎓',
    authorRole: 'Student',
    timestamp: timeStr,
    content: data.content,
    replyToId: data.replyToId,
    resourceLink: data.resourceLink,
    reactions: {}
  };

  const updated = [...messages, newMessage];
  saveMessages(updated);

  // Award XP for peer interaction
  awardXP(`message_${newMessage.id}`, 10, 'Participated in study channel chat');

  return newMessage;
}

export function addMessageReaction(messageId: string, emoji: string): void {
  const messages = loadMessages();
  const updated = messages.map((m) => {
    if (m.id === messageId) {
      const reactions = { ...(m.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...m, reactions };
    }
    return m;
  });
  saveMessages(updated);
}

// ==========================================
// Study Resources
// ==========================================

export function loadResources(): StudyResource[] {
  try {
    const raw = readStorage(RESOURCES_STORAGE_KEY);
    if (!raw) {
      writeStorage(RESOURCES_STORAGE_KEY, JSON.stringify(INITIAL_RESOURCES));
      return INITIAL_RESOURCES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESOURCES;
  }
}

export function saveResources(resources: StudyResource[]): void {
  writeStorage(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
}

export function toggleSaveResource(resourceId: string): StudyResource[] {
  const resources = loadResources();
  const updated = resources.map((r) => {
    if (r.id === resourceId) {
      return { ...r, isSaved: !r.isSaved };
    }
    return r;
  });
  saveResources(updated);
  return updated;
}

export function addStudyResource(data: {
  title: string;
  description: string;
  url: string;
  category: string;
  skillId?: StudyResource['skillId'];
  difficulty?: StudyResource['difficulty'];
}): StudyResource {
  const resources = loadResources();
  const student = loadStudentProfile();

  const newRes: StudyResource = {
    id: `res-${Date.now()}`,
    title: data.title,
    description: data.description,
    url: data.url,
    category: data.category,
    skillId: data.skillId,
    difficulty: data.difficulty || 'beginner',
    sharedBy: student.name || 'You',
    sharedAt: 'Just now',
    likes: 1,
    isSaved: true
  };

  const updated = [newRes, ...resources];
  saveResources(updated);
  awardXP(`share_resource_${newRes.id}`, 40, 'Contributed a study resource');
  return newRes;
}

// ==========================================
// Flashcards
// ==========================================

export function loadFlashcardDecks(): FlashcardDeck[] {
  try {
    const raw = readStorage(FLASHCARDS_STORAGE_KEY);
    if (!raw) {
      writeStorage(FLASHCARDS_STORAGE_KEY, JSON.stringify(INITIAL_FLASHCARDS));
      return INITIAL_FLASHCARDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FLASHCARDS;
  }
}

export function saveFlashcardDecks(decks: FlashcardDeck[]): void {
  writeStorage(FLASHCARDS_STORAGE_KEY, JSON.stringify(decks));
}

export function toggleCardMastery(deckId: string, cardId: string): FlashcardDeck[] {
  const decks = loadFlashcardDecks();
  const updated = decks.map((d) => {
    if (d.id === deckId) {
      return {
        ...d,
        cards: d.cards.map((c) => (c.id === cardId ? { ...c, known: !c.known } : c))
      };
    }
    return d;
  });
  saveFlashcardDecks(updated);
  awardXP(`card_flip_${cardId}`, 5, 'Practiced flashcard');
  unlockBadge('badge-card-flipper');
  return updated;
}

export function createFlashcardDeck(data: {
  title: string;
  description: string;
  subject: string;
  skillId?: FlashcardDeck['skillId'];
  cards: Array<{ front: string; back: string }>;
}): FlashcardDeck {
  const decks = loadFlashcardDecks();
  const newDeck: FlashcardDeck = {
    id: `deck-${Date.now()}`,
    title: data.title,
    description: data.description,
    subject: data.subject,
    skillId: data.skillId,
    createdAt: new Date().toISOString().slice(0, 10),
    cards: data.cards.map((c, i) => ({
      id: `fc-c-${Date.now()}-${i}`,
      front: c.front,
      back: c.back,
      known: false
    }))
  };

  const updated = [newDeck, ...decks];
  saveFlashcardDecks(updated);
  awardXP(`create_deck_${newDeck.id}`, 60, 'Created a flashcard deck');
  return newDeck;
}

// ==========================================
// Custom Quizzes
// ==========================================

export function loadCustomQuizzes(): CustomQuiz[] {
  try {
    const raw = readStorage(QUIZZES_STORAGE_KEY);
    if (!raw) {
      writeStorage(QUIZZES_STORAGE_KEY, JSON.stringify(INITIAL_QUIZZES));
      return INITIAL_QUIZZES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUIZZES;
  }
}

export function saveCustomQuizzes(quizzes: CustomQuiz[]): void {
  writeStorage(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
}

export function recordQuizAttempt(quizId: string, scorePercentage: number): void {
  const quizzes = loadCustomQuizzes();
  const updated = quizzes.map((q) => {
    if (q.id === quizId) {
      const best = Math.max(q.bestScore || 0, scorePercentage);
      return { ...q, bestScore: best };
    }
    return q;
  });
  saveCustomQuizzes(updated);
  awardXP(`quiz_attempt_${quizId}_${Date.now().toString().slice(0, -4)}`, Math.round(scorePercentage * 0.8), 'Completed practice quiz');
}

export function createCustomQuiz(data: {
  title: string;
  description: string;
  subject: string;
  skillId?: CustomQuiz['skillId'];
  questions: CustomQuiz['questions'];
}): CustomQuiz {
  const quizzes = loadCustomQuizzes();
  const newQuiz: CustomQuiz = {
    id: `quiz-${Date.now()}`,
    title: data.title,
    description: data.description,
    subject: data.subject,
    skillId: data.skillId,
    createdAt: new Date().toISOString().slice(0, 10),
    questions: data.questions
  };

  const updated = [newQuiz, ...quizzes];
  saveCustomQuizzes(updated);
  awardXP(`create_quiz_${newQuiz.id}`, 80, 'Created custom study quiz');
  return newQuiz;
}

// ==========================================
// PDF Notes Workspace
// ==========================================

export function loadPDFNotes(): PDFDocumentNote[] {
  try {
    const raw = readStorage(PDF_NOTES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePDFNote(note: PDFDocumentNote): void {
  const notes = loadPDFNotes();
  const existingIdx = notes.findIndex((n) => n.id === note.id);
  const updated = existingIdx >= 0
    ? notes.map((n) => (n.id === note.id ? note : n))
    : [note, ...notes];

  writeStorage(PDF_NOTES_STORAGE_KEY, JSON.stringify(updated));
  awardXP(`pdf_note_${note.id}`, 25, 'Summarized study document');
}

// ==========================================
// Teachers & Guidance
// ==========================================

export function loadTeachers(): TeacherProfile[] {
  try {
    const raw = readStorage(TEACHERS_STORAGE_KEY);
    if (!raw) {
      writeStorage(TEACHERS_STORAGE_KEY, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveTeachers(teachers: TeacherProfile[]): void {
  writeStorage(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
}

export function loadGuidanceRequests(): GuidanceRequest[] {
  try {
    const raw = readStorage(GUIDANCE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function submitGuidanceRequest(data: {
  teacherId: string;
  teacherName: string;
  studentSkillGapId?: GuidanceRequest['studentSkillGapId'];
  topic: string;
  message: string;
  preferredTime: string;
}): GuidanceRequest {
  const requests = loadGuidanceRequests();
  const student = loadStudentProfile();

  const newReq: GuidanceRequest = {
    id: `req-${Date.now()}`,
    teacherId: data.teacherId,
    teacherName: data.teacherName,
    studentName: student.name || 'Alex Rivera',
    studentSkillGapId: data.studentSkillGapId,
    topic: data.topic,
    message: data.message,
    preferredTime: data.preferredTime,
    createdAt: new Date().toISOString(),
    status: 'submitted'
  };

  const updated = [newReq, ...requests];
  writeStorage(GUIDANCE_STORAGE_KEY, JSON.stringify(updated));
  awardXP(`guidance_${newReq.id}`, 50, 'Requested mentor guidance');
  return newReq;
}

export function loadTeacherApplications(): TeacherVerificationApplication[] {
  try {
    const raw = readStorage(TEACHER_APPS_STORAGE_KEY);
    if (!raw) {
      const seedApps: TeacherVerificationApplication[] = [
        {
          id: 'app-priya-1',
          teacherId: 'teacher-priya',
          teacherName: 'Priya Sundaram',
          subject: 'HTML & Fullstack Web',
          qualificationDoc: 'B.Tech IT, 7 Yrs Tech Lead Certification',
          submittedAt: '2026-10-25',
          status: 'pending'
        }
      ];
      writeStorage(TEACHER_APPS_STORAGE_KEY, JSON.stringify(seedApps));
      return seedApps;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function reviewTeacherApplication(appId: string, status: 'approved' | 'rejected', reviewerNotes?: string): void {
  const apps = loadTeacherApplications();
  const updated = apps.map((a) => {
    if (a.id === appId) {
      return { ...a, status, reviewerNotes };
    }
    return a;
  });
  writeStorage(TEACHER_APPS_STORAGE_KEY, JSON.stringify(updated));

  // If approved, update teacher profile status
  const matchedApp = apps.find((a) => a.id === appId);
  if (matchedApp && status === 'approved') {
    const teachers = loadTeachers();
    const updatedTeachers = teachers.map((t) => {
      if (t.id === matchedApp.teacherId) {
        return {
          ...t,
          isVerifiedDemo: true,
          verificationStatus: 'verified_demo' as const
        };
      }
      return t;
    });
    saveTeachers(updatedTeachers);
  }
}

// ==========================================
// Gamification (XP, Badges, Streaks)
// ==========================================

export function loadGamificationState(): UserGamificationState {
  try {
    const raw = readStorage(GAMIFICATION_STORAGE_KEY);
    if (!raw) {
      writeStorage(GAMIFICATION_STORAGE_KEY, JSON.stringify(DEFAULT_GAMIFICATION));
      return DEFAULT_GAMIFICATION;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GAMIFICATION;
  }
}

export function saveGamificationState(state: UserGamificationState): void {
  writeStorage(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
}

/**
 * Deduplicated XP awarding. Prevents repeated button clicks from inflating XP.
 */
export function awardXP(actionKey: string, xpAmount: number, description?: string): { awarded: boolean; newTotalXP: number; newLevel: number } {
  const state = loadGamificationState();

  if (state.completedActionKeys.includes(actionKey)) {
    return { awarded: false, newTotalXP: state.xp, newLevel: state.level };
  }

  const nextXP = state.xp + xpAmount;
  // Level threshold: each 250 XP is a level
  const nextLevel = Math.max(1, Math.floor(nextXP / 250) + 1);

  const updated: UserGamificationState = {
    ...state,
    xp: nextXP,
    level: nextLevel,
    completedActionKeys: [...state.completedActionKeys, actionKey]
  };

  saveGamificationState(updated);
  if (description) {
    console.info(`[XP Awarded] +${xpAmount} XP (${description}) -> Total: ${nextXP} XP (Level ${nextLevel})`);
  }
  return { awarded: true, newTotalXP: nextXP, newLevel: nextLevel };
}

export function loadBadges(): Badge[] {
  const gamification = loadGamificationState();
  return INITIAL_BADGES.map((b) => ({
    ...b,
    unlockedAt: gamification.unlockedBadgeIds.includes(b.id)
      ? b.unlockedAt || new Date().toISOString().slice(0, 10)
      : undefined
  }));
}

export function unlockBadge(badgeId: string): void {
  const state = loadGamificationState();
  if (!state.unlockedBadgeIds.includes(badgeId)) {
    const updated: UserGamificationState = {
      ...state,
      unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId]
    };
    saveGamificationState(updated);
  }
}

export function loadLeaderboard(): LeaderboardEntry[] {
  const gamification = loadGamificationState();
  const student = loadStudentProfile();

  return INITIAL_LEADERBOARD.map((entry) => {
    if (entry.isCurrentUser) {
      return {
        ...entry,
        name: student.name || 'You (Student)',
        xp: gamification.xp,
        level: gamification.level,
        streakDays: gamification.streakDays,
        badgeCount: gamification.unlockedBadgeIds.length
      };
    }
    return entry;
  }).sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));
}

// ==========================================
// Student Profile & Moderation
// ==========================================

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = readStorage(PROFILE_STORAGE_KEY);
    if (!raw) {
      writeStorage(PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_STUDENT_PROFILE));
      return INITIAL_STUDENT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  writeStorage(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadReportedItems(): ReportedItem[] {
  try {
    const raw = readStorage(REPORTS_STORAGE_KEY);
    if (!raw) {
      const seedReports: ReportedItem[] = [
        {
          id: 'rep-1',
          type: 'message',
          targetId: 'msg-promo-sample',
          targetContent: 'Off-topic spam commercial link in general study room',
          reason: 'Promotional spam',
          reportedBy: 'Sara Lindqvist',
          reportedAt: '2026-10-26',
          status: 'pending'
        }
      ];
      writeStorage(REPORTS_STORAGE_KEY, JSON.stringify(seedReports));
      return seedReports;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function reportItem(data: {
  type: ReportedItem['type'];
  targetId: string;
  targetContent: string;
  reason: string;
}): ReportedItem {
  const reports = loadReportedItems();
  const student = loadStudentProfile();

  const newReport: ReportedItem = {
    id: `rep-${Date.now()}`,
    type: data.type,
    targetId: data.targetId,
    targetContent: data.targetContent,
    reason: data.reason,
    reportedBy: student.name || 'You',
    reportedAt: new Date().toISOString().slice(0, 10),
    status: 'pending'
  };

  const updated = [newReport, ...reports];
  writeStorage(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  return newReport;
}

export function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): void {
  const reports = loadReportedItems();
  const updated = reports.map((r) => (r.id === reportId ? { ...r, status } : r));
  writeStorage(REPORTS_STORAGE_KEY, JSON.stringify(updated));
}

// ==========================================
// Reset Demo Progress
// ==========================================

export function resetUserProgress(): UserProgressState {
  removeStorage(PROGRESS_STORAGE_KEY);
  removeStorage(COMMUNITIES_STORAGE_KEY);
  removeStorage(MESSAGES_STORAGE_KEY);
  removeStorage(RESOURCES_STORAGE_KEY);
  removeStorage(FLASHCARDS_STORAGE_KEY);
  removeStorage(QUIZZES_STORAGE_KEY);
  removeStorage(PDF_NOTES_STORAGE_KEY);
  removeStorage(TEACHERS_STORAGE_KEY);
  removeStorage(GUIDANCE_STORAGE_KEY);
  removeStorage(TEACHER_APPS_STORAGE_KEY);
  removeStorage(GAMIFICATION_STORAGE_KEY);
  removeStorage(PROFILE_STORAGE_KEY);
  removeStorage(REPORTS_STORAGE_KEY);

  return { ...DEFAULT_PROGRESS };
}
