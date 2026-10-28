import type {
  Badge,
  Community,
  CustomQuiz,
  FlashcardDeck,
  LeaderboardEntry,
  ChatMessage,
  StudentProfile,
  StudyBuddyProfile,
  StudyResource,
  TeacherProfile
} from '../types/index.ts';

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-web-dev',
    name: 'Web Dev Forge',
    slug: 'web-dev',
    category: 'Web Development',
    description: 'Master modern frontend & fullstack web technologies: HTML5, CSS3, JavaScript, React, and browser architecture.',
    icon: '⚡',
    memberCount: 342,
    isJoined: true,
    activeStudyGoal: 'Dominate DOM Manipulation & Flexbox/Grid by weekend',
    channels: [
      { id: 'wd-general', communityId: 'comm-web-dev', name: 'general-chat', description: 'General web development talk and daily check-ins', type: 'text', isDefault: true },
      { id: 'wd-doubts', communityId: 'comm-web-dev', name: 'doubts', description: 'Ask questions about HTML/CSS/JS with code snippets', type: 'doubts' },
      { id: 'wd-resources', communityId: 'comm-web-dev', name: 'resources', description: 'Cheatsheets, MDN links, tutorials, and templates', type: 'resources' },
      { id: 'wd-projects', communityId: 'comm-web-dev', name: 'project-help', description: 'Code reviews, portfolio feedback, and debugging sessions', type: 'project-help' },
      { id: 'wd-room', communityId: 'comm-web-dev', name: 'study-room-silent', description: 'Pomodoro focus room for deep frontend coding', type: 'study-room' }
    ]
  },
  {
    id: 'comm-programming',
    name: 'Algorithms & Core CS',
    slug: 'core-cs',
    category: 'Programming',
    description: 'Data structures, time complexity analysis, algorithm challenges, and computational problem solving.',
    icon: '💻',
    memberCount: 289,
    isJoined: true,
    activeStudyGoal: 'Solve 10 Recursion and Dynamic Programming problems',
    channels: [
      { id: 'cs-general', communityId: 'comm-programming', name: 'general-chat', description: 'General programming discussions and language debates', type: 'text', isDefault: true },
      { id: 'cs-doubts', communityId: 'comm-programming', name: 'doubts', description: 'Debug logic errors, edge cases, and runtime issues', type: 'doubts' },
      { id: 'cs-resources', communityId: 'comm-programming', name: 'resources', description: 'Algorithmic visualizers, roadmap sheets, and articles', type: 'resources' },
      { id: 'cs-room', communityId: 'comm-programming', name: 'study-room', description: 'Silent co-working space for practice sets', type: 'study-room' }
    ]
  },
  {
    id: 'comm-college',
    name: 'University Engineering Hub',
    slug: 'college-hub',
    category: 'College Subjects',
    description: 'Collaborate on university STEM syllabi, semester exam preparations, lab assignments, and notes exchange.',
    icon: '🏛️',
    memberCount: 194,
    isJoined: true,
    activeStudyGoal: 'Midterm revision notes compilation',
    channels: [
      { id: 'col-general', communityId: 'comm-college', name: 'general-chat', description: 'Campus chat, deadline tracking, and announcements', type: 'text', isDefault: true },
      { id: 'col-doubts', communityId: 'comm-college', name: 'doubts', description: 'Complex syllabus concepts and assignment help', type: 'doubts' },
      { id: 'col-resources', communityId: 'comm-college', name: 'resources', description: 'Past year papers, lecture notes, and reference books', type: 'resources' },
      { id: 'col-room', communityId: 'comm-college', name: 'exam-prep-room', description: 'Group study sprints before upcoming midterms', type: 'study-room' }
    ]
  },
  {
    id: 'comm-competitive',
    name: 'Competitive Exam Grinders',
    slug: 'exam-prep',
    category: 'Competitive Exams',
    description: 'High-focus study group for technical entrance exams, aptitude assessments, and placement tests.',
    icon: '🎯',
    memberCount: 215,
    isJoined: false,
    activeStudyGoal: 'Daily timed mock test review',
    channels: [
      { id: 'ce-general', communityId: 'comm-competitive', name: 'general-chat', description: 'Strategy discussions and motivational updates', type: 'text', isDefault: true },
      { id: 'ce-doubts', communityId: 'comm-competitive', name: 'doubts', description: 'Tough quantitative & reasoning problem breakdowns', type: 'doubts' },
      { id: 'ce-resources', communityId: 'comm-competitive', name: 'resources', description: 'Formulas, speed math sheets, and mock tests', type: 'resources' }
    ]
  },
  {
    id: 'comm-general-study',
    name: 'Quiet Focus & Deep Work',
    slug: 'general-focus',
    category: 'General Study',
    description: 'A cozy, distraction-free study space for students working on their own goals with shared accountability.',
    icon: '☕',
    memberCount: 412,
    isJoined: false,
    activeStudyGoal: '30 hours of collective weekly focus recorded',
    channels: [
      { id: 'gf-general', communityId: 'comm-general-study', name: 'general-chat', description: 'Share your intentions for today and celebrate tiny wins', type: 'text', isDefault: true },
      { id: 'gf-room-25', communityId: 'comm-general-study', name: 'pomodoro-25-5', description: 'Classic 25-minute sprints with 5-minute coffee breaks', type: 'study-room' },
      { id: 'gf-resources', communityId: 'comm-general-study', name: 'resources', description: 'Productivity workflows, ambient sounds, and habit trackers', type: 'resources' }
    ]
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    communityId: 'comm-web-dev',
    channelId: 'wd-general',
    authorName: 'Ananya Sharma',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '10:14 AM',
    content: 'Good morning everyone! Just took the diagnostic assessment on SkillForge and identified a gap in Flexbox alignment. Planning to clear that module today 🚀',
    reactions: { '🔥': 4, '👏': 2 }
  },
  {
    id: 'msg-2',
    communityId: 'comm-web-dev',
    channelId: 'wd-general',
    authorName: 'Marcus Chen',
    authorAvatar: '🧑‍🎓',
    authorRole: 'Mentor',
    timestamp: '10:20 AM',
    content: 'Awesome goal Ananya! Remember that `align-items` works on the cross axis, while `justify-content` works on the main axis. Check out the cheatsheet in #resources if you get stuck.',
    replyToId: 'msg-1',
    reactions: { '💡': 5 }
  },
  {
    id: 'msg-3',
    communityId: 'comm-web-dev',
    channelId: 'wd-general',
    authorName: 'Rohan Patel',
    authorAvatar: '👨‍💻',
    authorRole: 'Student',
    timestamp: '10:35 AM',
    content: 'Anyone free for a 25-minute Pomodoro in the #study-room-silent around 11:00 AM? Working on semantic HTML refactoring.',
    reactions: { '☕': 3 }
  },
  {
    id: 'msg-4',
    communityId: 'comm-web-dev',
    channelId: 'wd-doubts',
    authorName: 'Priya Nair',
    authorAvatar: '👩‍🔬',
    authorRole: 'Student',
    timestamp: '09:45 AM',
    content: 'Can someone explain why `event.preventDefault()` is needed on form submit? My page keeps reloading whenever I click the submit button.',
    reactions: { '👀': 2 }
  },
  {
    id: 'msg-5',
    communityId: 'comm-web-dev',
    channelId: 'wd-doubts',
    authorName: 'David Kim',
    authorAvatar: '👨‍🏫',
    authorRole: 'Teacher',
    timestamp: '09:52 AM',
    content: 'The default browser action for an HTML `<form>` submission is to send a GET/POST request and reload the page. Calling `e.preventDefault()` stops that native reload so your JavaScript can handle validation and asynchronous API updates seamlessly!',
    replyToId: 'msg-4',
    reactions: { '❤️': 6, '✅': 3 }
  },
  {
    id: 'msg-6',
    communityId: 'comm-web-dev',
    channelId: 'wd-resources',
    authorName: 'Aarav Mehta',
    authorAvatar: '🧑‍💻',
    authorRole: 'Mentor',
    timestamp: 'Yesterday',
    content: 'Sharing the definitive interactive guide on CSS Grid vs Flexbox with visual diagrams for your roadmap:',
    resourceLink: {
      title: 'A Complete Guide to CSS Flexbox & Grid',
      url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
      skillId: 'responsive-design'
    },
    reactions: { '📌': 7, '🚀': 4 }
  },
  {
    id: 'msg-wd-proj-1',
    communityId: 'comm-web-dev',
    channelId: 'wd-projects',
    authorName: 'Rohan Patel',
    authorAvatar: '👨‍💻',
    authorRole: 'Student',
    timestamp: '11:15 AM',
    content: 'Building my first responsive study dashboard! Could someone check why my grid items aren\'t wrapping properly on narrow mobile screens?',
    reactions: { '💡': 3 }
  },
  {
    id: 'msg-wd-proj-2',
    communityId: 'comm-web-dev',
    channelId: 'wd-projects',
    authorName: 'Marcus Chen',
    authorAvatar: '🧑‍🎓',
    authorRole: 'Mentor',
    timestamp: '11:22 AM',
    content: 'Make sure you use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` instead of fixed column counts. That will automatically reflow on small viewports without manual media queries!',
    replyToId: 'msg-wd-proj-1',
    reactions: { '🔥': 5, '❤️': 3 }
  },
  {
    id: 'msg-wd-room-1',
    communityId: 'comm-web-dev',
    channelId: 'wd-room',
    authorName: 'Ananya Sharma',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '11:30 AM',
    content: 'Starting a 25m silent focus sprint on JavaScript array methods (reduce & filter). Let\'s keep microphones muted and crush our goals!',
    reactions: { '☕': 5, '🎯': 4 }
  },
  {
    id: 'msg-wd-room-2',
    communityId: 'comm-web-dev',
    channelId: 'wd-room',
    authorName: 'David Kim',
    authorAvatar: '👨‍🏫',
    authorRole: 'Teacher',
    timestamp: '11:32 AM',
    content: 'Joined the focus session! Working on curriculum diagnostics. 25-minute timer running.',
    reactions: { '🚀': 4 }
  },
  {
    id: 'msg-7',
    communityId: 'comm-programming',
    channelId: 'cs-general',
    authorName: 'Sara Lindqvist',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '08:15 AM',
    content: 'Finally solved the two-pointer problem with O(n) time complexity without extra space! Slow and steady progress.',
    reactions: { '🎉': 5 }
  },
  {
    id: 'msg-cs-doubts-1',
    communityId: 'comm-programming',
    channelId: 'cs-doubts',
    authorName: 'Priya Nair',
    authorAvatar: '👩‍🔬',
    authorRole: 'Student',
    timestamp: '09:05 AM',
    content: 'In Quicksort, how do we prevent the worst-case O(n²) time complexity when the input array is already sorted?',
    reactions: { '❓': 2 }
  },
  {
    id: 'msg-cs-doubts-2',
    communityId: 'comm-programming',
    channelId: 'cs-doubts',
    authorName: 'Sara Lindqvist',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '09:12 AM',
    content: 'Pick the pivot using "median-of-three" (first, middle, last) or randomize the pivot index. That drops the probability of hitting O(n²) to essentially zero in practice!',
    replyToId: 'msg-cs-doubts-1',
    reactions: { '💡': 6, '✅': 4 }
  },
  {
    id: 'msg-cs-res-1',
    communityId: 'comm-programming',
    channelId: 'cs-resources',
    authorName: 'Marcus Chen',
    authorAvatar: '🧑‍🎓',
    authorRole: 'Mentor',
    timestamp: 'Yesterday',
    content: 'Here is an awesome interactive visualizer for BST rotations, graph traversals, and dynamic programming tables:',
    resourceLink: {
      title: 'VisuAlgo - Visualizing Data Structures and Algorithms',
      url: 'https://visualgo.net/en'
    },
    reactions: { '📌': 8, '🔥': 5 }
  },
  {
    id: 'msg-cs-room-1',
    communityId: 'comm-programming',
    channelId: 'cs-room',
    authorName: 'Sara Lindqvist',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '10:00 AM',
    content: '25-minute deep focus block starting: solving LeetCode #33 (Search in Rotated Sorted Array). Timer set!',
    reactions: { '💻': 4, '⏱️': 3 }
  },
  {
    id: 'msg-col-gen-1',
    communityId: 'comm-college',
    channelId: 'col-general',
    authorName: 'Rohan Patel',
    authorAvatar: '👨‍💻',
    authorRole: 'Student',
    timestamp: '09:30 AM',
    content: 'Reminder for everyone in the campus study circle: midterm lab submissions are due this Friday. Please make sure all git commit histories are clean!',
    reactions: { '👀': 5, '👍': 4 }
  },
  {
    id: 'msg-col-doubts-1',
    communityId: 'comm-college',
    channelId: 'col-doubts',
    authorName: 'Priya Nair',
    authorAvatar: '👩‍🔬',
    authorRole: 'Student',
    timestamp: '10:10 AM',
    content: 'Can someone explain the architectural difference between Process and Thread in Operating Systems?',
    reactions: { '❓': 3 }
  },
  {
    id: 'msg-col-doubts-2',
    communityId: 'comm-college',
    channelId: 'col-doubts',
    authorName: 'David Kim',
    authorAvatar: '👨‍🏫',
    authorRole: 'Teacher',
    timestamp: '10:18 AM',
    content: 'Processes have independent virtual address spaces and heavier context switches. Threads within the same process share code, heap, and open file descriptors, making thread context switches very fast!',
    replyToId: 'msg-col-doubts-1',
    reactions: { '💡': 7, '❤️': 4 }
  },
  {
    id: 'msg-col-res-1',
    communityId: 'comm-college',
    channelId: 'col-resources',
    authorName: 'Rohan Patel',
    authorAvatar: '👨‍💻',
    authorRole: 'Student',
    timestamp: '2 days ago',
    content: 'Compiled the complete reference guide for OSI 7-Layer model and TCP/IP stack with protocol breakdowns:',
    resourceLink: {
      title: 'GeeksforGeeks: Layers of OSI Model Explained',
      url: 'https://www.geeksforgeeks.org/layers-of-osi-model/'
    },
    reactions: { '📌': 6, '🚀': 3 }
  },
  {
    id: 'msg-col-room-1',
    communityId: 'comm-college',
    channelId: 'col-room',
    authorName: 'Ananya Sharma',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '11:00 AM',
    content: 'Exam prep silent room open! Reviewing discrete mathematics proofs and graph theory definitions for 25m.',
    reactions: { '📚': 4, '☕': 3 }
  },
  {
    id: 'msg-ce-gen-1',
    communityId: 'comm-competitive',
    channelId: 'ce-general',
    authorName: 'Aarav Mehta',
    authorAvatar: '🧑‍💻',
    authorRole: 'Mentor',
    timestamp: '08:45 AM',
    content: 'Daily aptitude speed sprint completed: 20 quantitative reasoning questions in 17 minutes! Keep the streak alive.',
    reactions: { '🔥': 8, '👏': 6 }
  },
  {
    id: 'msg-ce-doubts-1',
    communityId: 'comm-competitive',
    channelId: 'ce-doubts',
    authorName: 'Rohan Patel',
    authorAvatar: '👨‍💻',
    authorRole: 'Student',
    timestamp: '09:20 AM',
    content: 'What is the fastest mental shortcut for pipes & cisterns problems when leak rates vary over time?',
    reactions: { '❓': 2 }
  },
  {
    id: 'msg-ce-doubts-2',
    communityId: 'comm-competitive',
    channelId: 'ce-doubts',
    authorName: 'Aarav Mehta',
    authorAvatar: '🧑‍💻',
    authorRole: 'Mentor',
    timestamp: '09:28 AM',
    content: 'Take the LCM of all given times to represent total tank volume in "work units". Then convert each tap to positive units/hour and the leak to negative units/hour. Sum them up and divide!',
    replyToId: 'msg-ce-doubts-1',
    reactions: { '💡': 6, '✅': 4 }
  },
  {
    id: 'msg-ce-res-1',
    communityId: 'comm-competitive',
    channelId: 'ce-resources',
    authorName: 'David Kim',
    authorAvatar: '👨‍🏫',
    authorRole: 'Teacher',
    timestamp: '3 days ago',
    content: 'Essential formula reference for speed math, percentage reciprocals, and quantitative reasoning drills:',
    resourceLink: {
      title: 'Quantitative Aptitude Formulae & Practice Sets',
      url: 'https://www.indiabix.com/aptitude/questions-and-answers/'
    },
    reactions: { '📌': 9, '🔥': 4 }
  },
  {
    id: 'msg-gf-gen-1',
    communityId: 'comm-general-study',
    channelId: 'gf-general',
    authorName: 'Sana Khan',
    authorAvatar: '👩‍🔬',
    authorRole: 'Student',
    timestamp: '09:00 AM',
    content: 'Welcome to the quiet study lounge! My goal for today: 3 full Pomodoros on CSS architecture and 1 practice assessment.',
    reactions: { '🌱': 6, '☕': 5 }
  },
  {
    id: 'msg-gf-room-1',
    communityId: 'comm-general-study',
    channelId: 'gf-room-25',
    authorName: 'Sana Khan',
    authorAvatar: '👩‍🔬',
    authorRole: 'Student',
    timestamp: '09:15 AM',
    content: 'Pomodoro sprint #1 is active! 25 minutes of uninterrupted deep work. 5-minute break starts at :40.',
    reactions: { '⏱️': 7, '☕': 5 }
  },
  {
    id: 'msg-gf-res-1',
    communityId: 'comm-general-study',
    channelId: 'gf-resources',
    authorName: 'Marcus Chen',
    authorAvatar: '🧑‍🎓',
    authorRole: 'Mentor',
    timestamp: 'Yesterday',
    content: 'Evidence-based cognitive science study strategies: Active Recall, Feynman Technique, and Spaced Intervals:',
    resourceLink: {
      title: 'The Learning Scientists: Six Strategies for Effective Learning',
      url: 'https://www.learningscientists.org/'
    },
    reactions: { '📌': 10, '❤️': 7 }
  }
];

export const INITIAL_RESOURCES: StudyResource[] = [
  {
    id: 'res-1',
    title: 'MDN Web Docs: HTML5 Semantic Landmarks Guide',
    description: 'Clear reference explaining <header>, <nav>, <main>, <article>, and accessible ARIA attributes.',
    url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics',
    category: 'Web Development',
    skillId: 'html-structure',
    difficulty: 'beginner',
    sharedBy: 'David Kim',
    sharedAt: '2 days ago',
    likes: 24,
    isSaved: true
  },
  {
    id: 'res-2',
    title: 'Visual CSS Box Model & Margin Collapse Illustrated',
    description: 'Interactive explanations of padding, borders, content boxes, and margin collapse edge cases.',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model',
    category: 'CSS',
    skillId: 'css-fundamentals',
    difficulty: 'beginner',
    sharedBy: 'Marcus Chen',
    sharedAt: '3 days ago',
    likes: 31,
    isSaved: false
  },
  {
    id: 'res-3',
    title: 'Modern JavaScript Event Loop and DOM Mutation Cheatsheet',
    description: 'Master microtasks, macrotasks, and safe DOM selection without memory leaks or race conditions.',
    url: 'https://javascript.info/event-loop',
    category: 'JavaScript',
    skillId: 'dom-manipulation',
    difficulty: 'intermediate',
    sharedBy: 'Ananya Sharma',
    sharedAt: 'Yesterday',
    likes: 18,
    isSaved: true
  },
  {
    id: 'res-4',
    title: 'CSS Grid Garden — Interactive Alignment Game',
    description: 'A fun gamified practice site for mastering grid-column, grid-row, and template areas.',
    url: 'https://cssgridgarden.com/',
    category: 'Web Development',
    skillId: 'responsive-design',
    difficulty: 'intermediate',
    sharedBy: 'Aarav Mehta',
    sharedAt: '4 days ago',
    likes: 42,
    isSaved: true
  }
];

export const INITIAL_FLASHCARDS: FlashcardDeck[] = [
  {
    id: 'deck-html-core',
    title: 'HTML5 Essentials & Semantics',
    description: 'Key concepts: elements, document head, form controls, and accessibility attributes.',
    subject: 'Web Development',
    skillId: 'html-structure',
    createdAt: '2026-10-20',
    cards: [
      { id: 'fc-1', front: 'What is the purpose of the <main> element in HTML5?', back: 'Specifies the dominant and unique content of the <body>. There should only be one non-hidden <main> per document.', known: true },
      { id: 'fc-2', front: 'How do you correctly link a <label> with an <input>?', back: 'Match the label\'s "for" attribute (or htmlFor in React) with the input\'s "id" attribute.', known: false },
      { id: 'fc-3', front: 'Which attribute ensures an input must not be submitted empty?', back: 'The `required` boolean attribute.', known: true },
      { id: 'fc-4', front: 'What is the role of the <aside> tag?', back: 'Represents content indirectly related to the main content, such as sidebars, callouts, or advertising.', known: false }
    ]
  },
  {
    id: 'deck-css-fundamentals',
    title: 'CSS Box Model & Specificity',
    description: 'Master margins, borders, padding, units, and cascading priority.',
    subject: 'CSS',
    skillId: 'css-fundamentals',
    createdAt: '2026-10-22',
    cards: [
      { id: 'fc-5', front: 'What layers make up the standard CSS Box Model from inside out?', back: 'Content → Padding → Border → Margin.', known: true },
      { id: 'fc-6', front: 'What is the difference between `rem` and `em` units?', back: '`rem` is relative to the root (html) font size, whereas `em` is relative to the current element\'s inherited font size.', known: false },
      { id: 'fc-7', front: 'Which has higher specificity: an ID selector or 5 class selectors?', back: 'An ID selector (1,0,0) is always more specific than any number of class selectors (0,5,0).', known: true }
    ]
  },
  {
    id: 'deck-responsive-design',
    title: 'Flexbox & CSS Grid Alignment',
    description: 'Master axes, auto-fit, minmax, fractional units, and responsive layouts.',
    subject: 'CSS',
    skillId: 'responsive-design',
    createdAt: '2026-10-24',
    cards: [
      { id: 'fc-8', front: 'In Flexbox, what does justify-content vs align-items control?', back: '`justify-content` aligns along the main axis, while `align-items` aligns along the cross axis.', known: true },
      { id: 'fc-9', front: 'How do you create an auto-wrapping responsive grid without media queries?', back: 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));', known: true },
      { id: 'fc-10', front: 'What does the `gap` property do in Flexbox and Grid?', back: 'Sets gutter spacing between adjacent rows and columns without adding margin to outer edges.', known: false }
    ]
  },
  {
    id: 'deck-dom-events',
    title: 'DOM Manipulation & Event Architecture',
    description: 'Event delegation, DOM selection, bubbling, and dynamic mutations.',
    subject: 'JavaScript',
    skillId: 'dom-manipulation',
    createdAt: '2026-10-25',
    cards: [
      { id: 'fc-11', front: 'What is Event Delegation and why is it preferred?', back: 'Attaching a single event listener to a common ancestor element to handle events on dynamic child elements via event.target, saving memory.', known: true },
      { id: 'fc-12', front: 'Why call event.preventDefault() on form submit handlers?', back: 'Prevents the native browser submission and full-page reload, allowing async JavaScript processing.', known: true },
      { id: 'fc-13', front: 'What is the key difference between element.textContent and element.innerHTML?', back: '`textContent` inserts raw text and escapes markup (safe from XSS). `innerHTML` parses markup into DOM nodes.', known: false }
    ]
  }
];

export const INITIAL_QUIZZES: CustomQuiz[] = [
  {
    id: 'quiz-js-basics',
    title: 'JavaScript Core Principles Quiz',
    description: 'Test your understanding of primitives, truthy/falsy values, and scope.',
    subject: 'JavaScript',
    skillId: 'js-fundamentals',
    createdAt: '2026-10-21',
    bestScore: 80,
    questions: [
      {
        id: 'qz-1',
        text: 'Which of the following values evaluates to `false` in a boolean context?',
        options: ['"0"', '[]', '0', '{}'],
        correctOptionIndex: 2,
        explanation: 'In JavaScript, the number 0 is falsy, whereas non-empty strings, empty arrays [], and objects {} are all truthy.'
      },
      {
        id: 'qz-2',
        text: 'What keyword declares a block-scoped variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'static'],
        correctOptionIndex: 2,
        explanation: '`const` declares a block-scoped variable with an immutable binding that cannot be reassigned.'
      },
      {
        id: 'qz-3',
        text: 'Which array method creates a new array populated with the results of calling a provided function on every element?',
        options: ['forEach()', 'map()', 'filter()', 'reduce()'],
        correctOptionIndex: 1,
        explanation: 'Array.prototype.map() returns a new transformed array without mutating the source array.'
      }
    ]
  },
  {
    id: 'quiz-css-layout',
    title: 'Flexbox & CSS Grid Layout Mastery',
    description: 'Evaluate your ability to solve layout challenges with modern CSS.',
    subject: 'CSS',
    skillId: 'responsive-design',
    createdAt: '2026-10-23',
    bestScore: 75,
    questions: [
      {
        id: 'qz-4',
        text: 'Which Flexbox property centers child items along the cross axis?',
        options: ['justify-content: center', 'align-items: center', 'flex-direction: center', 'align-content: stretch'],
        correctOptionIndex: 1,
        explanation: '`align-items` dictates alignment along the cross axis in a flex container.'
      },
      {
        id: 'qz-5',
        text: 'In CSS Grid, what unit represents a fraction of the available space in the grid container?',
        options: ['em', 'vh', 'fr', 'ch'],
        correctOptionIndex: 2,
        explanation: 'The `fr` unit represents a fraction of the remaining free space inside a CSS grid track.'
      }
    ]
  },
  {
    id: 'quiz-html-forms',
    title: 'Accessible HTML Forms & Semantics',
    description: 'Assess input labeling, validation, and accessibility landmarks.',
    subject: 'HTML',
    skillId: 'html-forms',
    createdAt: '2026-10-22',
    bestScore: 100,
    questions: [
      {
        id: 'qz-6',
        text: 'Which attribute binds a <label> to a form <input>?',
        options: ['name', 'for', 'target', 'bind'],
        correctOptionIndex: 1,
        explanation: 'The `for` attribute on a label links directly to the `id` of the matching form input.'
      },
      {
        id: 'qz-7',
        text: 'Which landmark element should enclose the main content unique to a single document?',
        options: ['<section>', '<article>', '<main>', '<content>'],
        correctOptionIndex: 2,
        explanation: 'The `<main>` element represents the dominant, unique content of the body.'
      }
    ]
  }
];

export const INITIAL_TEACHERS: TeacherProfile[] = [
  {
    id: 'teacher-david',
    name: 'David Kim',
    avatar: '👨‍🏫',
    title: 'Senior Frontend Architect & Web Standards Educator',
    subjectExpertise: ['HTML', 'CSS', 'JavaScript'],
    topics: ['Semantic Accessibility', 'CSS Grid & Modern Layouts', 'Clean Vanilla JS', 'Web Performance'],
    matchingSkillIds: ['html-structure', 'html-forms', 'css-fundamentals', 'responsive-design'],
    qualifications: '10+ yrs industry experience • W3C Invited Contributor • M.S. Computer Science',
    bio: 'Passionate about teaching students the fundamental building blocks of the web from first principles so they build robust, accessible user experiences.',
    hourlyRate: 'Free Demo Guidance',
    isVerifiedDemo: true,
    verificationStatus: 'verified_demo',
    rating: 4.9,
    reviewsCount: 48,
    studentCount: 180,
    availability: 'Mon, Wed, Fri (Afternoons)'
  },
  {
    id: 'teacher-elena',
    name: 'Elena Rostova',
    avatar: '👩‍🏫',
    title: 'Interactive Design Lead & CSS Specialist',
    subjectExpertise: ['CSS'],
    topics: ['CSS Specificity', 'Responsive Typography', 'Micro-interactions', 'Design Systems'],
    matchingSkillIds: ['css-fundamentals', 'responsive-design'],
    qualifications: 'Former Staff UI Designer • Certified Accessibility Specialist (CPACC)',
    bio: 'Helping learners overcome CSS layout frustrations with systematic visual debugging techniques and modern CSS specification practices.',
    hourlyRate: 'Free Demo Guidance',
    isVerifiedDemo: true,
    verificationStatus: 'verified_demo',
    rating: 4.8,
    reviewsCount: 36,
    studentCount: 145,
    availability: 'Tue, Thu, Sat (Evenings)'
  },
  {
    id: 'teacher-marcus',
    name: 'Marcus Chen',
    avatar: '🧑‍🏫',
    title: 'Fullstack Engineer & Algorithms Instructor',
    subjectExpertise: ['JavaScript'],
    topics: ['DOM Manipulation', 'Event Propagation', 'Asynchronous JS', 'Problem Solving'],
    matchingSkillIds: ['js-fundamentals', 'dom-manipulation'],
    qualifications: 'Senior Software Engineer • Open Source Maintainer • B.S. Software Engineering',
    bio: 'Specializes in bridging the gap between theory and practical DOM interaction. Mentored 300+ university students in core programming.',
    hourlyRate: 'Free Demo Guidance',
    isVerifiedDemo: true,
    verificationStatus: 'verified_demo',
    rating: 4.95,
    reviewsCount: 62,
    studentCount: 220,
    availability: 'Daily (Flexible Schedule)'
  },
  {
    id: 'teacher-priya',
    name: 'Priya Sundaram',
    avatar: '👩‍💼',
    title: 'Fullstack Mentor & Placement Coach',
    subjectExpertise: ['HTML', 'JavaScript'],
    topics: ['Form Validation', 'REST Integrations', 'Technical Interviews', 'Code Reviews'],
    matchingSkillIds: ['html-forms', 'js-fundamentals', 'dom-manipulation'],
    qualifications: 'Tech Lead • 7 years experience • Published Technical Author',
    bio: 'Focused on helping students master diagnostic skill gaps and prepare portfolio-ready code for technical reviews.',
    hourlyRate: 'Free Demo Guidance',
    isVerifiedDemo: false,
    verificationStatus: 'pending_review',
    rating: 4.7,
    reviewsCount: 19,
    studentCount: 85,
    availability: 'Weekends'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-step',
    title: 'First Step',
    description: 'Joined your first study community in SkillForge.',
    icon: '🌱',
    category: 'community',
    unlockedAt: '2026-10-25'
  },
  {
    id: 'badge-diagnostic-ready',
    title: 'Diagnostic Evaluated',
    description: 'Completed your first diagnostic competency assessment.',
    icon: '🎯',
    category: 'assessment'
  },
  {
    id: 'badge-streak-3',
    title: 'Consistent Learner',
    description: 'Maintained a 3-day active study streak.',
    icon: '🔥',
    category: 'streak',
    unlockedAt: '2026-10-27'
  },
  {
    id: 'badge-card-flipper',
    title: 'Flashcard Enthusiast',
    description: 'Reviewed at least 10 flashcards in your study toolkit.',
    icon: '🃏',
    category: 'tools'
  },
  {
    id: 'badge-pomodoro-focus',
    title: 'Deep Worker',
    description: 'Completed a full Pomodoro study session without interruptions.',
    icon: '⏱️',
    category: 'tools'
  },
  {
    id: 'badge-roadmap-pioneer',
    title: 'Roadmap Pioneer',
    description: 'Completed 3 prerequisite roadmap activities.',
    icon: '🗺️',
    category: 'mastery'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: 'user-ananya', name: 'Ananya Sharma', avatar: '👩‍💻', xp: 1420, level: 7, streakDays: 14, badgeCount: 5, primarySubject: 'Web Development' },
  { rank: 2, id: 'user-rohan', name: 'Rohan Patel', avatar: '👨‍💻', xp: 1250, level: 6, streakDays: 9, badgeCount: 4, primarySubject: 'JavaScript' },
  { rank: 3, id: 'user-current', name: 'You (Student)', avatar: '🎓', xp: 850, level: 4, streakDays: 3, isCurrentUser: true, badgeCount: 2, primarySubject: 'Web Competency' },
  { rank: 4, id: 'user-sana', name: 'Sana Khan', avatar: '👩‍🔬', xp: 740, level: 4, streakDays: 5, badgeCount: 3, primarySubject: 'CSS Design' },
  { rank: 5, id: 'user-aarav', name: 'Aarav Mehta', avatar: '🧑‍💻', xp: 620, level: 3, streakDays: 2, badgeCount: 2, primarySubject: 'HTML & Accessibility' }
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Alex Rivera',
  handle: '@alex_rivera',
  avatar: '🎓',
  bio: 'Second-year software engineering student preparing for frontend internships and building core web competencies.',
  primaryGoal: 'Master fullstack HTML/CSS/JS and build production portfolio projects',
  interests: ['Frontend Engineering', 'Accessibility', 'CSS Architecture', 'Algorithm Challenges'],
  targetExamOrRole: 'Frontend Developer Internship 2027'
};

export const INITIAL_PEER_PROFILES: StudyBuddyProfile[] = [
  {
    id: 'peer-ananya',
    name: 'Ananya Sharma',
    handle: '@ananya_dev',
    avatar: '👩‍💻',
    level: 7,
    xp: 1420,
    streakDays: 14,
    primarySubject: 'Web Development',
    learningGoal: 'Build a responsive fullstack web application and master DOM event systems',
    targetGoalCategory: 'Frontend Developer',
    subjects: ['HTML', 'CSS', 'JavaScript'],
    interests: ['CSS Grid', 'DOM Events', 'Web Performance', 'React Architecture'],
    bio: 'Passionate about semantic web standards and building high-performance frontend interfaces. Looking for a study buddy to review DOM code and do weekly timed mock projects!',
    availability: 'Mon, Wed, Fri • 6:00 PM - 8:30 PM (EST)',
    studyMode: 'Pair Coding',
    status: 'studying',
    complementarySkills: ['html-structure', 'css-fundamentals', 'responsive-design'],
    weakSkills: ['dom-manipulation', 'js-fundamentals'],
    matchedCommunities: [
      { id: 'comm-web-dev', name: 'Web Dev Forge', icon: '⚡', channelId: 'wd-doubts' },
      { id: 'comm-general-study', name: 'Quiet Focus & Deep Work', icon: '☕', channelId: 'gf-room-25' }
    ]
  },
  {
    id: 'peer-rohan',
    name: 'Rohan Patel',
    handle: '@rohan_js',
    avatar: '👨‍💻',
    level: 6,
    xp: 1250,
    streakDays: 9,
    primarySubject: 'JavaScript',
    learningGoal: 'Master asynchronous JavaScript, DOM manipulation, and state management',
    targetGoalCategory: 'Frontend Developer',
    subjects: ['JavaScript', 'HTML'],
    interests: ['JavaScript Primitives', 'Event Delegation', 'API Integration', 'Algorithms'],
    bio: 'CS sophomore working through frontend web architecture. Strong at core JavaScript logic and looking for partners to practice CSS layouts and UI design.',
    availability: 'Daily • Evenings 7:00 PM - 9:00 PM',
    studyMode: 'Doubt Clearing',
    status: 'online',
    complementarySkills: ['js-fundamentals', 'dom-manipulation'],
    weakSkills: ['responsive-design', 'css-fundamentals'],
    matchedCommunities: [
      { id: 'comm-web-dev', name: 'Web Dev Forge', icon: '⚡', channelId: 'wd-projects' },
      { id: 'comm-programming', name: 'Algorithms & Core CS', icon: '💻', channelId: 'cs-general' }
    ]
  },
  {
    id: 'peer-sana',
    name: 'Sana Khan',
    handle: '@sana_ui',
    avatar: '👩‍🔬',
    level: 4,
    xp: 740,
    streakDays: 5,
    primarySubject: 'CSS',
    learningGoal: 'Master fluid CSS layout engines: Flexbox, CSS Grid, and responsive typography',
    targetGoalCategory: 'Accessible UI Engineering',
    subjects: ['CSS', 'HTML'],
    interests: ['CSS Box Model', 'Flexbox Alignment', 'Grid Template Areas', 'Design Tokens'],
    bio: 'Design technologist bridging Figma and pure CSS. Love talking specificity, box-sizing, and accessible UI layout. Let\'s do Pomodoro sprints together!',
    availability: 'Tue, Thu, Sat • 4:00 PM - 6:00 PM',
    studyMode: 'Pomodoro Co-study',
    status: 'online',
    complementarySkills: ['css-fundamentals', 'html-structure', 'responsive-design'],
    weakSkills: ['js-fundamentals', 'dom-manipulation'],
    matchedCommunities: [
      { id: 'comm-web-dev', name: 'Web Dev Forge', icon: '⚡', channelId: 'wd-resources' },
      { id: 'comm-general-study', name: 'Quiet Focus & Deep Work', icon: '☕', channelId: 'gf-room-25' }
    ]
  },
  {
    id: 'peer-aarav',
    name: 'Aarav Mehta',
    handle: '@aarav_m',
    avatar: '🧑‍💻',
    level: 3,
    xp: 620,
    streakDays: 2,
    primarySubject: 'HTML',
    learningGoal: 'Build 100% accessible forms and semantic web landmark foundations',
    targetGoalCategory: 'Accessible UI Engineering',
    subjects: ['HTML', 'CSS'],
    interests: ['Semantic HTML', 'WCAG 2.1', 'Form Validation', 'Keyboard Navigation'],
    bio: 'Deepening knowledge in web accessibility landmarks (<main>, <nav>, <article>) and native form validations. Seeking peers preparing for frontend portfolio reviews.',
    availability: 'Weekends • 10:00 AM - 1:00 PM',
    studyMode: 'Flashcards & Quizzes',
    status: 'offline',
    complementarySkills: ['html-structure', 'html-forms'],
    weakSkills: ['css-fundamentals', 'responsive-design'],
    matchedCommunities: [
      { id: 'comm-web-dev', name: 'Web Dev Forge', icon: '⚡', channelId: 'wd-general' },
      { id: 'comm-college', name: 'University Engineering Hub', icon: '🏛️', channelId: 'col-doubts' }
    ]
  },
  {
    id: 'peer-sara',
    name: 'Sara Lindqvist',
    handle: '@sara_code',
    avatar: '👩‍💻',
    level: 5,
    xp: 980,
    streakDays: 7,
    primarySubject: 'Programming',
    learningGoal: 'Strengthen core algorithmic problem solving and clean JavaScript methods',
    targetGoalCategory: 'Fullstack Web Mastery',
    subjects: ['JavaScript', 'Programming'],
    interests: ['Array Manipulation', 'Two Pointers', 'Recursion', 'Clean Code'],
    bio: 'Love tackling tricky algorithmic problems and breaking down step-by-step logic. Excited to pair up with fellow coders for daily challenge breakdowns.',
    availability: 'Mon to Thu • 8:00 AM - 10:00 AM',
    studyMode: 'Pair Coding',
    status: 'online',
    complementarySkills: ['js-fundamentals'],
    weakSkills: ['dom-manipulation', 'html-forms'],
    matchedCommunities: [
      { id: 'comm-programming', name: 'Algorithms & Core CS', icon: '💻', channelId: 'cs-general' },
      { id: 'comm-general-study', name: 'Quiet Focus & Deep Work', icon: '☕', channelId: 'gf-room-25' }
    ]
  },
  {
    id: 'peer-leo',
    name: 'Leo Tanaka',
    handle: '@leo_t',
    avatar: '🧑‍🎓',
    level: 5,
    xp: 1050,
    streakDays: 8,
    primarySubject: 'Web Development',
    learningGoal: 'Complete portfolio website with dynamic dark mode and interactive projects',
    targetGoalCategory: 'Frontend Developer',
    subjects: ['HTML', 'CSS', 'JavaScript'],
    interests: ['CSS Variables', 'LocalStorage', 'DOM Events', 'Responsive Breakpoints'],
    bio: 'Building complete frontend projects from scratch. Looking for a study buddy to keep each other accountable on daily roadmap milestones!',
    availability: 'Daily • 5:00 PM - 7:00 PM',
    studyMode: 'Pomodoro Co-study',
    status: 'studying',
    complementarySkills: ['html-structure', 'css-fundamentals'],
    weakSkills: ['dom-manipulation', 'responsive-design'],
    matchedCommunities: [
      { id: 'comm-web-dev', name: 'Web Dev Forge', icon: '⚡', channelId: 'wd-room' },
      { id: 'comm-general-study', name: 'Quiet Focus & Deep Work', icon: '☕', channelId: 'gf-room-25' }
    ]
  }
];
