// Component Lab Harness (The Canonical Shelf)
// Showcases every shared UI component in Reading Room light and dark modes.

import {
  renderRail,
  renderPanel,
  renderEdgeTab,
  mountEdgeTab,
  renderScriptureBlock,
  renderScriptureHeader,
  renderScriptureRef,
  mountScriptureRef,
  renderGroupChip,
  BIBLE_GROUPS,
  renderProgressBar,
  renderProgressScope,
  renderProgressScopeGroup,
  renderStepList,
  renderStepStrip,
  renderVersePassage,
  renderVerseActions,
  renderFootnoteBadge,
  renderFootnoteCard,
  renderNotesPanel,
  renderLessonWindow,
  renderBookshelf,
  renderGameTile
} from './components/index.js';
import { mountProgressBars } from './components/progress-bar.js';
import { mountBookshelf } from './components/bookshelf.js';

const main = document.querySelector('#lab-main');

// Icons for components
const ICONS = {
  context: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>`,
  crossref: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>`,
  highlight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 15-4 4M15 5l4 4-8 8-4-4z"/></svg>`,
  people: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.9-3 3-4.6 5.5-4.6s4.6 1.6 5.5 4.6"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.6c1.3.6 2.2 1.9 2.6 4.4"/></svg>`,
  flashcards: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h5"/></svg>`
};

function renderComponentSection({ id, title, description, contentHtml }) {
  return `
  <section id="${id}" class="lab-section">
    <div class="lab-section-header">
      <h2 class="lab-section-title">${title}</h2>
      <p class="lab-section-desc">${description}</p>
    </div>
    <div class="lab-showcase">
      ${contentHtml}
    </div>
  </section>`;
}

function buildShowcase() {
  // 1. Rail
  const railItems = [
    { label: 'Context', href: '#rail', icon: ICONS.context },
    { label: 'Cross-references', href: '#rail', icon: ICONS.crossref, count: 3, isActive: true },
    { label: 'Highlights', href: '#rail', icon: ICONS.highlight, count: 1 },
    { label: 'People', href: '#rail', icon: ICONS.people }
  ];
  const railDesktop = renderRail({
    title: 'For Genesis 1:2',
    ariaLabel: 'Study tools',
    items: railItems,
    className: 'lab-rail-preview'
  });

  const railHtml = `
    <div class="lab-card">
      <h3 class="lab-card-title">Side Rail (Desktop)</h3>
      <div class="lab-card-preview">${railDesktop}</div>
    </div>
    <div class="lab-card">
      <h3 class="lab-card-title">Sectioned Rail</h3>
      <div class="lab-card-preview">
        ${renderRail({
          sections: [
            { title: 'For Genesis 1:2', items: railItems.slice(0, 2) },
            { title: 'For the book', items: [
              { label: 'Book overview', href: '#rail', icon: ICONS.context },
              { label: 'Themes', href: '#rail', icon: ICONS.highlight }
            ]}
          ]
        })}
      </div>
    </div>`;

  // 2. Panel
  const panelHtml = `
    <div class="lab-card">
      <h3 class="lab-card-title">Raised Surface Panel (Card Shadow)</h3>
      <div class="lab-card-preview">
        ${renderPanel({
          variant: 'raised',
          eyebrow: 'Study Tools',
          title: 'Cross-references for Genesis 1:2',
          body: '<p style="margin:0; font-size:14px; color:var(--color-text-secondary);">3 cross-references connect this verse to Jeremiah, Isaiah, and Psalms.</p>',
          footer: '<button type="button" class="lab-btn is-active">View All</button>'
        })}
      </div>
    </div>
    <div class="lab-card">
      <h3 class="lab-card-title">Frame Surface Panel (Frame Shadow)</h3>
      <div class="lab-card-preview">
        ${renderPanel({
          variant: 'frame',
          title: 'Passage Explorer',
          body: '<p style="margin:0; font-size:15px; font-family:var(--font-reading);">In the beginning God created the heavens and the earth.</p>'
        })}
      </div>
    </div>`;

  // 3. EdgeTab
  const edgeTabHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Fixed Vertical Edge Tabs (Theologian &amp; My Notes)</h3>
      <div class="lab-card-preview">
        <p style="margin:0 0 12px; font-size:14px; color:var(--color-text-secondary);">
          EdgeTabs dock vertically on the right edge using <code>var(--color-edge-theologian)</code> (#1B2338 light / #252E45 dark) and <code>var(--color-edge-notes)</code> (#7A3A52 light / #9B4D68 dark).
        </p>
        <div class="lab-edge-tab-stage">
          ${renderEdgeTab({ type: 'notes', label: 'My Notes', id: 'lab-edge-notes', className: 'lab-stage-tab' })}
          ${renderEdgeTab({ type: 'theologian', label: 'Theologian', id: 'lab-edge-theo', className: 'lab-stage-tab' })}
          <div style="padding: 24px; max-width: 400px;">
            <p style="font-size: 14px; color: var(--color-text-muted);">Content area with vertical tabs docked at the right border.</p>
          </div>
        </div>
      </div>
    </div>`;

  // 4. ScriptureBlock
  const scriptureBlockHtml = `
    <div class="lab-card">
      <h3 class="lab-card-title">Scripture Quote on scriptureBed (Gospels)</h3>
      <div class="lab-card-preview">
        ${renderScriptureBlock({
          quote: 'Then He told them, “These are the words I spoke to you while I was still with you: Everything must be fulfilled that is written about Me in the Law of Moses, the Prophets, and the Psalms.”',
          reference: 'Luke 24:44–45',
          group: 'gospel',
          contextHref: '/bible?book=LUK&chapter=24'
        })}
      </div>
    </div>
    <div class="lab-card">
      <h3 class="lab-card-title">Scripture Header Banner (Law)</h3>
      <div class="lab-card-preview">
        ${renderScriptureHeader({
          title: 'Genesis 1',
          group: 'law',
          groupLabel: 'Law',
          sub: 'Berean Standard Bible'
        })}
      </div>
    </div>`;

  // 5. ScriptureRef
  const scriptureRefHtml = `
    <div class="lab-card">
      <h3 class="lab-card-title">Cross-Reference (Major Prophets, Expanded)</h3>
      <div class="lab-card-preview">
        ${renderScriptureRef({
          reference: 'Jeremiah 4:23',
          group: 'major',
          text: 'I looked at the earth, and it was formless and void; I looked to the heavens, and they had no light.',
          isExpanded: true
        })}
      </div>
    </div>
    <div class="lab-card">
      <h3 class="lab-card-title">Cross-Reference (Wisdom, Collapsed)</h3>
      <div class="lab-card-preview">
        ${renderScriptureRef({
          reference: 'Psalm 104:30',
          group: 'wisdom',
          text: 'When You send Your Spirit, they are created, and You renew the face of the earth.',
          isExpanded: false
        })}
      </div>
    </div>`;

  // 6. GroupChip
  const chipsList = Object.keys(BIBLE_GROUPS).map(g => renderGroupChip({ group: g })).join(' ');
  const shortChipsList = Object.keys(BIBLE_GROUPS).map(g => renderGroupChip({ group: g, short: true })).join(' ');
  const groupChipHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">9 Canon Group Chips (8px Swatch + 6px Radius Chip)</h3>
      <div class="lab-card-preview" style="gap: 16px;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${chipsList}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${shortChipsList}
        </div>
      </div>
    </div>`;

  // 7. ProgressBar & ProgressScope
  const progressHtml = `
    <div class="lab-card">
      <h3 class="lab-card-title">Progress Bars (3px Radius)</h3>
      <div class="lab-card-preview" style="gap: 14px;">
        ${renderProgressBar({ value: 0, ariaLabel: '0 percent' })}
        ${renderProgressBar({ value: 35, ariaLabel: '35 percent' })}
        ${renderProgressBar({ value: 70, ariaLabel: '70 percent', variant: 'accent' })}
        ${renderProgressBar({ value: 100, ariaLabel: '100 percent', variant: 'correct' })}
      </div>
    </div>
    <div class="lab-card">
      <h3 class="lab-card-title">Labelled Progress Scopes (Unit, Module, Path)</h3>
      <div class="lab-card-preview">
        ${renderProgressScopeGroup({
          scopes: [
            { scope: 'unit', label: 'Unit 2', status: '0 of 5 lessons', value: 0, max: 5 },
            { scope: 'module', label: 'Module 1', status: '2 of 13 lessons', value: 2, max: 13 },
            { scope: 'path', label: 'Learning Path', status: 'Module 1 of 4', value: 1, max: 4 }
          ]
        })}
      </div>
    </div>`;

  // 8. StepStrip & StepList
  const stepsData = [
    { title: 'A library, not a book', isComplete: false, isActive: true },
    { title: 'The Old Testament shelves', isComplete: false, isActive: false },
    { title: 'The New Testament shelves', isComplete: false, isActive: false },
    { title: 'Labels, not boxes', isComplete: false, isActive: false },
    { title: 'What you now know', isComplete: false, isActive: false },
    { title: 'Reflect', isComplete: false, isActive: false }
  ];
  const stepsHtml = `
    <div class="lab-card">
      <h3 class="lab-card-title">Desktop Step List</h3>
      <div class="lab-card-preview">
        ${renderStepList({ steps: stepsData, currentStep: 1, totalSteps: 6 })}
      </div>
    </div>
    <div class="lab-card">
      <h3 class="lab-card-title">Phone Step Strip</h3>
      <div class="lab-card-preview">
        ${renderStepStrip({
          currentStep: 1,
          totalSteps: 6,
          currentPart: 1,
          totalParts: 2,
          stepTitle: 'A library, not a book'
        })}
      </div>
    </div>`;

  // 9. VerseText
  const versesData = [
    { verseNumber: 1, text: 'In the beginning God created the heavens and the earth.' },
    { verseNumber: 2, text: 'Now the earth was formless and void, and darkness was over the surface of the deep.', isSelected: true, hasNote: true, highlightColor: 'yellow' },
    { verseNumber: 3, text: 'And God said, “Let there be light,” and there was light.' }
  ];
  const verseTextHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Verse Text with Highlights &amp; Notes</h3>
      <div class="lab-card-preview">
        ${renderVersePassage({ verses: versesData })}
      </div>
    </div>`;

  // 10. VerseActions
  const verseActionsHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Verse Actions Floating Toolbar</h3>
      <div class="lab-card-preview" style="align-items: center; justify-content: center; min-height: 80px;">
        ${renderVerseActions({ verseReference: 'Genesis 1:2' })}
      </div>
    </div>`;

  // 11. Footnote
  const footnoteHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Footnote Badges &amp; Card</h3>
      <div class="lab-card-preview" style="gap: 16px;">
        <p style="margin: 0; font-family: var(--font-reading); font-size: 16px;">
          The Old Testament${renderFootnoteBadge({ marker: 'a', label: 'Old Testament glossary' })},
          Israel’s scriptures, and the New Testament${renderFootnoteBadge({ marker: 'b', label: 'New Testament glossary' })}.
        </p>
        ${renderFootnoteCard({ marker: 'a', text: 'Old Testament: The 39 books of Israel’s scriptures, written mostly in Hebrew.' })}
      </div>
    </div>`;

  // 12. NotesPanel
  const notesPanelHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">My Notes Panel</h3>
      <div class="lab-card-preview">
        ${renderNotesPanel({
          target: 'Genesis 1:2',
          notes: ['What does “the deep” mean here? Bring this up on Sunday.']
        })}
      </div>
    </div>`;

  // 13. LessonWindow
  const lessonWindowHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Lesson Window (Breadcrumb, Pacing, Buttons)</h3>
      <div class="lab-card-preview">
        <div style="height: 320px;">
          ${renderLessonWindow({
            breadcrumbs: [
              { label: 'Learning Path', href: '#path' },
              { label: 'Module 1: Hermeneutics & Canon', href: '#mod1' },
              { label: 'Unit 2: What the Bible Is', href: '#unit2' }
            ],
            currentTitle: 'Lesson 1',
            body: '<div style="padding: 24px; font-size: 16px;">Step content rendered here without scrolling.</div>',
            canGoBack: false,
            canContinue: true
          })}
        </div>
      </div>
    </div>`;

  // 14. Bookshelf
  const bookshelfSample = [
    {
      title: 'Law & History',
      countText: '17 books',
      books: [
        { name: 'Genesis', verses: 1533, group: 'law' },
        { name: 'Exodus', verses: 1213, group: 'law' },
        { name: 'Leviticus', verses: 859, group: 'law' },
        { name: 'Numbers', verses: 1288, group: 'law' },
        { name: 'Deuteronomy', verses: 959, group: 'law' },
        { name: 'Joshua', verses: 658, group: 'othist' },
        { name: 'Judges', verses: 618, group: 'othist' },
        { name: 'Ruth', verses: 85, group: 'othist', isLean: true }
      ]
    }
  ];
  const bookshelfHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Bookshelf Component</h3>
      <div class="lab-card-preview">
        ${renderBookshelf({ rows: bookshelfSample })}
      </div>
    </div>`;

  // 15. GameTile
  const gameTileHtml = `
    <div class="lab-card" style="grid-column: 1 / -1;">
      <h3 class="lab-card-title">Game Tile (Review &amp; Practice)</h3>
      <div class="lab-card-preview">
        ${renderGameTile({
          title: 'Speed Match',
          description: 'Match books of the Bible to their canonical groups against the clock.',
          badge: 'High Score: 850',
          icon: ICONS.flashcards
        })}
      </div>
    </div>`;

  main.innerHTML = [
    renderComponentSection({ id: 'rail', title: 'Rail & RailLink', description: 'Desktop side rail and phone drawer with expand/collapse states.', contentHtml: railHtml }),
    renderComponentSection({ id: 'panel', title: 'Panel', description: 'Surface container using var(--color-surface-raised) and var(--shadow-card) / var(--shadow-frame).', contentHtml: panelHtml }),
    renderComponentSection({ id: 'edge-tab', title: 'EdgeTab', description: 'Fixed vertical tabs for Theologian and My Notes.', contentHtml: edgeTabHtml }),
    renderComponentSection({ id: 'scripture-block', title: 'ScriptureBlock', description: 'Verse text container on scriptureBed, Literata font, group color bar (6px width, 22px height, 3px radius).', contentHtml: scriptureBlockHtml }),
    renderComponentSection({ id: 'scripture-ref', title: 'ScriptureRef', description: 'Address link with group bar and expandable verse text for cross-references & citations.', contentHtml: scriptureRefHtml }),
    renderComponentSection({ id: 'group-chip', title: 'GroupChip', description: '8px square color swatch + 6px radius chip for the 9 Bible groups.', contentHtml: groupChipHtml }),
    renderComponentSection({ id: 'progress', title: 'ProgressBar & ProgressScope', description: 'Labelled progress indicators (Unit, Module, Path) with 3px radius.', contentHtml: progressHtml }),
    renderComponentSection({ id: 'steps', title: 'StepStrip & StepList', description: 'Desktop step list and phone step strip for lesson pacing.', contentHtml: stepsHtml }),
    renderComponentSection({ id: 'verse-text', title: 'VerseText', description: 'Selectable verses, word-level highlights, and note markers.', contentHtml: verseTextHtml }),
    renderComponentSection({ id: 'verse-actions', title: 'VerseActions', description: 'Floating action toolbar for highlights, note creation, and copying.', contentHtml: verseActionsHtml }),
    renderComponentSection({ id: 'footnote', title: 'Footnote', description: 'Inline footnote badges and floating popover card.', contentHtml: footnoteHtml }),
    renderComponentSection({ id: 'notes-panel', title: 'NotesPanel', description: 'My Notes container with note list, editor textarea, and save button.', contentHtml: notesPanelHtml }),
    renderComponentSection({ id: 'lesson-window', title: 'LessonWindow', description: 'Breadcrumb title-bar, split pane, and lesson pacing controls.', contentHtml: lessonWindowHtml }),
    renderComponentSection({ id: 'bookshelf', title: 'Bookshelf', description: 'Canonical bookshelf with proportional books and group colors.', contentHtml: bookshelfHtml }),
    renderComponentSection({ id: 'game-tile', title: 'GameTile', description: 'Review & Practice activity tiles with icons and badge indicators.', contentHtml: gameTileHtml })
  ].join('');

  // Mount interactive handlers
  mountScriptureRef(main);
  mountProgressBars(main);
  mountBookshelf(main);
  mountEdgeTab(main);
}

// Mode toggle logic
function setMode(mode) {
  const buttons = document.querySelectorAll('[data-set-mode]');
  buttons.forEach(b => {
    const active = b.dataset.setMode === mode;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });

  if (mode === 'both') {
    document.documentElement.setAttribute('data-mode', 'light');
    main.classList.add('lab-dual-mode-active');
  } else {
    document.documentElement.setAttribute('data-mode', mode);
    main.classList.remove('lab-dual-mode-active');
  }
}

document.querySelectorAll('[data-set-mode]').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.setMode));
});

buildShowcase();

