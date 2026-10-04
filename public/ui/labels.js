// Central Labels Registry (owner decisions ui.naming.levels.v1, ui.naming.sections.v1, ui.notes.naming.v1,
// ui.naming.unit-check.checkpoint.v2, ui.naming.groups.v1)
// Single source of truth for all learner-facing names and navigation labels.

export const LABELS = Object.freeze({
  shelf: 'Shelf',
  learningPath: 'Learning Path',
  module: 'Module',
  unit: 'Unit',
  lesson: 'Lesson',
  capstone: 'Capstone',
  unitCheck: 'Checkpoint',
  studyTopics: 'Study Topics',
  reviewPractice: 'Review & Practice',
  myNotes: 'My Notes',
  bible: 'Bible',
  theologian: 'Theologian',
  feedback: 'Feedback',
  profile: 'Profile'
});

// Shelf group names (owner decision ui.naming.groups.v1). Keys are the stable group IDs.
export const GROUP_NAMES = Object.freeze({
  law: 'Law',
  othist: 'History',
  wisdom: 'Wisdom and Poetry',
  major: 'Major Prophets',
  minor: 'Minor Prophets',
  gospel: 'Gospels and Acts',
  paul: 'Paul’s Letters',
  general: 'General Letters',
  apoc: 'Revelation'
});

export const NAV_LABELS = Object.freeze({
  shelf: 'SHELF',
  learningPath: 'LEARNING PATH',
  bible: 'BIBLE',
  studyTopics: 'STUDY TOPICS',
  reviewPractice: 'REVIEW & PRACTICE'
});

export const SHELF = LABELS.shelf;
export const LEARNING_PATH = LABELS.learningPath;
export const MODULE = LABELS.module;
export const UNIT = LABELS.unit;
export const LESSON = LABELS.lesson;
export const CAPSTONE = LABELS.capstone;
export const UNIT_CHECK = LABELS.unitCheck;
export const STUDY_TOPICS = LABELS.studyTopics;
export const REVIEW_PRACTICE = LABELS.reviewPractice;
export const MY_NOTES = LABELS.myNotes;
export const BIBLE = LABELS.bible;

export const ROUTE_ALIASES = Object.freeze({
  '/path': '/course',
  '/study-topics': '/topics',
  '/review': '/practice'
});

export const NAV_ITEMS = Object.freeze([
  {
    id: 'shelf',
    label: LABELS.shelf,
    navLabel: NAV_LABELS.shelf,
    phoneLabel: 'Shelf',
    route: 'home',
    path: '/home',
    icon: '<svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"></path><rect x="4" y="6" width="3.5" height="14"></rect><rect x="8.5" y="4" width="3.5" height="16"></rect><path d="m14 7.5 3.4-.9 3.1 13.4-3.4.8z"></path></svg>'
  },
  {
    id: 'learning-path',
    label: LABELS.learningPath,
    navLabel: NAV_LABELS.learningPath,
    phoneLabel: 'Path',
    route: 'course',
    path: '/path',
    icon: '<svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="6" r="2"></circle><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"></path></svg>'
  },
  {
    id: 'bible',
    label: LABELS.bible,
    navLabel: NAV_LABELS.bible,
    phoneLabel: 'Bible',
    route: 'bible',
    path: '/bible',
    icon: '<svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"></path><path d="M12 6.5v13"></path></svg>'
  },
  {
    id: 'study-topics',
    label: LABELS.studyTopics,
    navLabel: NAV_LABELS.studyTopics,
    phoneLabel: 'Topics',
    route: 'topics',
    path: '/topics',
    icon: '<svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h7l9 9-7 7-9-9z"></path><circle cx="8.5" cy="8.5" r="1.5"></circle></svg>'
  },
  {
    id: 'review-practice',
    label: LABELS.reviewPractice,
    navLabel: NAV_LABELS.reviewPractice,
    phoneLabel: 'Review',
    route: 'practice',
    path: '/practice',
    icon: '<svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v4.5h-4.5"></path><path d="m8.5 12 2.5 2.5 4.5-5"></path></svg>'
  }
]);
