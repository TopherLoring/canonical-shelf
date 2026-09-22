# Canonical Shelf library-system design baseline — 2026-09-21

Status: **approved, editable baseline**

This document records the learner-facing decisions approved during the September 21 prototype review. It is authoritative for continuity, but it is **not an immutable lock**. Agents may edit these files when a later approved decision supersedes this baseline. Do not add branch protection, read-only rules, ownership restrictions, or validation whose purpose is to prevent future design changes.

## Site-wide visual system

- Preserve the existing serif / sans / mono typography roles.
- Use a **flat color system**. Decorative gradients are not part of the approved baseline.
- Default shared chrome uses the Prototype B hierarchy: masthead `#24272d`, primary menu `#31353c`, light text, and antique gilt `#c7a253` as a restrained active/accent color.
- Default content surfaces are light white/ivory with restrained cool-neutral gray, blue-gray, and muted sage support colors. Avoid a default red, burgundy, brown, or tan cast.
- Alternate appearance packages remain user-selectable and may intentionally use their named palettes.
- Avoid card-within-card nesting when one primary surface can own the composition.
- Responsive/mobile layouts must preserve the same information hierarchy. Attached side panels may stack beneath their main reading surface on narrow screens.
- Feedback remains available everywhere. Route/activity context is attached internally; technical IDs and current-step data are not shown to the learner.
- Theme selection must also be reachable from the learner Profile / Account surface.

## Course Catalog

`/course` is the Course Catalog.

### No course progress

- Show all six courses in a stacked left-hand catalog list.
- The list uses a neutral gray field; the selected course uses charcoal with white text and a restrained gilt selection rule.
- The selector title block uses the shared masthead/menu charcoal colors and reads as a prominent catalog header.
- The right side previews the selected course: purpose, outcomes, and course contents.
- Opening the selected course enters the selected-course catalog state.

### Selected course / learner with progress

- Current / Next / Later are stacked vertically in the left Current Volume orientation area.
- Course Contents occupy the main right-hand selection area.
- Do not render a separate six-volume list or Collection Index in this state.
- Course switching uses exactly `Prev` and `Next`.
- Existing progress, review scheduling, stable activity identifiers, and open-navigation behavior remain authoritative.

## Lesson / Study Focus

- Keep the large folio-style lesson composition: reading/content left, attached dark Session Notes pane right.
- Keep a thin vertical progress rail at far left. It uses dots, not numbered/circled scene labels: completed white, current gilt/yellow, future muted.
- The thin top identity strip is human-facing. Use the hierarchy pattern `COURSE 2 / ISRAEL · UNIT 1 / EGYPT & EXODUS · PASSOVER` plus the lesson title. Do not expose semantic IDs, mastery percentages, XP counters, or numeric current-step data there.
- Current activity/step metadata remains internal. A learner-facing note may say Journal Notes or Feedback is tied to the current session/activity without showing the identifier.
- The right pane defaults to **Session Notes**. Its content changes with the current scene and uses visible/collapsible headings for passage, evidence, vocabulary, interpretive limits, deeper study, and sources.
- **Journal Notes** and **Feedback** are actions in that pane, not navigation tabs. Activating either temporarily replaces pane content with its editor; saving returns the pane to Session Notes.
- Journal Notes are private, persistent, activity-linked, learner-facing, and unscored.
- Feedback history is not learner-facing. Feedback is submitted through the existing persistence/API layer with route/activity context attached internally.
- The Theologian/Guide is context-aware, deliberate-open, and must not float over lesson controls/content.
- Short Scripture excerpts must retain enough surrounding context to make the quoted lines intelligible.
- Scripture and important quotation plates may use charcoal with white reading text; surrounding explanatory prose remains on the light reading surface.
- Review timing is calculated automatically. Manual scheduling is only shown when the learner explicitly requests it.

## Bible

- Preserve the 66-book shelf and book-details experience.
- Desktop hover/focus on a compact book spine reveals the full book name clearly.
- On touch/mobile, the first selection exposes the book name; a subsequent deliberate selection opens the book/details. This behavior must not rely on hover alone.
- The Bible reader uses a **light reading surface**.
- Book notes, context, and reader/footer details live in an attached **charcoal side panel** with collapsible headings.
- The side panel uses the same editorial typography and flat charcoal/white/gilt system as Session Notes.

## Topics

- Topics remain curated reference and do not become a second course.
- Topic reading uses the same design strategy as Bible: a light authored-reference surface plus an attached charcoal contextual pane.
- Scripture connections, course connections, related search language, metadata, and related exploration may be organized as collapsible headings in the contextual pane.
- Explanatory topic content remains on the light primary reading surface.

## Theologian

- The Theologian uses the existing deterministic evidence-aware implementation as a fallback and Cloudflare Workers AI as an optional conversational synthesis layer.
- No language-model weights are downloaded to the learner's device.
- The cloud model is not an independent authority. Its guardrails are the bundled **Berean Standard Bible**, approved Canonical Shelf site content, the **Statement of Faith**, and Canonical Shelf theology policy/vetted research, including the repository's LGBTQ research corpus.
- The browser sends only the question and current user-facing route to the Theologian endpoint; Journal content, profile data, progress history, and account data are not supplied as model context.
- Canonical Shelf does not persist Theologian conversation content server-side. Cloud failure or post-generation guardrail failure retains the deterministic evidence response.
- See `docs/v7/THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md` for the runtime and privacy contract.

## Practice, Search, Home, Profile, and shared surfaces

- Carry the same flat charcoal / light-surface / cool-neutral / gilt visual grammar across these destinations without forcing the Course or Lesson layout onto them.
- Practice retains gamification, review scheduling, mastery, achievements, and existing learning mechanics.
- Search remains cross-surface and evidence-oriented.
- Profile / Account includes appearance theme selection in addition to sync/account controls.
- Feedback remains globally reachable, including where Study Focus substitutes its own in-context feedback action.
