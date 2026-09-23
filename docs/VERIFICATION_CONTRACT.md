# Canonical Shelf verification contract

Canonical Shelf verification protects durable product behavior, not a frozen visual implementation.

## Release gate

The only repository release gate is:

```bash
bun run verify
```

It builds current generated content/runtime, verifies immutable BSB identity, checks the durable product/template contract, runs domain logic tests, and runs a small Chromium browser contract smoke.

Cloudflare target validation and live post-deployment verification remain separate infrastructure checks.

## What verification may require

Verification may assert durable capabilities and template semantics such as:

- core destinations can be generated, loaded, and identified as route-owned documents;
- pages expose a main content region and a page heading;
- Home reaches Course, Bible, Topics, and Practice;
- the canonical Bible contains 66 identifiable books with valid chapter counts;
- required published data/policy/PWA assets exist and parse;
- global study utilities remain operable;
- assessment, learner state/sync, feedback/privacy, Theologian, and crisis behavior function;
- representative desktop/mobile layouts do not create document-level horizontal overflow;
- representative pages have no serious/critical automated accessibility violations;
- Cloudflare configuration and live deployment contracts remain valid when those dedicated checks run.

## What verification must not freeze

Do not add release-blocking assertions for:

- exact prose, headings, button labels, punctuation, or character sequences unless the text itself is an immutable legal/data requirement;
- source line numbers or file offsets;
- exact CSS values, colors, typography, spacing, radii, dimensions, shadows, or themes;
- class names used only for styling;
- DOM nesting that is not required for accessibility or function;
- historical screenshots, historical layouts, parity with an earlier version, or restoration of superseded presentation;
- exact curriculum/content counts that are expected to evolve, except for genuinely immutable domain facts;
- branch/PR supersession history or one-time migration state;
- implementation technique when multiple implementations satisfy the same user-facing contract.

## Stable test surfaces

Prefer, in order:

1. observable behavior;
2. accessibility semantics and relationships;
3. stable route/data contracts;
4. purpose-built semantic test hooks when behavior cannot otherwise be observed reliably.

Do not use visual classes as test hooks. If a stable hook is necessary, name it for the capability it represents, not the current design.

## Change rule

When product behavior intentionally changes, update the contract to describe the new durable capability. Do not make production code imitate an obsolete test.

When presentation changes but capability does not, verification should normally require no change.
