import type { Question } from '../types/index.ts';

export const SAMPLE_QUESTIONS: Question[] = [
  // --- HTML Structure & Semantics ---
  {
    id: 'q-html-1',
    skillId: 'html-structure',
    difficulty: 'beginner',
    text: 'Which HTML element should be used to define the primary introductory content or navigational aids for a page?',
    options: [
      { id: 'a', text: '<section>' },
      { id: 'b', text: '<header>' },
      { id: 'c', text: '<main>' },
      { id: 'd', text: '<aside>' }
    ],
    correctOptionId: 'b',
    explanation: '<header> represents a container for introductory content or a set of navigational links.'
  },
  {
    id: 'q-html-2',
    skillId: 'html-structure',
    difficulty: 'intermediate',
    text: 'What is the semantic purpose of the <main> tag in an HTML5 document?',
    options: [
      { id: 'a', text: 'To wrap all elements inside the <body> including footers and navigation' },
      { id: 'b', text: 'To represent the dominant content of the <body> that is unique to the document' },
      { id: 'c', text: 'To define sidebar annotations and related links' },
      { id: 'd', text: 'To contain the global site header and logo' }
    ],
    correctOptionId: 'b',
    explanation: 'The <main> tag specifies the central, unique content of a document and should not be duplicated across pages (like sidebars and navbars).'
  },

  // --- HTML Forms & Inputs ---
  {
    id: 'q-form-1',
    skillId: 'html-forms',
    difficulty: 'beginner',
    text: 'How should a <label> element be correctly associated with an <input> element for screen readers and accessibility?',
    codeSnippet: '<label ...>Username</label>\n<input id="user-input" name="username" type="text" />',
    options: [
      { id: 'a', text: 'Match the label\'s "name" attribute with the input\'s "name"' },
      { id: 'b', text: 'Match the label\'s "for" (or htmlFor) attribute with the input\'s "id"' },
      { id: 'c', text: 'Add class="input-label" to both elements' },
      { id: 'd', text: 'Labels are automatically associated by proximity alone' }
    ],
    correctOptionId: 'b',
    explanation: 'The "for" attribute on a <label> must correspond to the "id" of the associated form control.'
  },
  {
    id: 'q-form-2',
    skillId: 'html-forms',
    difficulty: 'intermediate',
    text: 'Which attribute ensures that an HTML form input cannot be submitted blank without requiring custom JavaScript?',
    options: [
      { id: 'a', text: 'validate="true"' },
      { id: 'b', text: 'mandatory' },
      { id: 'c', text: 'required' },
      { id: 'd', text: 'not-null' }
    ],
    correctOptionId: 'c',
    explanation: 'The boolean "required" attribute enables native browser constraint validation before submission.'
  },

  // --- CSS Fundamentals ---
  {
    id: 'q-css-1',
    skillId: 'css-fundamentals',
    difficulty: 'beginner',
    text: 'In the standard CSS box model, what is the order of layers from innermost to outermost?',
    options: [
      { id: 'a', text: 'Content → Border → Padding → Margin' },
      { id: 'b', text: 'Content → Padding → Border → Margin' },
      { id: 'c', text: 'Margin → Padding → Border → Content' },
      { id: 'd', text: 'Padding → Content → Border → Margin' }
    ],
    correctOptionId: 'b',
    explanation: 'The CSS box model layers from inside out are: Content area, Padding, Border, and Margin.'
  },
  {
    id: 'q-css-2',
    skillId: 'css-fundamentals',
    difficulty: 'intermediate',
    text: 'Which CSS selector has the highest specificity weight?',
    codeSnippet: '/* A */ #main-nav { color: red; }\n/* B */ nav.menu > ul li.active { color: blue; }\n/* C */ div.nav-item { color: green; }\n/* D */ header nav ul li { color: yellow; }',
    options: [
      { id: 'a', text: '#main-nav (ID selector)' },
      { id: 'b', text: 'nav.menu > ul li.active (Class and tag selectors)' },
      { id: 'c', text: 'div.nav-item (Class and tag)' },
      { id: 'd', text: 'header nav ul li (Element selectors)' }
    ],
    correctOptionId: 'a',
    explanation: 'An ID selector (1, 0, 0) outranks any quantity of class (0, 1, 0) and element (0, 0, 1) selectors.'
  },

  // --- Responsive Design & Layouts ---
  {
    id: 'q-resp-1',
    skillId: 'responsive-design',
    difficulty: 'intermediate',
    text: 'In CSS Flexbox, which property controls alignment of flex items along the cross axis?',
    options: [
      { id: 'a', text: 'justify-content' },
      { id: 'b', text: 'align-items' },
      { id: 'c', text: 'flex-direction' },
      { id: 'd', text: 'content-align' }
    ],
    correctOptionId: 'b',
    explanation: 'justify-content aligns items along the main axis, while align-items aligns them along the perpendicular cross axis.'
  },
  {
    id: 'q-resp-2',
    skillId: 'responsive-design',
    difficulty: 'intermediate',
    text: 'Which CSS media query adheres to a mobile-first responsive strategy?',
    options: [
      { id: 'a', text: '@media (max-width: 768px) { ... }' },
      { id: 'b', text: '@media (min-width: 768px) { ... }' },
      { id: 'c', text: '@media (device-width: mobile) { ... }' },
      { id: 'd', text: '@media screen and (orientation: landscape) { ... }' }
    ],
    correctOptionId: 'b',
    explanation: 'Mobile-first design styles mobile defaults first, then uses min-width media queries to progressively enhance larger viewports.'
  },

  // --- JavaScript Fundamentals ---
  {
    id: 'q-js-1',
    skillId: 'js-fundamentals',
    difficulty: 'beginner',
    text: 'What will the expression `typeof NaN` return in JavaScript?',
    options: [
      { id: 'a', text: '"undefined"' },
      { id: 'b', text: '"nan"' },
      { id: 'c', text: '"number"' },
      { id: 'd', text: '"null"' }
    ],
    correctOptionId: 'c',
    explanation: 'Despite standing for "Not a Number", NaN has the numeric type according to the IEEE 754 standard and typeof NaN is "number".'
  },
  {
    id: 'q-js-2',
    skillId: 'js-fundamentals',
    difficulty: 'intermediate',
    text: 'Which array method returns a brand new array containing only elements that satisfy a condition, without mutating the original array?',
    codeSnippet: 'const scores = [45, 82, 90, 63];\nconst passing = scores.???(score => score >= 70);',
    options: [
      { id: 'a', text: 'scores.forEach()' },
      { id: 'b', text: 'scores.splice()' },
      { id: 'c', text: 'scores.filter()' },
      { id: 'd', text: 'scores.reduce()' }
    ],
    correctOptionId: 'c',
    explanation: 'Array.prototype.filter() returns a shallow copy of a portion of the given array filtered down to elements passing the callback test.'
  },

  // --- DOM Manipulation & Events ---
  {
    id: 'q-dom-1',
    skillId: 'dom-manipulation',
    difficulty: 'beginner',
    text: 'Which method should be used to safely listen for click events on a button?',
    codeSnippet: 'const btn = document.querySelector("#submit-btn");',
    options: [
      { id: 'a', text: 'btn.addEventListener("click", handler);' },
      { id: 'b', text: 'btn.listen("click", handler);' },
      { id: 'c', text: 'btn.attachEvent("onclick", handler);' },
      { id: 'd', text: 'btn.trigger("click", handler);' }
    ],
    correctOptionId: 'a',
    explanation: 'addEventListener is the modern standard DOM method for binding multiple event handlers to an EventTarget.'
  },
  {
    id: 'q-dom-2',
    skillId: 'dom-manipulation',
    difficulty: 'intermediate',
    text: 'What is "event delegation" in the browser DOM?',
    options: [
      { id: 'a', text: 'Assigning multiple click functions to the exact same child node' },
      { id: 'b', text: 'Attaching a single event listener to a parent element to leverage event bubbling for child targets' },
      { id: 'c', text: 'Delegating event handling to a background web worker thread' },
      { id: 'd', text: 'Stopping an event from propagating up the document tree' }
    ],
    correctOptionId: 'b',
    explanation: 'Event delegation takes advantage of event bubbling by putting an event listener on a parent container rather than attaching individual listeners to each child.'
  }
];
