import type { Skill, SkillId } from '../types/index.ts';

export const SKILLS: Skill[] = [
  {
    id: 'html-structure',
    name: 'HTML Structure & Semantics',
    category: 'HTML',
    description: 'Core page structure, modern semantic elements (<header>, <main>, <nav>, <article>, <section>), document head, and accessible document outline.',
    prerequisites: [],
    learningObjectives: [
      'Understand doctype, html, head, and body tags',
      'Use semantic elements appropriately over generic <div> containers',
      'Implement accessible headings and landmarks hierarchy',
      'Manage metadata, viewports, and page titling in head'
    ],
    estimatedHours: 4
  },
  {
    id: 'html-forms',
    name: 'HTML Forms & Inputs',
    category: 'HTML',
    description: 'Interactive web forms, various input types, validation attributes, labels, fieldsets, and accessible form controls.',
    prerequisites: ['html-structure'],
    learningObjectives: [
      'Structure forms with <form>, <fieldset>, and <legend>',
      'Associate <label> elements with inputs using "for" and "id"',
      'Leverage native HTML5 validation (required, pattern, min/max)',
      'Handle various input types (text, email, number, checkbox, radio, select)'
    ],
    estimatedHours: 4
  },
  {
    id: 'css-fundamentals',
    name: 'CSS Fundamentals',
    category: 'CSS',
    description: 'The CSS box model, cascade, specificity, selector priority, standard units, positioning schemes, and typography basics.',
    prerequisites: ['html-structure'],
    learningObjectives: [
      'Master the box model (content, padding, border, margin)',
      'Calculate selector specificity and handle the cascade',
      'Utilize relative (rem, em, %) and absolute units',
      'Understand normal flow, relative, absolute, fixed, and sticky positioning'
    ],
    estimatedHours: 6
  },
  {
    id: 'responsive-design',
    name: 'Responsive Design & Modern Layouts',
    category: 'CSS',
    description: 'Flexbox, CSS Grid layouts, media queries, mobile-first design principles, and responsive images/units.',
    prerequisites: ['css-fundamentals'],
    learningObjectives: [
      'Build 1-dimensional layouts with Flexbox (align, justify, flex-wrap)',
      'Construct 2-dimensional grid systems with CSS Grid (grid-template, fr, auto-fit)',
      'Write mobile-first media queries and responsive breakpoints',
      'Implement fluid typography and responsive media (max-width: 100%)'
    ],
    estimatedHours: 8
  },
  {
    id: 'js-fundamentals',
    name: 'JavaScript Fundamentals',
    category: 'JavaScript',
    description: 'Variables (let/const), primitive data types, scope, operators, control flow, functions, arrays, and object fundamentals.',
    prerequisites: ['html-structure'],
    learningObjectives: [
      'Differentiate primitive types from reference types and variable scoping (block vs function)',
      'Work with arrays and higher-order methods (map, filter, reduce)',
      'Define function declarations, expressions, and arrow functions',
      'Understand conditional logic, truthy/falsy evaluation, and error handling'
    ],
    estimatedHours: 10
  },
  {
    id: 'dom-manipulation',
    name: 'DOM Manipulation & Events',
    category: 'JavaScript',
    description: 'Selecting elements, updating text/attributes/classes, event listeners, bubbling and delegation, and dynamic DOM rendering.',
    prerequisites: ['js-fundamentals', 'html-structure'],
    learningObjectives: [
      'Query the DOM efficiently with querySelector and querySelectorAll',
      'Modify element attributes, classList, and inner content safely',
      'Attach event listeners and manage event bubbling & delegation',
      'Dynamically create and append DOM nodes in response to user actions'
    ],
    estimatedHours: 8
  }
];

export const SKILL_MAP: Record<SkillId, Skill> = SKILLS.reduce((acc, skill) => {
  acc[skill.id] = skill;
  return acc;
}, {} as Record<SkillId, Skill>);
