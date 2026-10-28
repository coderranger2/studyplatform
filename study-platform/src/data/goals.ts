import type { LearningGoalDefinition, SkillId } from '../types/index.ts';

export const LEARNING_GOALS: LearningGoalDefinition[] = [
  {
    id: 'goal-web-dev',
    title: 'Build a Modern Website / Frontend Web Development',
    shortTitle: 'Build a Website',
    description:
      'Master semantic HTML landmarks, CSS layout engines (Flexbox & CSS Grid), and interactive JavaScript DOM events to create production-grade web applications from scratch.',
    targetSkillIds: [
      'html-structure',
      'html-forms',
      'css-fundamentals',
      'responsive-design',
      'js-fundamentals',
      'dom-manipulation'
    ],
    recommendedCommunityIds: ['comm-web-dev', 'comm-general-study'],
    recommendedChannelIds: [
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-doubts',
        label: '#doubts in Web Dev Forge',
        reason: 'Ask questions on HTML/CSS/JS with live code snippets'
      },
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-projects',
        label: '#project-help in Web Dev Forge',
        reason: 'Code review and website layout feedback from peers'
      },
      {
        communityId: 'comm-general-study',
        channelId: 'gf-room-25',
        label: '#pomodoro-25-5 in Quiet Focus',
        reason: 'Timed 25-minute deep coding sprints with accountability'
      }
    ]
  },
  {
    id: 'goal-javascript',
    title: 'Master JavaScript & Interactive DOM Manipulation',
    shortTitle: 'Master JavaScript',
    description:
      'Deepen knowledge of JavaScript data types, scope, closure, asynchronous flow, event listeners, and dynamic DOM tree mutations.',
    targetSkillIds: ['js-fundamentals', 'dom-manipulation', 'html-structure'],
    recommendedCommunityIds: ['comm-web-dev', 'comm-programming'],
    recommendedChannelIds: [
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-doubts',
        label: '#doubts in Web Dev Forge',
        reason: 'Resolve event bubbling and DOM selector bugs with mentors'
      },
      {
        communityId: 'comm-programming',
        channelId: 'cs-general',
        label: '#general-chat in Algorithms & CS',
        reason: 'Discuss algorithms, time complexity, and clean code paradigms'
      },
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-resources',
        label: '#resources in Web Dev Forge',
        reason: 'Cheatsheets for the JavaScript event loop and modern ES6+'
      }
    ]
  },
  {
    id: 'goal-css',
    title: 'Modern CSS, Flexbox & Responsive Layout Engineering',
    shortTitle: 'Modern CSS & Layout',
    description:
      'Conquer the CSS Box Model, Specificity, media queries, Flexbox axes, and CSS Grid template areas for fluid cross-device UI design.',
    targetSkillIds: ['css-fundamentals', 'responsive-design', 'html-structure'],
    recommendedCommunityIds: ['comm-web-dev', 'comm-general-study'],
    recommendedChannelIds: [
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-resources',
        label: '#resources in Web Dev Forge',
        reason: 'Visual guides and interactive games for CSS Grid & Flexbox'
      },
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-room',
        label: '#study-room-silent in Web Dev Forge',
        reason: 'Silent co-working for layout debugging and design audits'
      }
    ]
  },
  {
    id: 'goal-html-accessibility',
    title: 'Accessible HTML5 & Robust Form Architectures',
    shortTitle: 'Accessible HTML & Forms',
    description:
      'Master WCAG 2.1 accessibility principles, semantic landmark hierarchy (<main>, <nav>, <article>), and client-side form validation UX.',
    targetSkillIds: ['html-structure', 'html-forms'],
    recommendedCommunityIds: ['comm-web-dev', 'comm-college'],
    recommendedChannelIds: [
      {
        communityId: 'comm-web-dev',
        channelId: 'wd-resources',
        label: '#resources in Web Dev Forge',
        reason: 'MDN web docs and semantic accessibility guides'
      },
      {
        communityId: 'comm-college',
        channelId: 'col-doubts',
        label: '#doubts in University Hub',
        reason: 'Discuss university lab assignments and web standards'
      }
    ]
  }
];

export const DEFAULT_GOAL_ID = 'goal-web-dev';

export function getGoalById(id?: string): LearningGoalDefinition {
  const found = LEARNING_GOALS.find((g) => g.id === id || g.title === id || g.shortTitle === id);
  return found || LEARNING_GOALS[0];
}

export function getSkillGoalRelevance(skillId: SkillId, goalId: string): boolean {
  const goal = getGoalById(goalId);
  return goal.targetSkillIds.includes(skillId);
}
