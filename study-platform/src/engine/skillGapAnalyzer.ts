import type {
  AssessmentAttempt,
  MasteryLevel,
  Skill,
  SkillGap,
  SkillId
} from '../types/index.ts';

export const MASTERY_PASSING_THRESHOLD = 70; // 70% or higher indicates proficiency

/**
 * Maps a numeric score percentage to a structured competency mastery level.
 */
export function getMasteryLevel(scorePercentage: number, totalQuestions: number): MasteryLevel {
  if (totalQuestions === 0) return 'unassessed';
  if (scorePercentage >= 90) return 'mastered';
  if (scorePercentage >= 70) return 'proficient';
  if (scorePercentage >= 40) return 'developing';
  return 'novice';
}

/**
 * Analyzes competency gaps across all registered curriculum skills.
 * Considers assessment results and prerequisite relationships deterministically.
 */
export function analyzeSkillGaps(
  skills: Skill[],
  attempt: AssessmentAttempt | null
): SkillGap[] {
  const skillMap = new Map<SkillId, Skill>(skills.map((s) => [s.id, s]));
  const masteryStatus = new Map<SkillId, { hasGap: boolean; percentage: number }>();

  // First pass: assess raw scores and gap status
  for (const skill of skills) {
    const scoreData = attempt?.skillScores[skill.id];
    const total = scoreData?.total ?? 0;
    const percentage = scoreData?.percentage ?? 0;

    const hasGap = total === 0 || percentage < MASTERY_PASSING_THRESHOLD;
    masteryStatus.set(skill.id, { hasGap, percentage });
  }

  // Second pass: incorporate prerequisite awareness and generate recommendations
  return skills.map((skill) => {
    const scoreData = attempt?.skillScores[skill.id];
    const total = scoreData?.total ?? 0;
    const correct = scoreData?.correct ?? 0;
    const percentage = scoreData?.percentage ?? 0;
    const masteryLevel = getMasteryLevel(percentage, total);
    const hasGap = total === 0 || percentage < MASTERY_PASSING_THRESHOLD;

    // Detect unmet prerequisites
    const unmetPrerequisites = skill.prerequisites.filter((preId) => {
      const preStatus = masteryStatus.get(preId);
      // If prerequisite has gap or was not mastered, it is unmet
      return !preStatus || preStatus.hasGap;
    });

    let recommendation = '';
    if (unmetPrerequisites.length > 0) {
      const unmetNames = unmetPrerequisites
        .map((id) => skillMap.get(id)?.name ?? id)
        .join(', ');
      recommendation = `Prerequisite foundation (${unmetNames}) needs reinforcement before mastering ${skill.name}.`;
    } else if (masteryLevel === 'mastered') {
      recommendation = `Exemplary mastery demonstrated (${percentage}%). Ready to assist peers or build advanced capstone work.`;
    } else if (masteryLevel === 'proficient') {
      recommendation = `Solid proficiency (${percentage}%). Reinforce minor weak spots through targeted challenges.`;
    } else if (masteryLevel === 'developing') {
      recommendation = `Partial understanding (${percentage}%). Focused learning modules and code walkthroughs recommended.`;
    } else if (masteryLevel === 'novice') {
      recommendation = `Fundamental gaps found (${percentage}%). Review core concepts and step-by-step interactive exercises.`;
    } else {
      recommendation = `Skill not yet evaluated. Take the diagnostic assessment to measure baseline proficiency.`;
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      scorePercentage: percentage,
      totalQuestions: total,
      correctAnswers: correct,
      masteryLevel,
      hasGap,
      unmetPrerequisites,
      recommendation
    };
  });
}
