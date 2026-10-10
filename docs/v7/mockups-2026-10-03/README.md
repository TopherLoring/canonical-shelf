# Redesign mockups — 2026-10-03

Confirmed visual reference for the structural redesign (slices 2a–2e). Approval record: `redesign.mockups.confirmed`. Live canvas: https://claude.ai/artifact/MqEvryH9PVkSwBVCcijuYP

All screens use the Reading Room theme. Other themes restyle these same layouts and never change them (`design.themes.scope`).

| File | Screen |
|---|---|
| `Main.dc.html` | Shelf home, desktop |
| `Reader.dc.html` | Bible reader, desktop |
| `Lesson.dc.html` | Lesson, desktop |
| `TheoDock.dc.html` | Theologian open, desktop (docked) |
| `LearningPath.dc.html` | Learning Path: path, module and unit on one page |
| `StudyTopics.dc.html` | Study Topics, desktop |
| `ReviewPractice.dc.html` | Review & Practice, desktop |
| `PhoneReader.dc.html` | Bible reader, phone |
| `PhoneLesson.dc.html` | Lesson, phone |
| `PhoneTheo.dc.html` | Theologian open, phone |
| `ThemeSheet.dc.html` | Reading Room theme sheet: typography, color roles, lines and borders, corners and elevation (the target values for theme contract v10) |

`canvas.json` is the canvas layout. The `.dc.html` files are design-canvas artboards: open them through the artifact link above, or read them as markup for exact values (spacing, colors, radii, shadows).

These are reference designs, not production code. Build each screen in the app against the theme contract roles, and use these files for layout, hierarchy and values.

## Open items

- `visual-direction`: final values for the other seven themes (slice 2e).
