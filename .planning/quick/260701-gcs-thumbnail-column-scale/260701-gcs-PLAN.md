---
id: 260701-gcs
status: complete
created: 2026-07-01
completed: 2026-07-01
type: quick
---

# Thumbnail Column Scale

Change homepage thumbnail resizing from pixel-based widths to exact column-count steps.

## Scope

- Smallest thumbnails show 26 columns per desktop row.
- Largest thumbnails show 4 columns per desktop row.
- Add 8 intermediate stops between those extremes.
- Keep mobile override separate so the grid stays usable on narrow screens.
- Bump homepage cache strings for the changed JS and CSS.

## Scale

`26, 23, 20, 17, 14, 11, 8, 6, 5, 4`

## Verification

- `node --check JS/index.js` passed.
- CSS uses `repeat(var(--thumbnail-columns, 13), minmax(0, 1fr))` for the desktop grid.
- Old `--thumbnail-min` desktop override was removed.
