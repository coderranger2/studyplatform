import type {
  Badge,
  Community,
  CustomQuiz,
  FlashcardDeck,
  LeaderboardEntry,
  ChatMessage,
  StudentProfile,
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
    id: 'msg-7',
    communityId: 'comm-programming',
    channelId: 'cs-general',
    authorName: 'Sara Lindqvist',
    authorAvatar: '👩‍💻',
    authorRole: 'Student',
    timestamp: '08:15 AM',
    content: 'Finally solved the two-pointer problem with O(n) time complexity without extra space! Slow and steady progress.',
    reactions: { '🎉': 5 }
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
