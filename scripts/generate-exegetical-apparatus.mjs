#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const CONFIG = {
  defaultModel: 'llama3',
  ollamaUrl: process.env.OLLAMA_HOST || 'http://localhost:11434',
  outputPath: resolve(process.cwd(), 'public/data/verse-annotations.json'),
  catalogPath: resolve(process.cwd(), 'public/data/catalog.json'),
  maxRetries: 3,
  retryDelayMs: 1200,
};

const SOF_HERMENEUTIC_INVARIANTS = `
STRICT HERMENEUTICAL AND DOCTRINAL CONTRACT:
1. DISTINCTION OF TIERS: Maintain clean separation between the primary text, historical-literary context, scholarly translation range, and ecclesiastical reception/doctrine.
2. ANTI-PROOF-TEXTING: Never treat cross-references as flat harmonization chains. Every cross-reference must explicitly categorize the relationship: 'direct-quotation', 'allusion', 'thematic-parallel', 'reception-history', or 'narrative-inversion'.
3. HISTORICAL CRITICAL DATING: Strictly bifurcate narrative era (internal story setting) from academic textual composition/redaction window (when the document was written/edited).
4. THEOLOGICAL HUMILITY & DISPUTED QUESTIONS: Where Christian traditions diverge (atonement mechanisms, origins/creation, ministry leadership, gender, sexuality, divine sovereignty vs human freedom, eschatological judgment), provide at least two viable perspectives fairly, without polemics or bad-faith characterizations. Identify the textual or cultural pivot point driving the disagreement.
5. JEWISH INTEGRITY: Reject supersessionism, caricatures of Second Temple Judaism, and collective blame for Jesus' crucifixion.
6. HUMAN DIGNITY & EQUALITY: Honor full egalitarian leadership, the dignity and inclusion of LGBTQ+ persons, and compatibility with established scientific consensus.
`;

const VALID_RELATIONSHIPS = new Set([
  'direct-quotation',
  'allusion',
  'thematic-parallel',
  'reception-history',
  'narrative-inversion',
]);

function parseCli() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      book: { type: 'string', short: 'b' },
      chapter: { type: 'string', short: 'c' },
      verse: { type: 'string', short: 'v' },
      target: { type: 'string', short: 't' },
      'from-catalog': { type: 'boolean', default: false },
      limit: { type: 'string', default: '0' },
      model: { type: 'string', default: CONFIG.defaultModel },
      force: { type: 'boolean', default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  return {
    book: values.book?.toUpperCase(),
    chapter: values.chapter ? parseInt(values.chapter, 10) : undefined,
    verse: values.verse ? parseInt(values.verse, 10) : undefined,
    target: values.target?.toUpperCase(),
    fromCatalog: values['from-catalog'],
    limit: parseInt(values.limit, 10),
    model: values.model || CONFIG.defaultModel,
    force: values.force,
  };
}

async function verifyOllamaDaemon(baseUrl, model) {
  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (!res.ok) {
      throw new Error(`Ollama health check returned HTTP ${res.status}`);
    }
    const data = await res.json();
    const modelFound = data.models?.some((m) => m.name.startsWith(model));
    if (!modelFound) {
      console.warn(`[WARN] Model '${model}' not listed in local Ollama tags. Attempting execution anyway...`);
    }
  } catch (err) {
    console.error(`[ERROR] Cannot reach Ollama daemon at ${baseUrl}: ${err.message}`);
    process.exit(1);
  }
}

function resolveCoordinates(cli, existingKeys) {
  if (cli.target) {
    const parts = cli.target.split('_');
    if (parts.length !== 3) {
      console.error(`[ERROR] Target coordinate must be in format BOOK_CHAPTER_VERSE (e.g., GEN_1_26)`);
      process.exit(1);
    }
    return [{ book: parts[0], chapter: parseInt(parts[1], 10), verse: parseInt(parts[2], 10) }];
  }

  if (cli.book && cli.chapter && cli.verse) {
    return [{ book: cli.book, chapter: cli.chapter, verse: cli.verse }];
  }

  if (cli.fromCatalog) {
    if (!existsSync(CONFIG.catalogPath)) {
      console.error(`[ERROR] Catalog file not found at ${CONFIG.catalogPath}`);
      process.exit(1);
    }
    const catalog = JSON.parse(readFileSync(CONFIG.catalogPath, 'utf8'));
    const discovered = [];

    const lessons = catalog.lessons || [];
    for (const lesson of lessons) {
      const addr = lesson.readingAddress;
      if (addr?.book && addr?.chapter) {
        const bookNorm = addr.book.toUpperCase();
        const startVerse = addr.startVerse || 1;
        const endVerse = addr.endVerse || startVerse + 2;
        for (let v = startVerse; v <= endVerse; v++) {
          discovered.push({ book: bookNorm, chapter: addr.chapter, verse: v });
        }
      }
    }

    const uniqueMap = new Map();
    for (const item of discovered) {
      const key = `${item.book}_${item.chapter}_${item.verse}`;
      if (!cli.force && existingKeys.has(key)) {
        continue;
      }
      uniqueMap.set(key, item);
    }

    const list = Array.from(uniqueMap.values());
    return cli.limit > 0 ? list.slice(0, cli.limit) : list;
  }

  return [
    { book: 'GEN', chapter: 1, verse: 26 },
    { book: 'GEN', chapter: 3, verse: 16 },
    { book: 'ROM', chapter: 16, verse: 7 },
    { book: '1CO', chapter: 14, verse: 34 },
    { book: 'MIC', chapter: 6, verse: 8 },
  ].filter((c) => cli.force || !existingKeys.has(`${c.book}_${c.chapter}_${c.verse}`));
}

function validateApparatusSchema(record, expectedKey) {
  if (!record || typeof record !== 'object') {
    throw new Error('Record is not a valid JSON object.');
  }
  if (record.address !== expectedKey) {
    record.address = expectedKey;
  }

  const { timeline, crossReferences, disputedDoctrines } = record;

  if (!timeline || typeof timeline !== 'object') {
    throw new Error('Missing or malformed "timeline" object.');
  }
  if (!timeline.narrativeEra || !timeline.compositionWindow || !timeline.historicalContext) {
    throw new Error('Timeline missing one of: narrativeEra, compositionWindow, historicalContext.');
  }

  if (!Array.isArray(crossReferences)) {
    throw new Error('"crossReferences" must be an array.');
  }
  for (let i = 0; i < crossReferences.length; i++) {
    const xref = crossReferences[i];
    if (!xref.targetAddress || !xref.relationshipType || !xref.rationale) {
      throw new Error(`Cross-reference at index ${i} missing required properties.`);
    }
    if (!VALID_RELATIONSHIPS.has(xref.relationshipType)) {
      xref.relationshipType = 'thematic-parallel';
    }
  }

  if (!Array.isArray(disputedDoctrines)) {
    throw new Error('"disputedDoctrines" must be an array.');
  }
  for (let i = 0; i < disputedDoctrines.length; i++) {
    const doc = disputedDoctrines[i];
    if (!doc.locus || !doc.hermeneuticalPivot || !Array.isArray(doc.positions)) {
      throw new Error(`Disputed doctrine at index ${i} missing locus, hermeneuticalPivot, or positions array.`);
    }
    if (doc.positions.length < 2) {
      throw new Error(`Disputed doctrine locus "${doc.locus}" must contain at least 2 distinct positions.`);
    }
    for (let j = 0; j < doc.positions.length; j++) {
      const pos = doc.positions[j];
      if (!pos.designation || !pos.readingSummary || !pos.underlyingHermeneutic) {
        throw new Error(`Position index ${j} in locus "${doc.locus}" missing required fields.`);
      }
    }
  }

  return record;
}

async function requestApparatusInference(book, chapter, verse, model) {
  const coordinateKey = `${book}_${chapter}_${verse}`;

  const prompt = `${SOF_HERMENEUTIC_INVARIANTS}

You are generating a scholarly biblical apparatus record for: ${book} ${chapter}:${verse} (Key: "${coordinateKey}").

Construct a single JSON object strictly matching this schema:
{
  "address": "${coordinateKey}",
  "timeline": {
    "narrativeEra": "Internal narrative era (e.g., Bronze Age Patriarchal, Iron Age II, Late Second Temple)",
    "compositionWindow": "Scholarly consensus dating for document writing/redaction (e.g., 6th Century BCE exilic redaction, c. 54-57 CE)",
    "historicalContext": "Immediate geopolitical/cultural pressures facing the authors/audience (max 35 words)"
  },
  "crossReferences": [
    {
      "targetAddress": "Target reference key using BOOK_CHAPTER_VERSE (e.g., ISA_40_3)",
      "relationshipType": "direct-quotation | allusion | thematic-parallel | reception-history | narrative-inversion",
      "rationale": "Scholarly connection without proof-texting (max 25 words)"
    }
  ],
  "disputedDoctrines": [
    {
      "locus": "Specific theological or ethical topic in dispute",
      "hermeneuticalPivot": "The linguistic, cultural, or textual variable driving the divergence",
      "positions": [
        {
          "designation": "Name of historic/contemporary viewpoint A",
          "readingSummary": "Fair, non-caricatured summary of this interpretation (max 35 words)",
          "underlyingHermeneutic": "Hermeneutical method used (e.g., historical-grammatical, literalist, trajectory/liberation)"
        },
        {
          "designation": "Name of historic/contemporary viewpoint B",
          "readingSummary": "Fair, non-caricatured summary of this interpretation (max 35 words)",
          "underlyingHermeneutic": "Hermeneutical method used"
        }
      ]
    }
  ]
}

CRITICAL RULES:
- Include 1 to 4 meaningful cross-references.
- Include 1 or 2 disputed doctrines if this verse touches historically contested areas (gender, authority, cosmology, atonement, salvation, law, eschatology). If entirely uncontroversial, "disputedDoctrines" may be an empty array [].
- Output raw valid JSON only. No markdown fences, no conversational prose.`;

  let attempt = 0;
  while (attempt < CONFIG.maxRetries) {
    attempt++;
    try {
      const res = await fetch(`${CONFIG.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.15,
            top_p: 0.9,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Ollama`);
      }

      const body = await res.json();
      const rawText = body.response.trim();
      const parsed = JSON.parse(rawText);
      return validateApparatusSchema(parsed, coordinateKey);
    } catch (err) {
      console.warn(`[RETRY] Attempt ${attempt}/${CONFIG.maxRetries} failed for ${coordinateKey}: ${err.message}`);
      if (attempt >= CONFIG.maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, CONFIG.retryDelayMs * attempt));
    }
  }
}

function writeAtomicJson(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  Bun.spawnSync(['mv', tempPath, filePath]);
}

async function main() {
  const cli = parseCli();

  console.log('--- Canonical Shelf: Exegetical Apparatus Compiler ---');
  console.log(`Endpoint : ${CONFIG.ollamaUrl}`);
  console.log(`Model    : ${cli.model}`);
  console.log(`Target DB: ${CONFIG.outputPath}`);

  await verifyOllamaDaemon(CONFIG.ollamaUrl, cli.model);

  let masterData = {};
  if (existsSync(CONFIG.outputPath)) {
    try {
      masterData = JSON.parse(readFileSync(CONFIG.outputPath, 'utf8'));
      console.log(`[INIT] Loaded ${Object.keys(masterData).length} existing apparatus coordinates.`);
    } catch {
      console.warn(`[WARN] Existing database corrupted or unreadable. Initializing fresh registry.`);
      masterData = {};
    }
  }

  const existingKeys = new Set(Object.keys(masterData));
  const queue = resolveCoordinates(cli, existingKeys);

  if (queue.length === 0) {
    console.log('[COMPLETE] Zero coordinates require compilation. Everything up-to-date.');
    return;
  }

  console.log(`[QUEUE] Processing ${queue.length} coordinates...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const key = `${item.book}_${item.chapter}_${item.verse}`;
    const progress = `[${i + 1}/${queue.length}]`;

    process.stdout.write(`${progress} Compiling ${key}... `);

    try {
      const record = await requestApparatusInference(item.book, item.chapter, item.verse, cli.model);
      masterData[key] = record;
      writeAtomicJson(CONFIG.outputPath, masterData);
      process.stdout.write('✓ OK\n');
      successCount++;
    } catch (err) {
      process.stdout.write(`✗ FAILED (${err.message})\n`);
      failCount++;
    }

    if (i < queue.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  console.log('\n--- Generation Summary ---');
  console.log(`Successfully Compiled : ${successCount}`);
  console.log(`Failures              : ${failCount}`);
  console.log(`Total Stored Records  : ${Object.keys(masterData).length}`);
  console.log(`Registry Written To   : ${CONFIG.outputPath}`);

  if (failCount > 0 && successCount === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[FATAL] Pipeline crash: ${err.stack || err.message}`);
  process.exit(1);
});