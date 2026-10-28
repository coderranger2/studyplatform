import { describe, it, expect, beforeEach } from 'vitest';
import {
  awardXP,
  cancelBuddyRequest,
  createChannel,
  createCommunity,
  createCustomQuiz,
  createFlashcardDeck,
  loadBuddyRequests,
  loadCommunities,
  loadGamificationState,
  loadMessages,
  loadPeerProfiles,
  loadSelectedGoal,
  loadUserReactions,
  resetUserProgress,
  saveSelectedGoal,
  sendBuddyRequest,
  sendChatMessage,
  toggleCardMastery,
  toggleJoinCommunity,
  toggleMessageReaction,
  updateCommunityGoal
} from '../utilities/storage.ts';
import { SKILLS } from '../data/skills.ts';
import { getGoalById } from '../data/goals.ts';
import { analyzeSkillGaps } from './skillGapAnalyzer.ts';
import { scoreAssessment } from './assessmentScorer.ts';
import { SAMPLE_QUESTIONS } from '../data/questions.ts';

describe('SkillForge Social, Toolkit & Gamification Features', () => {
  beforeEach(() => {
    resetUserProgress();
  });

  describe('Communities & Chat Persistence', () => {
    it('loads initial default study communities', () => {
      const comms = loadCommunities();
      expect(comms.length).toBeGreaterThanOrEqual(5);
      const webDev = comms.find((c) => c.slug === 'web-dev');
      expect(webDev).toBeDefined();
      expect(webDev?.channels.length).toBeGreaterThanOrEqual(4);
    });

    it('toggles community join state and updates membership', () => {
      const comms = loadCommunities();
      const examGroup = comms.find((c) => c.slug === 'exam-prep')!;
      const initialJoined = examGroup.isJoined;
      const initialCount = examGroup.memberCount;

      const updated = toggleJoinCommunity(examGroup.id);
      const target = updated.find((c) => c.id === examGroup.id)!;
      expect(target.isJoined).toBe(!initialJoined);
      expect(target.memberCount).toBe(initialCount + 1);
    });

    it('creates a custom study circle with default channels', () => {
      const created = createCommunity({
        name: 'React 19 Scribes',
        category: 'Web Development',
        description: 'Deep dive into concurrent mode and compiler hooks.',
        icon: '⚛️',
        activeStudyGoal: 'Build 3 micro-apps using React 19'
      });

      expect(created.id).toBeDefined();
      expect(created.isCustom).toBe(true);
      expect(created.channels.length).toBeGreaterThanOrEqual(3);

      const all = loadCommunities();
      expect(all.some((c) => c.id === created.id)).toBe(true);
    });

    it('sends and persists chat messages to channels', () => {
      const newMsg = sendChatMessage({
        communityId: 'comm-web-dev',
        channelId: 'wd-doubts',
        content: 'How do CSS Grid auto-fit and minmax work together?'
      });

      expect(newMsg.id).toBeDefined();
      expect(newMsg.content).toContain('CSS Grid');

      const all = loadMessages();
      expect(all.some((m) => m.id === newMsg.id)).toBe(true);
    });

    it('creates and persists a new channel in a community', () => {
      const newChan = createChannel('comm-web-dev', {
        name: 'nextjs-mastery',
        type: 'text',
        description: 'Server actions and app router discussions'
      });

      expect(newChan).toBeDefined();
      expect(newChan?.id).toContain('nextjs-mastery');
      expect(newChan?.name).toBe('nextjs-mastery');

      const comms = loadCommunities();
      const webDev = comms.find((c) => c.id === 'comm-web-dev');
      expect(webDev?.channels.some((ch) => ch.id === newChan?.id)).toBe(true);
    });

    it('toggles message reactions with live increment and decrement', () => {
      const msg = sendChatMessage({
        communityId: 'comm-web-dev',
        channelId: 'wd-general',
        content: 'Check out the new React docs!'
      });

      // First toggle: react
      const first = toggleMessageReaction(msg.id, '🔥');
      expect(first.reacted).toBe(true);
      expect(first.count).toBe(1);

      const reactionsMap = loadUserReactions();
      expect(reactionsMap[msg.id]).toContain('🔥');

      // Second toggle: un-react
      const second = toggleMessageReaction(msg.id, '🔥');
      expect(second.reacted).toBe(false);
      expect(second.count).toBe(0);

      const reactionsMapAfter = loadUserReactions();
      expect(reactionsMapAfter[msg.id]).not.toContain('🔥');
    });

    it('updates community active focus goal', () => {
      const updated = updateCommunityGoal('comm-web-dev', 'Complete 5 Responsive Flexbox Layouts');
      expect(updated.length).toBeGreaterThanOrEqual(1);

      const comms = loadCommunities();
      const webDev = comms.find((c) => c.id === 'comm-web-dev');
      expect(webDev?.activeStudyGoal).toBe('Complete 5 Responsive Flexbox Layouts');
    });
  });

  describe('Toolkit: Flashcards & Quizzes', () => {
    it('creates and tracks card mastery in flashcard decks', () => {
      const deck = createFlashcardDeck({
        title: 'CSS Specificity Drills',
        description: 'Calculate selector weights',
        subject: 'CSS',
        cards: [
          { front: '#id vs .class', back: 'ID wins (1,0,0) vs (0,1,0)' },
          { front: ':is() specificity', back: 'Takes highest specificity of its arguments' }
        ]
      });

      expect(deck.id).toBeDefined();
      expect(deck.cards.length).toBe(2);

      const updatedDecks = toggleCardMastery(deck.id, deck.cards[0].id);
      const myDeck = updatedDecks.find((d) => d.id === deck.id);
      const firstCard = myDeck?.cards.find((c) => c.id === deck.cards[0].id);
      expect(firstCard?.known).toBe(true);
    });

    it('creates custom quizzes and validates questions', () => {
      const quiz = createCustomQuiz({
        title: 'DOM QuerySelector Speed Run',
        description: 'Test DOM traversal methods',
        subject: 'JavaScript',
        questions: [
          {
            id: 'q-dom-speed-1',
            text: 'Which returns a static NodeList?',
            options: ['querySelectorAll', 'getElementsByClassName', 'getElementsByTagName', 'children'],
            correctOptionIndex: 0,
            explanation: 'querySelectorAll returns a non-live NodeList snapshot.'
          }
        ]
      });

      expect(quiz.id).toBeDefined();
      expect(quiz.questions.length).toBe(1);
    });
  });

  describe('Gamification & XP Deduplication', () => {
    it('awards XP and increases levels accordingly', () => {
      const stateBefore = loadGamificationState();
      const res = awardXP('test_unique_milestone', 300, 'Test milestone');

      expect(res.awarded).toBe(true);
      expect(res.newTotalXP).toBe(stateBefore.xp + 300);
      expect(res.newLevel).toBeGreaterThanOrEqual(stateBefore.level);
    });

    it('strictly prevents duplicate XP awards on repeated actions', () => {
      const actionKey = 'repeat_action_test_key';
      const first = awardXP(actionKey, 100, 'First click');
      expect(first.awarded).toBe(true);

      const second = awardXP(actionKey, 100, 'Second repeated click');
      expect(second.awarded).toBe(false);
      expect(second.newTotalXP).toBe(first.newTotalXP);
    });
  });

  describe('Study Buddies & Peer Learning (Option A)', () => {
    it('loads demo peer profiles with required fields', () => {
      const peers = loadPeerProfiles();
      expect(peers.length).toBeGreaterThanOrEqual(5);

      for (const peer of peers) {
        expect(peer.id).toBeDefined();
        expect(peer.name).toBeDefined();
        expect(peer.handle).toBeDefined();
        expect(peer.primarySubject).toBeDefined();
        expect(peer.learningGoal).toBeDefined();
        expect(peer.interests.length).toBeGreaterThan(0);
        expect(peer.matchedCommunities.length).toBeGreaterThan(0);
        expect(peer.studyMode).toBeDefined();
      }
    });

    it('sends and cancels study buddy invitations (local demo interaction)', () => {
      const peers = loadPeerProfiles();
      const peer = peers[0];

      const req = sendBuddyRequest({
        peerId: peer.id,
        peerName: peer.name,
        peerAvatar: peer.avatar,
        topic: 'JavaScript DOM Events Study Group',
        studyMode: 'Pair Coding',
        note: 'Let us study together!'
      });

      expect(req.id).toBeDefined();
      expect(req.peerId).toBe(peer.id);
      expect(req.status).toBe('sent');
      expect(req.isDemo).toBe(true);

      const requests = loadBuddyRequests();
      expect(requests.some((r) => r.id === req.id)).toBe(true);

      // Cancel the request
      cancelBuddyRequest(req.id);
      const afterCancel = loadBuddyRequests();
      expect(afterCancel.some((r) => r.id === req.id)).toBe(false);
    });
  });

  describe('Competency Development & Collaborative Learning Integration (Option B)', () => {
    it('persists selected learning goals and matches relevant target skills', () => {
      const defaultGoal = loadSelectedGoal();
      expect(defaultGoal).toBe('goal-web-dev');

      saveSelectedGoal('goal-javascript');
      expect(loadSelectedGoal()).toBe('goal-javascript');

      const goalDef = getGoalById('goal-javascript');
      expect(goalDef.targetSkillIds).toContain('js-fundamentals');
      expect(goalDef.targetSkillIds).toContain('dom-manipulation');
      expect(goalDef.recommendedChannelIds.length).toBeGreaterThan(0);
    });

    it('matches peer study buddies based on student detected skill gaps', () => {
      const peers = loadPeerProfiles();

      // Student has gaps in responsive-design and dom-manipulation
      const attempt = scoreAssessment(SAMPLE_QUESTIONS, {
        'q-html-1': 'b',
        'q-html-2': 'b',
        'q-css-1': 'b',
        'q-css-2': 'c'
        // css layout and js dom left unanswered (gaps)
      });

      const gaps = analyzeSkillGaps(SKILLS, attempt);
      const gapSkillIds = gaps.filter((g) => g.hasGap).map((g) => g.skillId);

      // Verify that peers with complementary strengths match those exact gaps
      const matchedPeers = peers.filter((p) =>
        p.complementarySkills.some((sId) => gapSkillIds.includes(sId))
      );

      expect(matchedPeers.length).toBeGreaterThan(0);
      // For instance, Sana Khan excels in CSS and Rohan Patel excels in JavaScript
      const sana = matchedPeers.find((p) => p.name === 'Sana Khan');
      const rohan = matchedPeers.find((p) => p.name === 'Rohan Patel');
      expect(sana || rohan).toBeDefined();
    });
  });
});
