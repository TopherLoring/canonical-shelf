# OpenBible.info cross-references

- Source: https://www.openbible.info/labs/cross-references/ (data: https://a.openbible.info/data/cross-references.zip)
- License: CC-BY. Attribution: "Cross references courtesy of OpenBible.info."
- Snapshot: 2026-09-21 export, 344,799 rows (From Verse, To Verse, Votes).
- Consumed by `scripts/build-crossrefs.mjs`, which writes `public/data/crossref/{book}_{chapter}.json` at build time.
- To refresh: download the zip, gunzip-compatible re-compress `cross_references.txt` to `cross-references.txt.gz`, rebuild.
