# Canonical Shelf v7 — Design Intent

## Status

**Supporting design-principle reference.** This document preserves the durable intent of the earlier v5-polish work but is no longer the current palette/layout specification. Where it conflicts with a later owner decision, `AI_INSTRUCTIONS.md`, `DECISION_PRECEDENCE.md`, or `LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md`, the later/current source wins.

In particular, the current default/reference theme is the **flat library system**: charcoal shared chrome, light/ivory reading surfaces, restrained cool-neutral structure, sparse gilt, and no decorative gradients. Historical warm-paper, oxblood, jewel, layered-depth, or gradient examples remain valid only inside user-selectable themes when intentionally chosen; they are not the default visual contract.

## Durable direction

Canonical Shelf should feel like:

> **scholarly editorial study × tactile library identity × advanced interactive learning**

The product is not generic SaaS, a dashboard template, a basic LMS, or a quiz shell. Architecture exists to support the learner-facing experience rather than simplify it away.

## What should remain recognizable

- Home / Course / Bible / Topics / Practice are the five primary destinations.
- Course is one coherent six-course journey rather than disconnected skill tabs.
- Bible owns the bookshelf, book profiles, chapters, reader, and Bible-specific context.
- Topics is curated reference outside completion.
- Practice reinforces learned material and does not become a second curriculum.
- Study Focus should keep the learner oriented while exposing deeper context without covering or fragmenting the primary lesson.
- Dense useful information is preferred to giant empty hero space.
- Rich interactions are justified by the learning task, not by novelty.

## Current interpretation of the intent

### Shared shell

The current default/reference shell uses:

- masthead `#24272d`;
- secondary navigation `#31353c`;
- white/ivory content/reading surfaces;
- restrained cool-neutral structural colors;
- sparse antique gilt;
- serif editorial/content typography;
- sans interface typography;
- monospace only for genuine technical/system data.

Gray is a supporting neutral rather than the visual identity. Red/brown/tan are not default/reference accents. Decorative gradients are not part of the current flat baseline.

### Course

`/course` is the Course Catalog. New/no-progress learners can inspect all six courses and their units before opening one. Returning learners retain direct continuation/current-course behavior. Current/Next/Later belongs to course orientation rather than becoming a second navigation tree.

### Study Focus

A lesson/mastery experience is one primary composition rather than nested decorative cards. It uses:

- compact human-facing Course / Unit / lesson identity;
- vertical dot progress rail;
- light primary lesson surface;
- attached charcoal Session Notes panel;
- collapsible contextual material;
- Journal Notes and Feedback as temporary panel actions;
- deliberate contextual Theologian access;
- responsive recomposition rather than simple shrink/stack.

Current technical activity/step IDs remain internal.

### Bible

The bookshelf is a signature product element. Category color is semantic and should remain understandable across themes. Book names reveal on hover/focus and, on touch/mobile, first selection before deliberate open.

The default Bible reader uses a light Scripture surface and an attached charcoal Book Notes panel with collapsible contextual headings.

### Topics

Topics use the same high-level light-reading + dark-context strategy without becoming a clone of the Bible reader. Their contextual panel emphasizes topic metadata, search language, evidence/connections, and related exploration.

## Interaction principles

- Motion communicates navigation, state, progress, mastery, or causality and honors reduced-motion preferences.
- Color blocking establishes hierarchy or source type; do not put every paragraph in a decorative colored box.
- Scripture and selected important quotations may use charcoal/white/gilt treatment selectively.
- Primary reading/content must remain legible, calm, and substantive.
- Controls should be discoverable without turning every surface into persistent chrome.
- Responsive design may change composition and ordering across desktop/tablet/phone.
- Accessibility is a floor; it does not require flattening or removing useful interaction when accessible equivalents can be provided.

## Anti-patterns

Avoid:

- generic SaaS metric/card dashboards;
- giant typography that delays substantive content;
- decorative gradients in the current default/reference theme;
- excessive shadow/elevation used only to manufacture “premium” appearance;
- nested cards without semantic purpose;
- excessive gray saturation;
- technical IDs in learner-facing identity;
- a floating assistant obscuring content;
- duplicated navigation paths that compete for attention;
- visual novelty that weakens comprehension or library identity.

## Theme capability

Canonical Shelf retains user-selectable appearance packages. A theme may deliberately use a warmer, darker, jewel, or other distinct aesthetic while preserving semantic state, interaction meaning, accessibility, curriculum structure, and theological content.

Theme capability does not make every historical theme an acceptable default. Profile/Account owns theme selection.

## Product-quality test

For a consequential visual/interaction decision, ask:

1. Does it improve learner orientation or understanding?
2. Does it strengthen Canonical Shelf's library/editorial identity?
3. Does it preserve or improve responsive/accessibility behavior?
4. Is the treatment semantically justified rather than decorative repetition?
5. Does it remain compatible with current owner-approved destination behavior?

If a historical v5 idea passes those tests, reimplement it natively in the current architecture rather than restoring old bridge/runtime debt.
