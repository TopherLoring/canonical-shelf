# Plan Delta — Personal Study Notes, Journal, and Global Feedback

## Status

**Historical implementation record with current UX supersession noted.** The underlying local-first personal-study state, sync behavior, and bounded Feedback persistence described here shipped in the earlier v7 release. The current learner-facing presentation was later revised by the library-system baseline and must be read through `LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md` and `DECISION_PRECEDENCE.md`.

## Durable behavior retained

- learner-owned writing remains private, persistent, local-first, export/import capable, and unscored;
- personal writing never changes completion, score, mastery, or review scheduling;
- optional account sync uses deterministic per-entry timestamps/mutations;
- Feedback remains available throughout Home, Course, Bible, Topics, Practice, and Study Focus;
- online feedback persists through bounded `/api/feedback` storage;
- failed/offline submissions may queue locally and retry;
- route/activity context may be attached internally without exposing technical IDs to the learner;
- submitted feedback history is not a learner-facing content library.

## Current UX superseding the original presentation

The earlier release exposed a broader **Notes & Journal** Study Focus model. The current approved presentation is:

- the lesson side panel defaults to **Session Notes**;
- **Journal Notes** and **Feedback** are actions in that side panel rather than peer navigation tabs;
- choosing Journal Notes or Feedback temporarily replaces Session Notes with the relevant editor, then returns after save/cancel;
- learner-facing copy says the entry/submission is tied to the current study activity while the technical activity/step identity remains internal;
- current-step metadata is not displayed as learner-facing technical data;
- a separate generic personal “Note” control is not part of the current default lesson UI.

The underlying `journal`/personal-study state can continue to support additional content-linked surfaces without changing scored learner state. Bible-reading or Topic-linked Journal entry points and a Profile → Journal index must not be described as implemented until those runtime paths are present and validated.

## Feedback contract

Feedback supports a bounded category/message payload and route context. The application must not silently add Journal content, lesson body text, browser fingerprinting, or unrelated profile/progress data to a feedback submission.

Feedback context can include internal route/activity/build identity for diagnosis. That metadata is implementation context, not learner-facing content.

## Privacy / assurance

Personal writing and Feedback remain separate from assessment state. Human review of privacy perception, wording, touch/device behavior, and production abuse handling remains continuing QA unless separately evidenced.

## Historical implementation evidence

The original v7 implementation included:

- `notes` / `journal` learner-state maps;
- personal-study persistence and sync merge policy;
- global Feedback UI;
- bounded Worker/D1 feedback persistence;
- offline feedback queueing;
- regression and E2E coverage.

Those facts remain useful provenance, but the original panel wording/layout is no longer current authority.
