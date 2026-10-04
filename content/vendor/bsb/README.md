# Berean Standard Bible reading apparatus

`annotations.json` holds what the printed BSB carries around the text: section headings, paragraph and poetry line
starts, and translator footnotes, keyed by `book:chapter`, then verse.

- **Source:** `https://bereanbible.com/bsb_tables.tsv`, pinned by SHA-256 in `scripts/fetch-bsb-sources.mjs`.
- **Built by:** `bun run data:fetch bsb_tables.tsv && bun scripts/vendor-bsb-annotations.mjs`.
- **Checked against:** `content/vendor/legacy/corpus.txt`, the reading-text authority. Every annotated verse must
  exist in the corpus, and each footnote is anchored at a character offset just after the BSB words it follows.
  Where those words cannot be found in the corpus verse, the footnote is placed at the end of the verse
  (`counts.footnotesAtVerseEnd`).
- **Published by:** `scripts/publish-bsb-annotations.mjs` (part of `prepare:content`), which refuses to publish if the
  served corpus differs from the one recorded here.
- **License:** the Berean Standard Bible is dedicated to the public domain.
