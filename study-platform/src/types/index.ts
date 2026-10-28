export type SkillId =
  | 'html-structure'
  | 'html-forms'
  | 'css-fundamentals'
  | 'responsive-design'
  | 'js-fundamentals'
  | 'dom-manipulation';

export type SkillCategory = 'HTML' | 'CSS' | 'JavaScript';

export interface Skill {
  id: SkillId;
  name: string;
  category: SkillCategory;
  description: string;
  prerequisites: SkillId[];
  learningObjectives: string[];
  estimatedHours: number;
}

export type MasteryLevel =
  | 'unassessed'
  | 'novice'
  | 'developing'
  | 'proficient'
  | 'mastered';

export interface SkillGap {
  skillId: SkillId;
  skillName: string;
  category: SkillCategory;
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  masteryLevel: MasteryLevel;
  hasGap: boolean;
  unmetPrerequisites: SkillId[];
  recommendation: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export type QuestionDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Question {
  id: string;
  skillId: SkillId;
  difficulty: QuestionDifficulty;
  text: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
}

export type UserAnswers = Record<string, string>;

export interface SkillScoreSummary {
  skillId: SkillId;
  total: number;
  correct: number;
  percentage: number;
}

export interface AssessmentAttempt {
  id: string;
  timestamp: string;
  answers: UserAnswers;
  totalQuestions: number;
  correctQuestions: number;
  overallScorePercentage: number;
  skillScores: Record<SkillId, SkillScoreSummary>;
}

export type ActivityType = 'learn' | 'practice' | 'project' | 'review';

export type ActivityStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface RoadmapActivity {
  id: string;
  skillId: SkillId;
  title: string;
  description: string;
  type: ActivityType;
  estimatedMinutes: number;
  status: ActivityStatus;
  prerequisiteSkillIds: SkillId[];
  isMilestone?: boolean;
}

export interface LearningRoadmap {
  generatedAt: string;
  targetSkillsWithGaps: SkillId[];
  masteredSkills: SkillId[];
  activities: RoadmapActivity[];
  totalActivities: number;
  completedActivitiesCount: number;
  progressPercentage: number;
}

export interface UserProgressState {
  completedActivityIds: string[];
  assessmentAttempts: AssessmentAttempt[];
  latestAttempt?: AssessmentAttempt;
}

// ==========================================
// Community & Discord-Style Social Types
// ==========================================

export type CommunityCategory =
  | 'Web Development'
  | 'Programming'
  | 'College Subjects'
  | 'Competitive Exams'
  | 'General Study';

export type ChannelType = 'text' | 'doubts' | 'resources' | 'project-help' | 'study-room';

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  description: string;
  type: ChannelType;
  isDefault?: boolean;
}

export interface ChatMessage {
  id: string;
  communityId: string;
  channelId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: 'Student' | 'Teacher' | 'Mentor' | 'Admin';
  timestamp: string;
  content: string;
  replyToId?: string;
  replyCount?: number;
  resourceLink?: {
    title: string;
    url: string;
    skillId?: SkillId;
  };
  reactions?: Record<string, number>;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  category: CommunityCategory;
  description: string;
  icon: string;
  memberCount: number;
  isJoined: boolean;
  channels: Channel[];
  activeStudyGoal?: string;
  isCustom?: boolean;
}

// ==========================================
// Study Toolkit Types
// ==========================================

export interface StudyResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  skillId?: SkillId;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  sharedBy: string;
  sharedAt: string;
  likes: number;
  isSaved?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  subject: string;
  skillId?: SkillId;
  cards: Flashcard[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  skillId?: SkillId;
  questions: QuizQuestion[];
  createdAt: string;
  bestScore?: number;
}

export interface PDFDocumentNote {
  id: string;
  fileName: string;
  fileSize: number;
  extractedSnippet: string;
  manualNotes: string;
  manualSummary: string;
  uploadedAt: string;
}

// ==========================================
// Teacher Profiles & Verification
// ==========================================

export interface TeacherProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  subjectExpertise: SkillCategory[];
  topics: string[];
  matchingSkillIds: SkillId[];
  qualifications: string;
  bio: string;
  hourlyRate: string;
  isVerifiedDemo: boolean;
  verificationStatus: 'verified_demo' | 'pending_review' | 'rejected';
  rating: number;
  reviewsCount: number;
  studentCount: number;
  availability: string;
}

export interface GuidanceRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  studentName: string;
  studentSkillGapId?: SkillId;
  topic: string;
  message: string;
  preferredTime: string;
  createdAt: string;
  status: 'submitted' | 'scheduled' | 'completed';
}

export interface TeacherVerificationApplication {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  qualificationDoc: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerNotes?: string;
}

// ==========================================
// Gamification: XP, Badges, Streaks
// ==========================================

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'assessment' | 'streak' | 'community' | 'tools' | 'mastery';
  unlockedAt?: string;
}

export interface UserGamificationState {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  unlockedBadgeIds: string[];
  completedActionKeys: string[];
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streakDays: number;
  isCurrentUser?: boolean;
  badgeCount: number;
  primarySubject: string;
}

// ==========================================
// Student Profile & Moderation
// ==========================================

export interface StudentProfile {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  primaryGoal: string;
  interests: string[];
  targetExamOrRole: string;
}

export interface ReportedItem {
  id: string;
  type: 'message' | 'resource' | 'community';
  targetId: string;
  targetContent: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

// ==========================================
// Peer Learning & Study Buddies
// ==========================================

export interface StudyBuddyProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  level: number;
  xp: number;
  streakDays: number;
  primarySubject: SkillCategory | 'Web Development' | 'Programming' | 'General';
  learningGoal: string;
  targetGoalCategory: string;
  subjects: string[];
  interests: string[];
  bio: string;
  availability: string;
  matchedCommunities: { id: string; name: string; icon: string; channelId?: string }[];
  complementarySkills: SkillId[];
  weakSkills: SkillId[];
  status: 'online' | 'studying' | 'offline';
  studyMode: 'Pair Coding' | 'Flashcards & Quizzes' | 'Pomodoro Co-study' | 'Doubt Clearing';
}

export interface StudyBuddyRequest {
  id: string;
  peerId: string;
  peerName: string;
  peerAvatar: string;
  senderName: string;
  sentAt: string;
  topic: string;
  studyMode: string;
  note: string;
  status: 'sent' | 'accepted' | 'declined';
  isDemo: boolean;
}

export interface LearningGoalDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  targetSkillIds: SkillId[];
  recommendedCommunityIds: string[];
  recommendedChannelIds: {
    communityId: string;
    channelId: string;
    label: string;
    reason: string;
  }[];
}

