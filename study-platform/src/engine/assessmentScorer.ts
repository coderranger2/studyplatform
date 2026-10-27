import type {
  AssessmentAttempt,
  Question,
  SkillId,
  SkillScoreSummary,
  UserAnswers
} from '../types/index.ts';

/**
 * Deterministically scores an assessment submission based on questions and submitted user answers.
 * Operates purely without UI side effects or randomness.
 */
export function scoreAssessment(
  questions: Question[],
  answers: UserAnswers,
  options?: { attemptId?: string; timestamp?: string }
): AssessmentAttempt {
  if (questions.length === 0) {
    throw new Error('Cannot score an empty question set.');
  }

  let totalCorrect = 0;
  const skillBuckets: Partial<Record<SkillId, { total: number; correct: number }>> = {};

  // Group questions by skill and evaluate correctness
  for (const q of questions) {
    if (!skillBuckets[q.skillId]) {
      skillBuckets[q.skillId] = { total: 0, correct: 0 };
    }
    const bucket = skillBuckets[q.skillId]!;
    bucket.total += 1;

    const selectedOption = answers[q.id];
    if (selectedOption !== undefined && selectedOption === q.correctOptionId) {
      totalCorrect += 1;
      bucket.correct += 1;
    }
  }

  // Build skill-by-skill summaries
  const skillScores: Record<SkillId, SkillScoreSummary> = {} as Record<SkillId, SkillScoreSummary>;
  for (const [skillKey, data] of Object.entries(skillBuckets)) {
    const sId = skillKey as SkillId;
    const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    skillScores[sId] = {
      skillId: sId,
      total: data.total,
      correct: data.correct,
      percentage
    };
  }

  const overallScorePercentage = Math.round((totalCorrect / questions.length) * 100);
  const timestamp = options?.timestamp ?? new Date().toISOString();
  const id = options?.attemptId ?? `attempt_${Date.parse(timestamp) || Date.now()}`;

  return {
    id,
    timestamp,
    answers: { ...answers },
    totalQuestions: questions.length,
    correctQuestions: totalCorrect,
    overallScorePercentage,
    skillScores
  };
}
