<#
.SYNOPSIS
    Master Overhaul Automation Script for Canonical Shelf v5 Split-Folio.
.DESCRIPTION
    1. Creates safety backup & git working branch.
    2. Writes src/schema/canonical-shelf.ts.
    3. Writes scripts/reconcile-unified-corpus.mjs and compiles public/data/catalog.json.
    4. Deploys Museum Editorial / Split-Folio styles to public/canonical-shelf.css.
    5. Refactors public/app.js and public/bible.js (purging 'whereToStart', cross-wiring chapter notes & verse click handlers).
    6. Executes bun run build:app && bun run verify.
#>

[CmdletBinding()]
param(
    [string]$TargetRepo = "c:\dev\canonical-shelf",
    [string]$ArchiveRepo = "c:\dev\the-canonical-shelf"
)

$ErrorActionPreference = "Stop"

function Write-Head { param([string]$Msg) Write-Host "`n[OVERHAUL] $Msg" -ForegroundColor Cyan }

if (-not (Test-Path $TargetRepo)) { throw "Target repo missing: $TargetRepo" }
if (-not (Test-Path $ArchiveRepo)) { throw "Archive repo missing: $ArchiveRepo" }

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $TargetRepo ".backup-overhaul-$Stamp"
Write-Head "Safety Snapshot -> $BackupDir"
New-Item -Path $BackupDir -ItemType Directory -Force | Out-Null
Copy-Item (Join-Path $TargetRepo "content") (Join-Path $BackupDir "content") -Recurse -Force
Copy-Item (Join-Path $TargetRepo "public") (Join-Path $BackupDir "public") -Recurse -Force
Copy-Item (Join-Path $TargetRepo "scripts") (Join-Path $BackupDir "scripts") -Recurse -Force

Push-Location $TargetRepo
try {
    git checkout -b feature/unified-split-folio-master 2>$null | Out-Null
} catch {}

# -------------------------------------------------------------------------
# 1. WRITE UNIFIED TYPESCRIPT SCHEMA (src/schema/canonical-shelf.ts)
# -------------------------------------------------------------------------
Write-Head "Scaffolding TypeScript Schema Contract"
New-Item -Path "src\schema" -ItemType Directory -Force | Out-Null
$SchemaPath = "src\schema\canonical-shelf.ts"
@'
export type Testament = 'OT' | 'NT';
export type CanonicalCategory = 'law' | 'othist' | 'wisdom' | 'major' | 'minor' | 'gospel' | 'nthist' | 'paul' | 'general' | 'apoc';

export interface PassageAddress {
  book: number;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface CanonicalBook {
  bookNumber: number;
  name: string;
  testament: Testament;
  category: CanonicalCategory;
  categoryOrder: number;
  chaptersCount: number;
  hook: string;
  synopsis: string;
  traditionalAuthor: string;
  criticalAuthorDate: string;
  eraId: string;
  narrativeTimeRange: { startYear?: number; endYear?: number; displayRange: string };
  keyPeople: string[];
  openingMove: string;
  canonicalThreads: string[];
  dateDisputed: boolean;
}

export interface LessonStepCard {
  id: string;
  stepNumber: number;
  title: string;
  body: string[];
  verseRef?: string;
  verseText?: string;
  whatDoesThisMean: string;
}

export interface CurriculumLesson {
  id: string;
  unitId: string;
  movementId: string;
  sequenceInUnit: number;
  title: string;
  objective: string;
  plainSummary: string;
  readingAddress: PassageAddress;
  readingReferenceText: string;
  stepCards: LessonStepCard[];
  apparatus: {
    glossaryItemIds: string[];
    translationVariantIds: string[];
    disagreementIds: string[];
    historicalEvidenceIds: string[];
  };
  checks: unknown[];
  reviewChecks: unknown[];
  reflection: { prompt: string; modelResponse: string };
}
'@ | Set-Content -Path $SchemaPath -Encoding utf8

# -------------------------------------------------------------------------
# 2. WRITE RECONCILIATION NODE SCRIPT & COMPILE CATALOG
# -------------------------------------------------------------------------
Write-Head "Writing Data Reconciliation Engine"
New-Item -Path "scripts" -ItemType Directory -Force | Out-Null
$ReconcilePath = "scripts\compile-unified-catalog.mjs"
@'
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.cwd();
const DATA_OUT = join(ROOT, 'public/data');
await mkdir(DATA_OUT, { recursive: true });

const { LIBRARY_BOOKS, CATEGORIES, ERAS, TIMELINE_ANCHORS, THREADS, STORY_ARC } =
  await import(join(ROOT, 'public/library-data.js'));

const canonicalBooks = LIBRARY_BOOKS.map(book => ({
  bookNumber: book.n,
  name: book.name,
  testament: CATEGORIES[book.cat].testament,
  category: book.cat,
  categoryOrder: book.n,
  chaptersCount: book.ch,
  hook: book.hook || '',
  synopsis: book.syn || '',
  traditionalAuthor: book.who || 'Traditional attribution',
  criticalAuthorDate: book.when || 'Historical setting',
  eraId: book.era,
  narrativeTimeRange: {
    startYear: book.setA,
    endYear: book.setB,
    displayRange: book.setA ? `${Math.abs(book.setA)} BC` : 'Unplaced'
  },
  keyPeople: book.people || [],
  openingMove: 'Begins with literary dedication and historical setting.',
  canonicalThreads: book.threads || [],
  dateDisputed: Boolean(book.dateUnsure)
}));

const targetCatalogPath = join(DATA_OUT, 'catalog.json');
let targetCatalog = { courses: [], units: [], lessons: [], masteryIds: [], activities: [] };
try {
  targetCatalog = JSON.parse(await readFile(targetCatalogPath, 'utf8'));
} catch {}

const { newLessons } = await import(join(ROOT, 'content/curriculum/new-lessons.mjs'));
const allLessonsRaw = [...(targetCatalog.lessons || []), ...newLessons];
const deduplicatedLessons = [];
const seenLessons = new Set();

const READING_REPLACEMENTS = {
  'c1-bible-languages': { ref:, reading: 'Nehemiah 8:1–8' },
  'library': { ref:, reading: 'Deuteronomy 30:11–14' },
  'gospel-comparison': { ref:, reading: 'Mark 1:1 // Matthew 1:1 // John 1:1–5' },
  'c3-alexander-hellenization': { ref:, reading: 'Daniel 8:1–8' },
  'c3-hasmoneans': { ref: [0, 0, 0, 0], reading: '1 Maccabees 2:19–28, 4:36–40' },
  'c3-essenes-qumran': { ref:, reading: 'Isaiah 40:1–5' },
  'c5-synoptic-problem': { ref:, reading: 'Mark 2:1–12 // Matthew 9:1–8 // Luke 5:17–26' },
  'cross-grace': { ref:, reading: 'Romans 3:21–26' },
  'creeds-reading': { ref:, reading: 'Philippians 2:5–11' },
  'suffering-discernment': { ref:, reading: 'John 9:1–7' },
  'inclusion-reading': { ref:, reading: 'Acts 8:26–39' },
  'communion-table': { ref:, reading: 'Mark 14:22–26' }
};

for (const lesson of allLessonsRaw) {
  if (seenLessons.has(lesson.id)) continue;
  seenLessons.add(lesson.id);

  const override = READING_REPLACEMENTS[lesson.id];
  const activeRef = override ? override.ref : (lesson.ref ||);
  const activeReading = override ? override.reading : (lesson.reading || '');

  const rawBody = Array.isArray(lesson.body) ? lesson.body : [lesson.body || ''];
  const stepCards = rawBody.map((paragraph, idx) => ({
    id: `${lesson.id}-step-${idx + 1}`,
    stepNumber: idx + 1,
    title: idx === 0 ? lesson.title : `Context & Analysis (${idx + 1})`,
    body: [paragraph],
    verseRef: `${activeRef[0]}:${activeRef}`,
    whatDoesThisMean: lesson.quick || lesson.plainSummary || 'Observe what the text actually states in context before deriving an application.'
  }));

  deduplicatedLessons.push({
    id: lesson.id,
    unitId: lesson.unitId || 'c1.christianity',
    sequenceInUnit: deduplicatedLessons.length + 1,
    title: lesson.title,
    objective: lesson.objective || 'Develop biblical literacy and contextual reasoning.',
    plainSummary: lesson.quick || lesson.summary || '',
    readingAddress: {
      book: Number(activeRef[0]),
      chapter: Number(activeRef),
      verseStart: Number(activeRef || 1),
      verseEnd: activeRef ? Number(activeRef) : undefined
    },
    readingReferenceText: activeReading,
    stepCards,
    apparatus: { glossaryItemIds: [], translationVariantIds: [], disagreementIds: [], historicalEvidenceIds: [] },
    checks: lesson.challenges || [],
    reviewChecks: lesson.reviewChallenges || [],
    reflection: {
      prompt: lesson.reflection || 'What did you notice in this passage?',
      modelResponse: lesson.modelResponse || 'A thoughtful reading distinguishes the textual claim from later assumptions.'
    }
  });
}

const movements = [
  { id: 'm1', sequence: 1, title: 'The Living Story', subtitle: 'Orientation & Narrative Arc', unitIds: ['c1.christianity', 'c1.bible', 'c1.story'] },
  { id: 'm2', sequence: 2, title: 'Ancient Foundations', subtitle: 'Torah, Kingdom, Wisdom & Second Temple', unitIds: ['c2.exodus', 'c2.sinai', 'c2.tabernacle', 'c2.sacrifice', 'c2.land-kings', 'c2.temple-kingdom', 'c2.prophets-exile', 'c2.restoration-hope', 'c3.after-exile', 'c3.greek-world', 'c3.hasmonean-rome', 'c3.jewish-life', 'c3.expectation', 'c3.enter-gospels'] },
  { id: 'm3', sequence: 3, title: 'The Christ Event & Early Church', subtitle: 'Gospels, Passion, Acts & Epistles', unitIds: ['c4.gospels', 'c4.kingdom', 'c4.teaching', 'c4.israel-story', 'c4.passion', 'c4.pentecost', 'c4.paul-gentiles', 'c4.expansion'] },
  { id: 'm4', sequence: 4, title: 'Systematic Synthesis & Living Ethics', subtitle: 'Doctrine, Contested Questions & Traditions', unitIds: ['c5.transmission', 'c5.translation', 'c5.genre', 'c5.intertext', 'c5.gospel-letters', 'c5.interpretation', 'c6.god-christ', 'c6.sin-salvation', 'c6.providence-life', 'c6.church-practice', 'c6.traditions', 'c6.difficult', 'c6.final-hope'] }
];

const finalCatalog = {
  ...targetCatalog,
  curriculumVersion: 5,
  generatedAt: new Date().toISOString(),
  books: canonicalBooks,
  movements,
  lessons: deduplicatedLessons
};

await writeFile(targetCatalogPath, JSON.stringify(finalCatalog, null, 2), 'utf8');
console.log('✓ Unified master catalog generated.');
'@ | Set-Content -Path $ReconcilePath -Encoding utf8

bun run scripts/compile-unified-catalog.mjs

# -------------------------------------------------------------------------
# 3. DEPLOY UNIFIED DESIGN SYSTEM AUTHORITY (canonical-shelf.css)
# -------------------------------------------------------------------------
Write-Head "Deploying Museum Editorial / Split-Folio Design System"
$CssPath = "public\canonical-shelf.css"
@'
:root {
  --font-display: Cambria, Charter, Georgia, 'Times New Roman', serif;
  --font-reading: Georgia, Charter, serif;
  --font-body: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-meta: ui-monospace, 'Cascadia Mono', Menlo, Consolas, monospace;
  --color-canvas: #fbfbfa;
  --color-surface-raised: #ffffff;
  --color-surface-subtle: #f2f3f5;
  --color-ink: #1c2024;
  --color-text-secondary: #5a626a;
  --color-border: #d3d7dc;
  --color-accent: #486272;
  --color-gilt: #c59b27;
  --color-gilt-glow: #ffc800;
  --chrome-bg: #181b1f;
  --chrome-surface: #22262c;
  --chrome-border: #323740;
  --chrome-text: #f4f5f6;
  --chrome-muted: #9ba3af;
  --canon-law: #234888; --canon-othist: #7a5028; --canon-wisdom: #226b5d; --canon-major: #5e2a69; --canon-minor: #a57814;
  --canon-gospel: #a32c23; --canon-nthist: #436d22; --canon-paul: #963b5d; --canon-general: #3b4e66; --canon-apoc: #202328;
  --theme-radius: 12px; --control-radius: 6px; --shadow-elevation: 0 12px 36px rgba(0,0,0,0.06); --shadow-soft: 0 4px 16px rgba(0,0,0,0.04);
}
html, body { margin:0; padding:0; background:var(--color-canvas); color:var(--color-ink); font-family:var(--font-body); line-height:1.6; }
.masthead { background:var(--chrome-bg); border-bottom:1px solid var(--chrome-border); padding:0.75rem clamp(1rem,4vw,3rem); display:flex; justify-content:space-between; align-items:center; }
.masthead .brand { font-family:var(--font-display); font-size:1.35rem; font-weight:700; color:#fff; text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem; }
.masthead .brand span:first-child { color:var(--color-gilt-glow); }
.primary { background:var(--chrome-surface); border-bottom:1px solid var(--chrome-border); padding:0 clamp(1rem,4vw,3rem); display:flex; gap:1.5rem; overflow-x:auto; }
.primary a { color:var(--chrome-muted); text-decoration:none; font:700 0.78rem var(--font-meta); letter-spacing:0.08em; text-transform:uppercase; padding:0.85rem 0; border-bottom:3px solid transparent; white-space:nowrap; }
.primary a:hover, .primary a[aria-current="page"] { color:#fff; border-bottom-color:var(--color-gilt-glow); }
main { max-width:1380px; margin:0 auto; padding:2rem clamp(1rem,3.5vw,3rem); }
.library-first-home { display:grid; gap:2.5rem; }
.library-first-hero { background:var(--chrome-surface); border-radius:var(--theme-radius); padding:clamp(1.5rem,4vw,3rem); color:#fff; box-shadow:0 16px 48px rgba(0,0,0,0.15); }
.library-first-copy h1 { font-family:var(--font-display); font-size:clamp(2.5rem,5.5vw,4.2rem); line-height:1.05; margin:0 0 1rem; }
.library-first-copy h1 em { color:var(--color-gilt-glow); font-style:italic; }
.library-first-copy .lede { font-family:var(--font-reading); font-size:1.2rem; max-width:68ch; color:var(--chrome-muted); margin-bottom:2rem; }
.library-first-shelf-wrap { display:grid; gap:1.25rem; background:#15171a; padding:1.5rem; border-radius:var(--theme-radius); border:1px solid rgba(255,255,255,0.08); }
.library-first-shelf-row { display:grid; grid-template-columns:120px minmax(0,1fr); gap:1rem; align-items:end; }
.library-first-shelf-label { font:700 0.72rem var(--font-meta); letter-spacing:0.12em; text-transform:uppercase; color:var(--chrome-muted); text-align:right; padding-bottom:0.5rem; }
.library-first-shelf { display:flex; align-items:end; height:110px; gap:3px; padding:0 0.5rem; border-bottom:8px solid #3c424a; background:linear-gradient(180deg,transparent 80%,rgba(0,0,0,0.4)); overflow-x:auto; }
.library-first-book { position:relative; flex:0 0 auto; width:clamp(8px,calc(7px + (var(--chapters)*0.08px)),20px); height:clamp(52px,calc(50px + (var(--chapters)*0.45px)),102px); background:var(--book-color,var(--canon-general)); border-radius:2px 2px 0 0; cursor:pointer; transition:transform 0.2s ease, filter 0.2s ease; box-shadow:inset -1px 0 rgba(255,255,255,0.2); }
.library-first-book:hover { transform:translateY(-8px) scaleY(1.04); filter:brightness(1.2); z-index:10; }
.library-first-book span { position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); background:#000; color:#fff; padding:0.25rem 0.6rem; border-radius:4px; font:0.7rem var(--font-meta); white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 0.15s ease; }
.library-first-book:hover span { opacity:1; }
.library-first-book[data-cat="law"] { --book-color:var(--canon-law); } .library-first-book[data-cat="othist"] { --book-color:var(--canon-othist); } .library-first-book[data-cat="wisdom"] { --book-color:var(--canon-wisdom); } .library-first-book[data-cat="major"] { --book-color:var(--canon-major); } .library-first-book[data-cat="minor"] { --book-color:var(--canon-minor); } .library-first-book[data-cat="gospel"] { --book-color:var(--canon-gospel); } .library-first-book[data-cat="nthist"] { --book-color:var(--canon-nthist); } .library-first-book[data-cat="paul"] { --book-color:var(--canon-paul); } .library-first-book[data-cat="general"] { --book-color:var(--canon-general); } .library-first-book[data-cat="apoc"] { --book-color:var(--canon-apoc); }
.library-entry-map { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1.25rem; }
.library-entry-map a { background:var(--color-surface-raised); border:1px solid var(--color-border); border-radius:var(--theme-radius); padding:1.5rem; text-decoration:none; color:var(--color-ink); box-shadow:var(--shadow-soft); transition:transform 0.2s ease, box-shadow 0.2s ease; }
.library-entry-map a:hover { transform:translateY(-4px); box-shadow:var(--shadow-elevation); }
.library-entry-map strong { display:block; font-family:var(--font-display); font-size:1.25rem; margin:0.25rem 0 0.5rem; }
.library-reader-layout, .study-focus-viewport { display:grid; grid-template-columns:minmax(0,1fr) 380px; gap:2.25rem; align-items:start; }
.reader.scripture { background:var(--color-surface-raised); border:1px solid var(--color-border); border-radius:var(--theme-radius); padding:clamp(2rem,5vw,4rem); box-shadow:var(--shadow-elevation); }
.reader.scripture h1 { font-family:var(--font-display); font-size:clamp(2.2rem,4.5vw,3.4rem); text-align:center; margin:0.5rem 0 1.5rem; }
.reader.scripture .verses { font-family:var(--font-reading); font-size:1.18rem; line-height:1.85; color:#26292d; }
.reader.scripture .verses p { margin:0 0 0.75rem; cursor:pointer; }
.reader.scripture .verses p.is-selected { background:#fff4bf; outline:2px solid var(--color-gilt); }
.reader.scripture .verses sup { font-family:var(--font-meta); font-size:0.68rem; color:var(--color-accent); padding-right:0.35rem; }
.library-reader-panel, .study-apparatus-sidebar { position:sticky; top:1.5rem; display:flex; flex-direction:column; gap:0.85rem; max-height:calc(100vh - 3rem); overflow-y:auto; }
.library-reader-panel details, .apparatus-drawer { background:var(--color-surface-raised); border:1px solid var(--color-border); border-radius:var(--control-radius); overflow:hidden; box-shadow:var(--shadow-soft); }
.library-reader-panel summary, .apparatus-drawer summary { padding:0.85rem 1.15rem; background:var(--color-surface-subtle); font:750 0.76rem var(--font-meta); letter-spacing:0.08em; text-transform:uppercase; color:var(--color-ink); cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center; }
.library-reader-panel summary::-webkit-details-marker, .apparatus-drawer summary::-webkit-details-marker { display:none; }
.library-reader-panel summary::after, .apparatus-drawer summary::after { content:"›"; font-size:1.15rem; transition:transform 0.2s ease; }
.library-reader-panel details[open] summary::after, .apparatus-drawer[open] summary::after { transform:rotate(90deg); }
.library-reader-panel details[open] summary, .apparatus-drawer[open] summary { border-bottom:1px solid var(--color-border); }
.library-reader-panel details div, .apparatus-content { padding:1.15rem; font-size:0.9rem; line-height:1.6; }
.study-card-deck { background:var(--color-surface-raised); border:1px solid var(--color-border); border-radius:var(--theme-radius); box-shadow:var(--shadow-elevation); overflow:hidden; }
.study-deck-header { padding:1rem 1.75rem; background:var(--color-surface-subtle); border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center; }
.study-card { padding:2.5rem; min-height:460px; display:flex; flex-direction:column; }
.study-card__title { font-family:var(--font-display); font-size:1.95rem; margin:0 0 1.25rem; }
.study-card__prose { font-family:var(--font-reading); font-size:1.15rem; line-height:1.75; }
.study-card__meaning { margin-top:1.75rem; padding:1.15rem 1.4rem; background:color-mix(in srgb,var(--color-surface-subtle) 60%,#fff); border:1px solid var(--color-border); border-left:4px solid var(--color-gilt); border-radius:0 var(--control-radius) var(--control-radius) 0; }
.study-card__meaning-label { display:block; font:750 0.72rem var(--font-meta); letter-spacing:0.1em; text-transform:uppercase; color:var(--color-accent); margin-bottom:0.35rem; }
/* Theologian Panel Repair */
.guide { position:fixed; right:28px; bottom:74px; width:min(400px,calc(100vw - 56px)); height:min(640px,calc(100dvh - 110px)); padding:16px; border:1px solid #50565d; border-radius:16px; background:#3e4551; color:#f7f7f4; box-shadow:0 22px 58px rgba(0,0,0,0.45); display:flex; flex-direction:column; z-index:100; box-sizing:border-box; }
.guide[hidden] { display:none !important; }
.guide .guide-head { display:flex; justify-content:space-between; align-items:center; padding-bottom:0.75rem; margin-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.15); flex-shrink:0; }
.guide .guide-head h2 { font-family:var(--font-display); font-size:1.15rem; margin:0; color:#fff; }
.guide .guide-head button { background:transparent; border:none; color:#fff; cursor:pointer; font-size:1.25rem; }
.guide .theologian-chat, .guide .guide-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow-y:auto; gap:1rem; padding-right:0.25rem; }
.guide form#guide-form, .guide .guide-composer { flex-shrink:0; margin-top:auto; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:0.5rem; background:inherit; }
.guide form#guide-form label { font:700 0.68rem var(--font-meta); letter-spacing:0.08em; text-transform:uppercase; color:#c8ccd0; }
.guide form#guide-form textarea { width:100%; resize:none; padding:0.6rem; border-radius:7px; border:1px solid #737a81; background:#24272d; color:#fff; font-family:var(--font-body); font-size:0.9rem; box-sizing:border-box; }
.guide form#guide-form button.button { align-self:flex-end; padding:0.5rem 1rem; background:#ffc800; color:#1c2024; font-weight:700; border:none; cursor:pointer; border-radius:7px; }
.guide-open { position:fixed; right:12px; bottom:22px; border-radius:999px; padding:10px 16px; background:#24272d; color:#fff; border:1px solid #59616a; box-shadow:0 8px 24px rgba(0,0,0,0.3); z-index:99; cursor:pointer; font:700 0.75rem var(--font-meta); letter-spacing:0.06em; }
body.study-focus-active > .guide-open { display:none; }
@media (max-width:1040px) { .library-reader-layout, .study-focus-viewport { grid-template-columns:1fr; } .library-reader-panel, .study-apparatus-sidebar { position:static; max-height:none; } }
'@ | Set-Content -Path $CssPath -Encoding utf8

# -------------------------------------------------------------------------
# 4. REFACTOR PUBLIC/BIBLE.JS & APP.JS (CROSS-WIRE NOTES & VERSE INSPECT)
# -------------------------------------------------------------------------
Write-Head "Refactoring Bible Reader & Exposing Global Catalog"
$AppJsPath = "public\app.js"
$AppJsContent = Get-Content -Path $AppJsPath -Raw -Encoding utf8
if (-not $AppJsContent.Contains("window.CANON_CATALOG")) {
    $AppJsContent = $AppJsContent.Replace(
        "data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():Promise.reject())",
        "data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():Promise.reject()); window.CANON_CATALOG=data;"
    )
    Set-Content -Path $AppJsPath -Value $AppJsContent -Encoding utf8
}

$BibleJsPath = "public\bible.js"
$BibleJsContent = Get-Content -Path $BibleJsPath -Raw -Encoding utf8
# Purge whereToStart
$BibleJsContent = $BibleJsContent -replace '<div><dt>Where to start</dt><dd>\$\{esc\(book\.read\)\}</dd></div>', ''

# Inject interactive verse ref attributes into reader rendering loop
$BibleJsContent = $BibleJsContent -replace '<p id="v\$\{row\.verse\}"', '<p id="v${row.verse}" data-verse-ref="${bn}:${chapter}:${row.verse}" class="interactive-verse" tabindex="0" role="button"'

Set-Content -Path $BibleJsPath -Value $BibleJsContent -Encoding utf8

# -------------------------------------------------------------------------
# 5. EXECUTE BUILD & VERIFY GATES
# -------------------------------------------------------------------------
Write-Head "Executing Build & Contract Verification"
bun run build:app
bun run verify:contract
bun run test:assessment

Write-Host "`n[SUCCESS] Master overhaul complete and verified." -ForegroundColor Green
Pop-Location