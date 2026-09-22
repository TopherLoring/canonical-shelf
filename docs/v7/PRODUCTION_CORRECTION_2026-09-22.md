# Production correction — 2026-09-22

Status: current editable production baseline. This document records the owner-approved correction after the 2026-09-22 production review. It is authoritative for continuity but is intentionally editable by future approved work; it is not a branch-protection or read-only design lock.

## What the production review showed

The merged release exposed two regressions that prior deployment validation did not catch:

1. The final rendered Home and destination-page typography still inherited generic experience styling rather than the approved Library First / pre-page-wide-gray Prototype B baseline. This produced oversized headings and the wrong Home composition.
2. The cloud assistant was layered on top of the historical Guide shell. The learner still saw “Ask the Guide,” while deployment verification only proved that an AI binding existed; it did not prove that a live `/api/theologian` inference succeeded.

## Corrected experience baseline

- The default/reference palette uses the approved flat Library First system: charcoal `#24272d`, secondary charcoal `#31353c`, paper `#f2efe7`, sheet `#fffdf7`, cool structural neutrals, and restrained gilt `#c7a253`.
- Gray remains structural rather than becoming the page-wide identity.
- Decorative gradients remain excluded from the baseline.
- Generic billboard-scale page headings are not part of Canonical Shelf. Destination headings must fit comfortably in the viewport and yield immediately to useful content.
- Home returns to the Library First composition: “The Canonical Shelf,” the category-colored 66-book shelf, clear ways into Bible / Theologian / Course / Practice, continuation, and current context.
- Course remains the Course Catalog and keeps the approved selector/detail and Current / Next / Later patterns.
- Bible keeps the category-colored shelf; the reader is light with attached charcoal Book Notes and collapsible context.
- Topics remains a light authored-reference surface with attached charcoal contextual notes.
- Lesson Study Focus keeps its light folio, dot progress rail, Scripture/quotation plates, and narrow attached Session Notes pane.

## Theologian naming and behavior

**Theologian** is the learner-facing name everywhere. `guide` may remain in internal DOM identifiers or historical provenance documents where changing it would create unnecessary compatibility risk, but current UI must not present the assistant as “Ask the Guide.”

The Cloud Theologian is grounded, in order, by:

1. Berean Standard Bible text supplied by Canonical Shelf;
2. current Canonical Shelf Course, Topics, glossary, Bible/book, and reference content;
3. the Canonical Shelf Statement of Faith as doctrinal ceiling;
4. theology policy and vetted research, including the LGBTQ research set when relevant.

The deterministic evidence engine remains a fallback, not the primary learner-facing identity.

## Deployment invariant

A production deployment is not considered verified merely because the Workers AI binding exists. Post-deployment verification must perform a real `POST /api/theologian` request and require:

- HTTP success;
- `mode: "cloud"`;
- a substantive generated answer;
- grounding evidence;
- reported BSB guardrail.

The deployment smoke gate also verifies that the current app shell includes the final Library First correction layer and the Theologian user-facing shell.

## Cache / service-worker invariant

Any change to the final visual or Theologian client assets must bump the service-worker release cache key and include new essential assets. This prevents an installed PWA or Edge session from mixing a new HTML shell with stale JS/CSS from an older release.
