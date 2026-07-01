---
status: complete
created: 2026-07-01
completed: 2026-07-01
commit: 2ba5797
---

# Quick Task: Thumbnail Font Scale

## Request

Make thumbnail text fit at each resize step by increasing or decreasing the font as the grid size changes.

## Plan

1. Add a title-size scale that matches the existing ten thumbnail column steps.
2. Set CSS variables for title size, icon size, and inset whenever the resize controls apply a step.
3. Update thumbnail CSS to read those variables instead of fixed desktop sizes.
4. Bump cache references for `JS/viewcontrols.js` and `CSS/thumbnailstyle.css`.

## Verification

- `node --check JS/viewcontrols.js`
- `git diff --check` returned only Windows line-ending warnings.
- Confirmed no stale `viewcontrols.js?v=1.1` or `thumbnailstyle.css?v=2.0` references remain.
- Confirmed thumbnail title/icon CSS uses resize-step variables.
