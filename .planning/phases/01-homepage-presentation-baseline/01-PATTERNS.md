# Phase 01 - Pattern Map

**Phase:** 01 - Homepage Presentation Baseline
**Created:** 2026-06-30

## Scope Signals

Primary user decisions live in `01-CONTEXT.md` and `01-UI-SPEC.md`. Phase 1 touches homepage presentation only: profile/header layout, card title visibility, grid rhythm, image containment, responsive behavior, and restrained dark visual polish.

## Files To Plan Around

| File | Role | Existing Pattern | Phase 1 Use |
|------|------|------------------|-------------|
| `index.html` | Homepage shell | Static containers, CSS/JS loaded with query-string cache versions, inline active-nav script | Adjust markup only if needed for intro line or removing resize controls; bump cache versions for changed assets |
| `JS/userinformation.js` | Profile renderer | Fetches `Config/userinformation.txt`, creates DOM nodes, appends profile panel into `.top-container` | Add/derive one-line intro only if data contract stays beginner-friendly; ensure socials remain icon-only and safe links include `rel` where applicable |
| `JS/index.js` | Project card renderer | Fetches project list and `description.txt`, creates thumbnail anchor/div/img/title, appends fragment | Preserve text-file project model; add accessible focus/title behavior and avoid extra metadata in cards |
| `JS/resize-thumbnails.js` | Optional grid controls | LocalStorage-driven dynamic grid min-width plus fixed plus/minus controls | Remove if the new fixed responsive grid makes controls unnecessary; otherwise restyle quietly |
| `CSS/indexstyle.css` | Homepage layout | Global reset, dark shell, top/bottom containers, nav styling, empty state | Centralize Phase 1 dark polish, header spacing, nav placement, mobile shell spacing |
| `CSS/thumbnailstyle.css` | Card/grid styling | CSS grid, duplicated `.thumbnail` block, square ratio via `padding-top: 100%`, hover title opacity, resize buttons | Convert to uniform 4:3 card grid, contained images, desktop hover/focus overlay, mobile visible title, medium gaps |
| `CSS/userinformationstyle.css` | Profile/social styling | Centered flex column, 150px round image, gold name, grey social icons | Compact centered identity block, tuned Poppins sizes/weights, small icon row, non-overlapping mobile spacing |
| `Config/userinformation.txt` | Editable profile content | Line-based profile image/name/role/location/socials | Preserve existing format if possible; only add intro text if planner chooses a backward-compatible parsing strategy |

## Existing Code Excerpts To Respect

### Card DOM Shape
`JS/index.js` creates:
- anchor link to project page
- `.thumbnail` wrapper
- `img` with `src` and `alt`
- `.thumbnail-title` with title text
- optional `.overlay-icon` elements for media indicators

Plan changes should keep this simple DOM shape unless a specific accessibility wrapper is required.

### Current Grid/Cards
`CSS/thumbnailstyle.css` currently uses:
- `#thumbnail-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 5px; }`
- `.thumbnail { padding-top: 100%; position: relative; overflow: hidden; }`
- `.thumbnail img { object-fit: contain; background-color: #f4f1ea; }`
- `.thumbnail-title { position: absolute; opacity: 0; }`

Phase 1 should replace square ratio with 4:3, keep contain behavior, increase gap, and add focus/mobile title states.

### Header/Profile
`JS/userinformation.js` currently treats the first four lines as profile picture, name, role, and location, with the rest as socials. Adding intro copy must not break existing users who follow the current template.

## Planning Guidance

- Prefer CSS-first layout fixes over JavaScript complexity.
- Keep content model backward-compatible unless the plan explicitly includes a migration note.
- Bump cache query strings in `index.html` for every changed CSS/JS file.
- Remove duplicate `.thumbnail` CSS while editing `CSS/thumbnailstyle.css`.
- Ensure focus behavior is keyboard-testable with Tab.
- Include mobile checks for title visibility and header overlap.