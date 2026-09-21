# Original Bible Surface and Theme Restoration

## Decision

Restore the Bible landing experience shown in the original Canonical Shelf screenshots while keeping the current v7 data, routing, offline corpus, learner state, and five-destination information architecture.

## Evidence status

- **OBSERVED:** the original experience uses an editorial Iowan/Palatino serif hierarchy, monospaced metadata, a proportional 66-book shelf, and an in-context right-side book drawer.
- **OBSERVED:** the current v7 Bible default precedes the shelf with four generic navigation cards and opens book profiles as replacement pages.
- **VERIFIED:** current v7 already owns complete 66-book profile data, nine canonical groups, local BSB reader data, native History API routing, and six theme packages.
- **INFERRED:** the current visual and interaction regression can be repaired within the existing Bible renderer without restoring the legacy runtime.

## Locked outcomes

1. Canonical Original is the default for new installations. Existing saved theme choices remain untouched.
2. Canonical Original, Heritage, Oxblood, and Illuminated Jewel are presented first in Appearance; Slate & Linen and Bookshelf Spectrum remain available.
3. Every theme uses the original editorial typography stack:
   - display/reading: Iowan Old Style → Palatino Linotype → Book Antiqua → Palatino → Charter → Georgia → Times New Roman;
   - metadata: system monospace with Cascadia/SF Mono/Consolas fallbacks;
   - interface body: system sans.
4. The default Bible route leads with “The Canonical Shelf,” its original editorial lede, compact Bible utilities, and the proportional 66-book shelf.
5. Selecting a shelf book opens a route-addressable modal side drawer over the shelf.
6. The drawer exposes book identity, synopsis, authorship/date/people/start-reading facts, chapter access, previous/next book navigation, and an explicit close action.
7. Closing the drawer restores focus to the selected shelf spine.
8. Direct chapter reading, Bible search, books/groups, timeline, offline behavior, and existing profile URLs remain coherent.
9. No curriculum, activity ID, mastery, learner-state, BSB corpus, or database change is permitted.

## Interaction contract

- Open: `/bible?view=shelf&book=<n>&profile=1`
- Close: `/bible?view=shelf&focus=<n>`
- Escape performs the same close action.
- Background content is inert and hidden from assistive technology while the drawer is open.
- The close button receives focus after route render.
- Previous/next book controls update the drawer without leaving the shelf context.
- Chapter links leave the drawer and enter the existing reader.

## Implementation plan

1. Reorder theme metadata and introduce an explicit default theme ID.
2. Replace theme-specific font substitutions with shared original typography primitives.
3. Recompose the default Bible header and compact mode navigation.
4. Convert the replacement profile route into a modal drawer composed over the originating Bible view.
5. Add focus restoration, Escape handling, scroll containment, responsive full-width phone behavior, reduced-motion, and forced-colors handling.
6. Extend validators and Playwright coverage.
7. Run CI and merge through a reviewable PR.

## Acceptance criteria

- A fresh profile resolves to Canonical Original.
- Existing persisted themes still resolve unchanged.
- Appearance lists Canonical Original, Heritage, Oxblood, and Illuminated Jewel before the remaining packages.
- The default Bible page visually leads with the original title and shelf rather than a four-card mode chooser.
- Clicking Ezekiel on the shelf keeps the shelf visible beneath a scrim and opens a right-side dialog containing Ezekiel details.
- Drawer close and Escape return to the shelf and restore focus to Ezekiel.
- Previous/next book and chapter actions work through native routes.
- The drawer is operable at desktop and phone widths without clipped content.
- Automated production verification passes.

## Human validation required

- Visual comparison against the four supplied screenshots.
- Physical phone/touch review.
- VoiceOver/NVDA modal announcement and focus-cycle review.
- Editorial sampling of disputed authorship and dating language.

## Rollback

Revert the theme, Bible renderer, styling, test, and documentation commit set. No state or data migration is introduced.
