import { describe, it, expect, beforeEach } from 'vitest';
import { SKILLS } from '../data/skills.ts';
import { SAMPLE_QUESTIONS } from '../data/questions.ts';
import { scoreAssessment } from './assessmentScorer.ts';
import { analyzeSkillGaps, getMasteryLevel } from './skillGapAnalyzer.ts';
import {
  generateRoadmap,
  sortSkillsTopologically
} from './roadmapGenerator.ts';
import {
  loadUserProgress,
  recordAssessmentAttempt,
  resetUserProgress,
  toggleActivityCompletion
} from '../utilities/storage.ts';
import type { UserAnswers } from '../types/index.ts';

describe('Assessment Scorer Engine', () => {
  it('throws when questions list is empty', () => {
    expect(() => scoreAssessment([], {})).toThrow();
  });

  it('scores 100% when all answers match correctOptionId', () => {
    const answers: UserAnswers = {};
    for (const q of SAMPLE_QUESTIONS) {
      answers[q.id] = q.correctOptionId;
    }

    const attempt = scoreAssessment(SAMPLE_QUESTIONS, answers, {
      attemptId: 'test_attempt_100',
      timestamp: '2026-01-01T00:00:00.000Z'
    });

    expect(attempt.overallScorePercentage).toBe(100);
    expect(attempt.correctQuestions).toBe(SAMPLE_QUESTIONS.length);
    expect(attempt.totalQuestions).toBe(SAMPLE_QUESTIONS.length);

    // Each skill should be 100%
    for (const skill of SKILLS) {
      expect(attempt.skillScores[skill.id].percentage).toBe(100);
    }
  });

  it('scores 0% when all answers are wrong or omitted', () => {
    const attempt = scoreAssessment(SAMPLE_QUESTIONS, {}, {
      attemptId: 'test_attempt_0',
      timestamp: '2026-01-01T00:00:00.000Z'
    });

    expect(attempt.overallScorePercentage).toBe(0);
    expect(attempt.correctQuestions).toBe(0);
    for (const skill of SKILLS) {
      expect(attempt.skillScores[skill.id].percentage).toBe(0);
      expect(attempt.skillScores[skill.id].correct).toBe(0);
    }
  });

  it('scores individual skills with partial accuracy deterministically', () => {
    // Only answer HTML structure questions correctly
    const htmlQuestions = SAMPLE_QUESTIONS.filter((q) => q.skillId === 'html-structure');
    const answers: UserAnswers = {};
    for (const q of htmlQuestions) {
      answers[q.id] = q.correctOptionId;
    }

    const attempt1 = scoreAssessment(SAMPLE_QUESTIONS, answers, {
      attemptId: 'det-1',
      timestamp: '2026-01-01T00:00:00.000Z'
    });
    const attempt2 = scoreAssessment(SAMPLE_QUESTIONS, answers, {
      attemptId: 'det-1',
      timestamp: '2026-01-01T00:00:00.000Z'
    });

    expect(attempt1).toEqual(attempt2);
    expect(attempt1.skillScores['html-structure'].percentage).toBe(100);
    expect(attempt1.skillScores['css-fundamentals'].percentage).toBe(0);
  });
});

describe('Skill Gap Analyzer Engine', () => {
  it('correctly maps scores to mastery levels', () => {
    expect(getMasteryLevel(0, 0)).toBe('unassessed');
    expect(getMasteryLevel(30, 2)).toBe('novice');
    expect(getMasteryLevel(50, 2)).toBe('developing');
    expect(getMasteryLevel(75, 2)).toBe('proficient');
    expect(getMasteryLevel(100, 2)).toBe('mastered');
  });

  it('marks all skills as having gaps when no attempt exists', () => {
    const gaps = analyzeSkillGaps(SKILLS, null);
    expect(gaps.length).toBe(SKILLS.length);
    for (const gap of gaps) {
      expect(gap.hasGap).toBe(true);
      expect(gap.masteryLevel).toBe('unassessed');
    }
  });

  it('flags unmet prerequisites when parent skills have gaps', () => {
    // Responsive design requires css-fundamentals
    // If css-fundamentals has score 0, responsive-design should flag unmet prerequisite
    const attempt = scoreAssessment(
      SAMPLE_QUESTIONS,
      {
        'q-html-1': 'b',
        'q-html-2': 'b',
        'q-resp-1': 'b',
        'q-resp-2': 'b'
      },
      { attemptId: 'pre-test' }
    );

    const gaps = analyzeSkillGaps(SKILLS, attempt);
    const respGap = gaps.find((g) => g.skillId === 'responsive-design');
    const cssGap = gaps.find((g) => g.skillId === 'css-fundamentals');

    expect(cssGap?.hasGap).toBe(true);
    expect(respGap?.unmetPrerequisites).toContain('css-fundamentals');
    expect(respGap?.recommendation).toContain('CSS Fundamentals');
  });
});

describe('Topological Sorting & Prerequisite Aware Roadmap Engine', () => {
  it('sorts skills such that prerequisites always appear before dependents', () => {
    const sorted = sortSkillsTopologically(SKILLS);
    const indices = new Map<string, number>(sorted.map((s, idx) => [s.id, idx]));

    // Check each skill that its prerequisites appear strictly before it
    for (const skill of sorted) {
      const skillIdx = indices.get(skill.id)!;
      for (const preId of skill.prerequisites) {
        const preIdx = indices.get(preId)!;
        expect(preIdx).toBeLessThan(skillIdx);
      }
    }
  });

  it('detects cycles in prerequisite graph', () => {
    const cyclicSkills: any[] = [
      { id: 'a', prerequisites: ['b'], name: 'A' },
      { id: 'b', prerequisites: ['a'], name: 'B' }
    ];
    expect(() => sortSkillsTopologically(cyclicSkills)).toThrow(/Cyclic prerequisite dependency/);
  });

  it('locks activities for skills whose prerequisites have gaps', () => {
    // No attempt = all skills have gaps
    const gaps = analyzeSkillGaps(SKILLS, null);
    const roadmap = generateRoadmap(SKILLS, gaps, []);

    // Activities for html-structure (no prerequisites) should be available (first activity)
    const htmlFirst = roadmap.activities.find((a) => a.skillId === 'html-structure');
    expect(htmlFirst?.status).toBe('available');

    // Activities for css-fundamentals (requires html-structure) should be locked initially
    const cssFirst = roadmap.activities.find((a) => a.skillId === 'css-fundamentals');
    expect(cssFirst?.status).toBe('locked');
  });

  it('unlocks dependent activities once prerequisites are satisfied or mastered', () => {
    // HTML is mastered (100%), CSS has gap
    const attempt = scoreAssessment(
      SAMPLE_QUESTIONS,
      {
        'q-html-1': 'b',
        'q-html-2': 'b'
      },
      { attemptId: 'html-pass' }
    );

    const gaps = analyzeSkillGaps(SKILLS, attempt);
    const roadmap = generateRoadmap(SKILLS, gaps, []);

    // Since HTML has no gaps, CSS first activity should now be available
    const cssFirst = roadmap.activities.find((a) => a.skillId === 'css-fundamentals');
    expect(cssFirst?.status).toBe('available');

    // But responsive-design (requires css-fundamentals) should remain locked
    const respFirst = roadmap.activities.find((a) => a.skillId === 'responsive-design');
    expect(respFirst?.status).toBe('locked');
  });

  it('calculates progress percentage based on completed activities', () => {
    const gaps = analyzeSkillGaps(SKILLS, null);
    const firstActId = 'html-structure--act-html-1';
    const roadmap = generateRoadmap(SKILLS, gaps, [firstActId]);

    expect(roadmap.completedActivitiesCount).toBe(1);
    expect(roadmap.progressPercentage).toBeGreaterThan(0);
    const completedAct = roadmap.activities.find((a) => a.id === firstActId);
    expect(completedAct?.status).toBe('completed');
  });
});

describe('Local Storage Progress Utility', () => {
  beforeEach(() => {
    resetUserProgress();
  });

  it('loads default state when empty', () => {
    const state = loadUserProgress();
    expect(state.completedActivityIds).toEqual([]);
    expect(state.assessmentAttempts).toEqual([]);
    expect(state.latestAttempt).toBeUndefined();
  });

  it('records an attempt and retrieves it', () => {
    const attempt = scoreAssessment(SAMPLE_QUESTIONS, { 'q-html-1': 'b' });
    const state = recordAssessmentAttempt(attempt);

    expect(state.assessmentAttempts.length).toBe(1);
    expect(state.latestAttempt?.id).toBe(attempt.id);

    const reloaded = loadUserProgress();
    expect(reloaded.assessmentAttempts.length).toBe(1);
  });

  it('toggles activity completion properly', () => {
    const id = 'act-test-1';
    let state = toggleActivityCompletion(id);
    expect(state.completedActivityIds).toContain(id);

    // Toggle off
    state = toggleActivityCompletion(id);
    expect(state.completedActivityIds).not.toContain(id);
  });
});
