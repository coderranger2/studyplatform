import type {
  ActivityStatus,
  LearningRoadmap,
  RoadmapActivity,
  Skill,
  SkillGap,
  SkillId
} from '../types/index.ts';

/**
 * Standard curriculum activities mapped per skill to maintain deterministic pedagogical sequence.
 */
interface ActivityTemplate {
  subId: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'project' | 'review';
  estimatedMinutes: number;
  isMilestone?: boolean;
}

const SKILL_ACTIVITY_TEMPLATES: Record<SkillId, ActivityTemplate[]> = {
  'html-structure': [
    {
      subId: 'act-html-1',
      title: 'HTML5 Semantic Architecture & Headings',
      description: 'Deep dive into landmarks (<header>, <main>, <nav>, <article>, <section>) and proper outline hierarchy.',
      type: 'learn',
      estimatedMinutes: 30
    },
    {
      subId: 'act-html-2',
      title: 'Refactor "Div Soup" into Clean Semantics',
      description: 'Hands-on practice replacing unsemantic containers with accessible, modern HTML5 structures.',
      type: 'practice',
      estimatedMinutes: 45
    },
    {
      subId: 'act-html-3',
      title: 'Capstone: Accessible Document Skeleton',
      description: 'Build a compliant, accessible web layout with complete SEO meta tags and ARIA landmarks.',
      type: 'project',
      estimatedMinutes: 60,
      isMilestone: true
    }
  ],
  'html-forms': [
    {
      subId: 'act-forms-1',
      title: 'Accessible Inputs & Validation Engine',
      description: 'Master label associations, native constraint validation, and accessible error notifications.',
      type: 'learn',
      estimatedMinutes: 35
    },
    {
      subId: 'act-forms-2',
      title: 'Build a Multi-Section Registration Form',
      description: 'Practice fieldsets, legends, custom pattern matching, and input constraints without external libraries.',
      type: 'practice',
      estimatedMinutes: 50
    }
  ],
  'css-fundamentals': [
    {
      subId: 'act-css-1',
      title: 'Box Model, Cascade & Specificity Deep Dive',
      description: 'Understand content/padding/border/margin calculation, box-sizing, and specificity war prevention.',
      type: 'learn',
      estimatedMinutes: 40
    },
    {
      subId: 'act-css-2',
      title: 'CSS Specificity & Positioning Workshop',
      description: 'Practice relative, absolute, fixed, and sticky positioning scenarios with precision.',
      type: 'practice',
      estimatedMinutes: 55
    }
  ],
  'responsive-design': [
    {
      subId: 'act-resp-1',
      title: 'Flexbox, CSS Grid & Mobile-First Breakpoints',
      description: 'Construct 1D flex layouts and 2D grid systems with fluid units and mobile-first media queries.',
      type: 'learn',
      estimatedMinutes: 45
    },
    {
      subId: 'act-resp-2',
      title: 'Responsive Dashboard Shell Implementation',
      description: 'Build an adaptive dashboard that seamlessly transitions from single-column mobile to multi-column desktop.',
      type: 'practice',
      estimatedMinutes: 65,
      isMilestone: true
    }
  ],
  'js-fundamentals': [
    {
      subId: 'act-js-1',
      title: 'Modern JS Syntax, Scope & Higher-Order Methods',
      description: 'Master block scoping, arrow functions, immutability, and array operations (.map, .filter, .reduce).',
      type: 'learn',
      estimatedMinutes: 45
    },
    {
      subId: 'act-js-2',
      title: 'Data Transformation & Logic Puzzles',
      description: 'Hands-on coding challenges handling JSON datasets and complex conditional transformations.',
      type: 'practice',
      estimatedMinutes: 60
    }
  ],
  'dom-manipulation': [
    {
      subId: 'act-dom-1',
      title: 'DOM Querying, Mutations & Event Delegation',
      description: 'Efficient querySelector usage, event bubbling lifecycles, and event delegation patterns.',
      type: 'learn',
      estimatedMinutes: 40
    },
    {
      subId: 'act-dom-2',
      title: 'Interactive Todo & Task Manager',
      description: 'Build an end-to-end interactive application with dynamic DOM rendering, keyboard shortcuts, and state handling.',
      type: 'project',
      estimatedMinutes: 75,
      isMilestone: true
    }
  ]
};

/**
 * Topologically sorts skills based on their prerequisite requirements.
 * Ensures foundational skills always precede dependent skills deterministically.
 */
export function sortSkillsTopologically(skills: Skill[]): Skill[] {
  const sorted: Skill[] = [];
  const visited = new Set<SkillId>();
  const visiting = new Set<SkillId>();
  const skillMap = new Map<SkillId, Skill>(skills.map((s) => [s.id, s]));

  function visit(skillId: SkillId) {
    if (visited.has(skillId)) return;
    if (visiting.has(skillId)) {
      throw new Error(`Cyclic prerequisite dependency detected involving skill: ${skillId}`);
    }

    visiting.add(skillId);
    const skill = skillMap.get(skillId);
    if (skill) {
      for (const preId of skill.prerequisites) {
        if (skillMap.has(preId)) {
          visit(preId);
        }
      }
    }
    visiting.delete(skillId);
    visited.add(skillId);
    if (skill) {
      sorted.push(skill);
    }
  }

  for (const skill of skills) {
    if (!visited.has(skill.id)) {
      visit(skill.id);
    }
  }

  return sorted;
}

/**
 * Generates a personalized, prerequisite-aware roadmap based on student skill gaps.
 * Deterministic and UI-independent.
 */
export function generateRoadmap(
  skills: Skill[],
  skillGaps: SkillGap[],
  completedActivityIds: string[] = [],
  options?: { generatedAt?: string }
): LearningRoadmap {
  const completedSet = new Set(completedActivityIds);
  const gapMap = new Map<SkillId, SkillGap>(skillGaps.map((g) => [g.skillId, g]));
  const orderedSkills = sortSkillsTopologically(skills);

  const targetSkillsWithGaps: SkillId[] = [];
  const masteredSkills: SkillId[] = [];

  for (const gap of skillGaps) {
    if (gap.hasGap) {
      targetSkillsWithGaps.push(gap.skillId);
    } else {
      masteredSkills.push(gap.skillId);
    }
  }

  // Track resolved skills as we progress
  // A skill is resolved if user demonstrated mastery/proficiency without gaps OR if all its roadmap activities are completed
  const resolvedSkills = new Set<SkillId>(masteredSkills);

  const activities: RoadmapActivity[] = [];

  for (const skill of orderedSkills) {
    const templates = SKILL_ACTIVITY_TEMPLATES[skill.id] || [];
    const skillGap = gapMap.get(skill.id);
    const hasInitialGap = skillGap ? skillGap.hasGap : true;

    // Check if prerequisites are currently satisfied
    const allPrerequisitesMet = skill.prerequisites.every((preId) => resolvedSkills.has(preId));

    let allSkillActivitiesCompleted = true;

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const activityId = `${skill.id}--${template.subId}`;
      const isCompleted = completedSet.has(activityId);

      if (!isCompleted) {
        allSkillActivitiesCompleted = false;
      }

      let status: ActivityStatus = 'locked';

      if (isCompleted) {
        status = 'completed';
      } else if (!allPrerequisitesMet) {
        status = 'locked';
      } else {
        // Prerequisites met: activity within the skill is available
        // If it's the first activity or previous activities in this skill are completed
        const prevActivityId = i > 0 ? `${skill.id}--${templates[i - 1].subId}` : null;
        if (!prevActivityId || completedSet.has(prevActivityId) || !hasInitialGap) {
          status = 'available';
        } else {
          status = 'locked';
        }
      }

      activities.push({
        id: activityId,
        skillId: skill.id,
        title: template.title,
        description: template.description,
        type: template.type,
        estimatedMinutes: template.estimatedMinutes,
        status,
        prerequisiteSkillIds: [...skill.prerequisites],
        isMilestone: template.isMilestone
      });
    }

    if (allSkillActivitiesCompleted && templates.length > 0) {
      resolvedSkills.add(skill.id);
    }
  }

  const completedActivitiesCount = activities.filter((a) => a.status === 'completed').length;
  const progressPercentage =
    activities.length > 0 ? Math.round((completedActivitiesCount / activities.length) * 100) : 0;

  return {
    generatedAt: options?.generatedAt ?? new Date().toISOString(),
    targetSkillsWithGaps,
    masteredSkills,
    activities,
    totalActivities: activities.length,
    completedActivitiesCount,
    progressPercentage
  };
}
