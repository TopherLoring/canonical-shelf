# Canonical Shelf screen templates

Six screens, desktop and phone, rebuilt from the approved boards in `docs/v7/mockups-2026-10-03`. They are the visual target the app's screens move onto. Nothing here is loaded by the app.

## Preview

Serve the repository root (the templates read the app's generated theme from `public/theme.css`) and open the preview:

```
python3 -m http.server 4175
```

Then open `http://localhost:4175/docs/design/templates/preview.html`, pick a screen and a size. `screen.html?screen=lesson` opens one screen at the size of the window. Screens: `shelf`, `path`, `lesson`, `reader`, `topics`, `practice`. Add `&chrome=0` to hide the phone status bar.

## Screen states

`screen.html?screen=path` is the module page; add `&view=unit` for a unit's lessons (phone also has `&view=module`). `screen=topics` browses topics; add `&view=topic` for a topic's sub topics and content. Links marked `data-go` switch states in the preview.

## How sizing works

Nothing has a fixed size. Every length in `css/src` is written in board units (`24u`), and `build.mjs` turns them into `calc(24 * var(--u))`.

- Desktop: one unit is 1/1440 of the app's width or 1/900 of its height, whichever is smaller. At 1440 × 900 the screens reproduce the boards; at any other size they scale, and the middle column takes the spare width.
- Phone: one unit is 1/390 of the width or 1/844 of the height, whichever is smaller. The phone layout is used when the app is 760 wide or narrower, or taller than 5:4.
- The app is a size container (`.cs-app`), so a screen sized inside a panel or an iframe scales to that box, not to the whole window.

Edit `css/src/*.css`, then run `bun docs/design/templates/build.mjs` (or `node`) to regenerate `css/canonical-shelf.css`.

## Files

| File | Holds |
| --- | --- |
| `css/src/tokens.css` | Template roles, all taken from the app's generated theme (`public/theme.css`); roles the theme lacks are mixed from theme roles, with the board value noted beside each |
| `css/src/shell.css` | Backdrop, top bar, frame, cards, rails, buttons, edge tabs, phone tab bar, status bar |
| `css/src/screens.css` | The six screens, desktop then phone |
| `css/canonical-shelf.css` | Generated; the one stylesheet to load |
| `examples.js` | Markup for each screen, desktop and phone, with the boards' demonstration content |
| `icons.js` | The boards' line icons |
| `demo.js` | Mounts a screen, switches desktop/phone by the shape of the space, minimal interactions |
| `fonts/` | Newsreader, Literata (optical sizes), Source Sans 3, Caladea; OFL licenses beside them |

## Phone

The phone screens follow `PhoneLesson.dc.html` and `PhoneReader.dc.html` inside the frame, with changes Chris directed on 2026-10-08: a phone status bar with the camera island; no top bar; one bottom bar (Shelf, Path, Bible, Topics, Review, Search, You) on every screen except the lesson and the Bible, which are focus screens with a close button; "Step x of y" in the lesson title bar with a chain-of-dots tracker; the Shelf's selected book docked above the bar. My Notes and Theologian stay as right-edge tabs at their recorded positions. Shelf, Learning Path, Study Topics and Review & Practice have no phone board; their phone layouts are built from the desktop content in the phone frame.

## Compare before done

Every design change is compared to its plan board before it is called done (Chris, 2026-10-08). Where no board exists (phone Shelf, phone Learning Path, the topic page, the Learning Path options) it is compared to the current template instead. Capture at 1440 × 900 and 390 × 844, put plan and template side by side, and list each difference as directed by Chris or unintended. Fix the unintended ones.

## Known differences from the boards

- Buttons use Source Sans 3, the theme sheet's interface face. The board markup never set a font on its buttons, so the boards show the browser default there (Arial).
- The Bible toolbar is 59 tall, as the board renders it (its 64 shrinks because the passage overflows).
- The boards' text is demonstration content. The app supplies its own, through the same structure.

## Moving a screen into the app

1. Port the screen's markup from `examples.js` into its route renderer in `public/ui/screens/`, with real data and stable IDs.
2. Add the mixed roles in `tokens.css` to the theme contract (`.roa/values/theme.json`) so the app and the templates share them.
3. Delete the old stylesheet rules that screen replaces in the same change.
4. Accept the screen only when its capture matches the board (desktop 1440 × 900, phone 390 × 844).
