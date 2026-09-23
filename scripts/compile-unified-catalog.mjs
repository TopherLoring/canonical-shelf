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
const allLessonsRaw = [...newLessons, ...(targetCatalog.lessons || [])];
const deduplicatedLessons = [];
const seenLessons = new Set();

const READING_REPLACEMENTS = {
  'c1-bible-languages': { ref: [16, 8, 1, 8], reading: 'Nehemiah 8:1–8' },
  'library': { ref: [5, 30, 11, 14], reading: 'Deuteronomy 30:11–14' },
  'gospel-comparison': { ref: [41, 1, 1, 1], reading: 'Mark 1:1 // Matthew 1:1 // John 1:1–5' },
  'c3-alexander-hellenization': { ref: [27, 8, 1, 8], reading: 'Daniel 8:1–8' },
  'c3-hasmoneans': { ref: [0, 0, 0, 0], reading: '1 Maccabees 2:19–28, 4:36–40' },
  'c3-essenes-qumran': { ref: [23, 40, 1, 5], reading: 'Isaiah 40:1–5' },
  'c5-synoptic-problem': { ref: [41, 2, 1, 12], reading: 'Mark 2:1–12 // Matthew 9:1–8 // Luke 5:17–26' },
  'cross-grace': { ref: [45, 3, 21, 26], reading: 'Romans 3:21–26' },
  'creeds-reading': { ref: [50, 2, 5, 11], reading: 'Philippians 2:5–11' },
  'suffering-discernment': { ref: [43, 9, 1, 7], reading: 'John 9:1–7' },
  'inclusion-reading': { ref: [44, 8, 26, 39], reading: 'Acts 8:26–39' },
  'communion-table': { ref: [41, 14, 22, 26], reading: 'Mark 14:22–26' }
};

for (const lesson of allLessonsRaw) {
  if (seenLessons.has(lesson.id)) continue;
  seenLessons.add(lesson.id);

  const override = READING_REPLACEMENTS[lesson.id];
  const activeRef = override ? override.ref : (lesson.ref || [0, 0, 0, 0]);
  const activeReading = override ? override.reading : (lesson.reading || '');

  const rawBody = Array.isArray(lesson.body) ? lesson.body : [lesson.body || ''];
  const stepCards = rawBody.map((paragraph, idx) => ({
    id: `${lesson.id}-step-${idx + 1}`,
    stepNumber: idx + 1,
    title: idx === 0 ? lesson.title : `Context & Analysis (${idx + 1})`,
    body: [paragraph],
    verseRef: `${activeRef[0]}:${activeRef[1]}`,
    whatDoesThisMean: lesson.quick || lesson.plainSummary || 'Observe what the text actually states in context before deriving an application.'
  }));

  deduplicatedLessons.push({
    id: lesson.id,
    unitId: lesson.unitId || 'c1.christianity',
    sequenceInUnit: deduplicatedLessons.length + 1,
    title: lesson.title,
    objective: lesson.objective || 'Develop biblical literacy and contextual reasoning.',
    plainSummary: lesson.quick || lesson.summary || '',
    ref: activeRef,
    reading: activeReading,
    readingAddress: {
      book: Number(activeRef[0]),
      chapter: Number(activeRef[1]),
      verseStart: Number(activeRef[2] ?? 1),
      verseEnd: activeRef[3] !== undefined ? Number(activeRef[3]) : undefined
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
  version: 6,
  curriculumVersion: 6,
  generatedAt: new Date().toISOString(),
  books: canonicalBooks,
  movements,
  lessons: deduplicatedLessons
};

await writeFile(targetCatalogPath, JSON.stringify(finalCatalog, null, 2), 'utf8');
console.log('✓ Unified master catalog compiled successfully.');
