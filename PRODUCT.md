# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are STEM and computer science students preparing for technical roles, engineering midterms, and placement exams. They are balancing coursework with rigorous self-directed skill acquisition, often struggling with fragmented study resources, isolation, and lack of structured feedback on knowledge gaps.

## Product Purpose

SkillForge is a collaborative social study platform that replaces passive video consumption with deterministic competency benchmarking and peer learning. It helps learners diagnose foundational deficiencies, follow dependency-sequenced roadmaps, and collaborate with accountability partners in shared study servers. Success means a student can verify skill proficiency with objective assessment, remediate gaps with peers, and maintain consistent daily focus sprints.

## Positioning

Unlike traditional LMS platforms (which focus on passive linear video progression) or standalone study apps (which isolate the student), SkillForge pairs deterministic diagnostic gap analysis with complementary peer study-buddy matching. A student with active gaps in a subject (e.g., CSS layout or DOM manipulation) is directly matched with peers who have proven proficiency in those exact competencies for reciprocal pair study.

## Operating Context

- **Study Environments:** Desktop browsers during extended, focused laptop study sessions in dorms, university libraries, or home desks.
- **Workflow Rhythms:** Iterative cycles of baseline diagnostic evaluation -> targeted flashcard drills / PDF resource summarization -> 25-minute Pomodoro sprints -> peer discussion and doubt resolution in workspace channels.
- **Artifacts:** Course syllabi, technical documentation (e.g., MDN Web Docs), practice problem sets, PDF lecture notes, and diagnostic test reports.

## Capabilities and Constraints

- **Single Page Architecture:** Client-side React 19 SPA running on Vite with TypeScript and React Router v7.
- **Local-First with Hybrid Extension Points:** State (assessments, attempts, channel chats, flashcards, custom decks, focus sessions, user profiles, and XP deduplication) persists in `localStorage` with clear data abstraction layers in `storage.ts` designed with extension points for future backend authentication and WebSocket synchronization.
- **Study Toolkit:** Extractive PDF line-aware summarizer powered by `pdfjs-dist`, interactive flashcards with mastery tracking, and custom quiz builder.
- **Gamification & Social Engine:** Deduplicated XP rewards, level tiers, unlockable achievement badges, daily focus streaks, cohort leaderboard, quoted chat replies, live emoji reactions, and Discord-style study workspace channels.

## Brand Commitments

- **Name:** SkillForge
- **Tone & Voice:** Purposeful, encouraging, clear, and focused on genuine mastery over superficial engagement. Free of condescending fluff or distraction.
- **Visual & UI Personality:** High-contrast, clean academic/engineering aesthetic. Sharp typography, purposeful iconography, unambiguous status indicators, and distraction-free dark/light surface support.

## Evidence on Hand

- Fully operational diagnostic evaluation engine with 12 foundational questions across HTML structure, semantic elements, CSS layout/Grid, and JavaScript DOM manipulation in `study-platform/src/data/questions.ts`.
- Structured prerequisite dependency tree across 7 core skills in `study-platform/src/data/skills.ts`.
- Curated curriculum goal definitions in `study-platform/src/data/goals.ts`.
- 5 comprehensive mock study communities with channel hierarchies and co-studier profiles in `study-platform/src/data/socialData.ts`.
- 30 passed unit tests verifying local storage persistence, scoring, gap analysis, and deduplicated XP in `study-platform/src/engine/`.

## Product Principles

1. **Deterministic Competency Over Estimates:** Progression and gap detection are calculated objectively from verified assessment responses and prerequisite chains, not self-reported confidence.
2. **Actionable Peer Remediation:** Identifying a gap is only useful if immediate resolution is offered—every detected gap links directly to remediation tools and complementary study buddies.
3. **Respect Focus and Cognitive Load:** Social features (chat, channels, rooms) exist to support deep work, not to create noisy engagement loops. Quiet focus and clean organization take priority.
4. **Local-First Reliability:** The platform must work seamlessly offline or with zero backend friction, ensuring students never lose study notes, flashcards, or progress.

## Accessibility & Inclusion

- Semantic HTML document outlines with full keyboard navigation across modals, tab bars, chat inputs, and timer controls.
- High-contrast text and interactive states meeting WCAG AA standards.
- Reduced-motion-friendly transitions for timers and notification toasts.

