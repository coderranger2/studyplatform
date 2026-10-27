import { describe, it, expect, beforeEach } from 'vitest';
import {
  awardXP,
  createCommunity,
  createCustomQuiz,
  createFlashcardDeck,
  loadCommunities,
  loadGamificationState,
  loadMessages,
  loadTeachers,
  resetUserProgress,
  sendChatMessage,
  toggleCardMastery,
  toggleJoinCommunity
} from '../utilities/storage.ts';
import { SKILLS } from '../data/skills.ts';
import { analyzeSkillGaps } from './skillGapAnalyzer.ts';

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

    it('toggles community membership and updates memberCount', () => {
      const comms = loadCommunities();
      const first = comms[0];
      const initialJoined = first.isJoined;
      const initialCount = first.memberCount;

      const updated = toggleJoinCommunity(first.id);
      const updatedFirst = updated.find((c) => c.id === first.id)!;
      expect(updatedFirst.isJoined).toBe(!initialJoined);
      expect(updatedFirst.memberCount).toBe(
        initialJoined ? initialCount - 1 : initialCount + 1
      );
    });

    it('creates a custom study circle with default channels', () => {
      const created = createCommunity({
        name: 'Algorithms Masters',
        category: 'Programming',
        description: 'Collaborative DSA study group',
        icon: '💻',
        activeStudyGoal: 'Solve 20 graph problems'
      });

      expect(created.id).toContain('comm-');
      expect(created.isJoined).toBe(true);
      expect(created.channels.length).toBeGreaterThanOrEqual(3);

      const all = loadCommunities();
      expect(all.some((c) => c.id === created.id)).toBe(true);
    });

    it('sends and persists chat messages to channels', () => {
      const comms = loadCommunities();
      const firstComm = comms[0];
      const firstChan = firstComm.channels[0];

      const newMsg = sendChatMessage({
        communityId: firstComm.id,
        channelId: firstChan.id,
        content: 'Hello fellow studiers! Let us solve CSS Grid today.'
      });

      expect(newMsg.id).toContain('msg-');
      expect(newMsg.content).toBe('Hello fellow studiers! Let us solve CSS Grid today.');

      const messages = loadMessages();
      expect(messages.some((m) => m.id === newMsg.id)).toBe(true);
    });
  });

  describe('Toolkit: Flashcards & Quizzes', () => {
    it('creates and tracks card mastery in flashcard decks', () => {
      const deck = createFlashcardDeck({
        title: 'CSS Specificity Cards',
        description: 'Test your understanding of ID vs Class vs Inline',
        subject: 'CSS',
        skillId: 'css-fundamentals',
        cards: [
          { front: 'What is the specificity of an ID selector?', back: '1,0,0' },
          { front: 'What is the specificity of a class selector?', back: '0,1,0' }
        ]
      });

      expect(deck.cards.length).toBe(2);
      expect(deck.cards[0].known).toBe(false);

      const updated = toggleCardMastery(deck.id, deck.cards[0].id);
      const updatedDeck = updated.find((d) => d.id === deck.id)!;
      expect(updatedDeck.cards[0].known).toBe(true);
    });

    it('creates custom quizzes and validates questions', () => {
      const quiz = createCustomQuiz({
        title: 'DOM Selectors Quiz',
        description: 'querySelector vs getElementById',
        subject: 'JavaScript',
        skillId: 'dom-manipulation',
        questions: [
          {
            id: 'q1',
            text: 'Which method returns the first matching element?',
            options: ['querySelectorAll', 'querySelector', 'getElementsByClassName', 'filter'],
            correctOptionIndex: 1,
            explanation: 'querySelector returns the first element matching the CSS selector.'
          }
        ]
      });

      expect(quiz.id).toContain('quiz-');
      expect(quiz.questions[0].correctOptionIndex).toBe(1);
    });
  });

  describe('Gamification & XP Deduplication', () => {
    it('awards XP and increases levels accordingly', () => {
      const initial = loadGamificationState();
      const result = awardXP('test_unique_milestone_1', 300, 'Test milestone');

      expect(result.awarded).toBe(true);
      expect(result.newTotalXP).toBe(initial.xp + 300);

      // Verify level progression (every 250 XP = level)
      expect(result.newLevel).toBe(Math.floor((initial.xp + 300) / 250) + 1);
    });

    it('strictly prevents duplicate XP awards on repeated actions', () => {
      const actionKey = 'clicked_button_milestone_test';
      const first = awardXP(actionKey, 100, 'First click');
      expect(first.awarded).toBe(true);

      const second = awardXP(actionKey, 100, 'Second repeated click');
      expect(second.awarded).toBe(false);
      expect(second.newTotalXP).toBe(first.newTotalXP);
    });
  });

  describe('Competency-to-Teacher Matching Logic', () => {
    it('matches teachers based on student detected skill gaps', () => {
      const teachers = loadTeachers();
      // No assessment attempt -> all skills have gaps
      const gaps = analyzeSkillGaps(SKILLS, null);
      const gapSkillIds = gaps.map((g) => g.skillId);

      // Verify each teacher matching skill IDs intersects with gaps
      const scoredTeachers = teachers.map((teacher) => {
        let matchScore = 0;
        teacher.matchingSkillIds.forEach((sId) => {
          if (gapSkillIds.includes(sId)) matchScore += 2;
        });
        return { teacher, matchScore };
      });

      expect(scoredTeachers.every((st) => st.matchScore > 0)).toBe(true);
      expect(teachers.some((t) => t.isVerifiedDemo)).toBe(true);
    });
  });
});
