# Plan Delta — About / Footer Refinement

## Objective
Refine the institutional footer and About-page disclosures by combining the strongest wording from the current implementation with the supplied reference copy, while keeping linked machine-readable/discovery data synchronized from source.

## UX / product outcomes
- Keep the global footer compact and navigational rather than repeating long institutional copy on every route.
- Make Canonical Shelf's Scripture approach, scholarly method, translation limits, accessibility posture, and privacy model clearer and more specific.
- Preserve the actual current BSB implementation, guest/offline use, and optional account sync.
- Ensure `llms.txt` automatically derives the linked About/methodology disclosures instead of becoming a separately maintained copy.

## Acceptance criteria
1. Footer navigation and anchors remain unchanged.
2. Footer brand copy is more specific to Canonical Shelf's context/evidence/interpretation model.
3. About copy explicitly states inspired and authoritative Scripture, contextual reading, labeled disagreement, accurate representation of competing readings, and non-assent-based learning.
4. Sources/methodology preserves traceability, uncertainty, progressive disclosure, objectives, vocabulary, reflection, and mastery.
5. Translation copy accurately describes the current Berean Standard Bible corpus and permission boundary without claiming unsupported reader-supplied translation import.
6. Accessibility copy includes equivalent interaction paths and human assistive-technology release review.
7. Privacy copy reflects local-first guest/offline use plus optional account sync/backup and no inference of theological belief.
8. `scripts/llms-contract.mjs` derives and embeds the About-page institutional disclosure sections automatically; validation fails if the linked content is missing or stale.
9. No Course, Bible shelf/drawer, Practice, learner-state, auth behavior, routing, or visual-system behavior changes.

## Typed Project Execution Graph
```ts
type Node = {
  id: 'A0'|'A1'|'A2'|'A3'|'A4';
  type: 'plan'|'content'|'derived-data'|'validation'|'release';
  dependsOn: string[];
};

const graph: Node[] = [
  {id:'A0', type:'plan', dependsOn:[]},
  {id:'A1', type:'content', dependsOn:['A0']},
  {id:'A2', type:'derived-data', dependsOn:['A1']},
  {id:'A3', type:'validation', dependsOn:['A1','A2']},
  {id:'A4', type:'release', dependsOn:['A3']}
];
```

## WBS / execution
- **A0** Inventory current footer, About sections, llms generator/validator, and tests.
- **A1** Update `public/about.html` and synchronize the footer tagline in `public/index.html`.
- **A2** Extend `scripts/llms-contract.mjs` so `/about.html` is a canonical linked resource whose disclosure sections are parsed into generated `llms.txt` automatically.
- **A3** Extend `scripts/validate-llms.mjs`; run PR CI and inspect the exact diff.
- **A4** Merge only after validation; existing main-push production workflow deploys the tested revision.

## Invariants
Home / Course / Bible / Topics / Practice remain unchanged; Topics remain reference; Practice remains reinforcement; Statement of Faith remains the doctrinal ceiling; guest/offline learning remains first-class; optional account sync remains optional; learner reflection is not scored for assent.

## Risks and rollback
Risk is limited to institutional copy and derived discovery text. Rollback is a single revert of this change set; no learner-state or database migration is involved.

## Human-review gate
Verify that the final wording accurately distinguishes text/evidence/interpretation/doctrine and does not overstate currently implemented translation or accessibility capabilities.
