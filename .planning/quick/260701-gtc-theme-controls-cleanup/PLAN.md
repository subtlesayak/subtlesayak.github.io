---
status: complete
created: 2026-07-01
completed: 2026-07-01
commit: 8255f15
---

# Quick Task: Theme Controls Cleanup

## Request

Audit the new controls for mistakes: theme not reflecting everywhere, missing project-detail back button, duplicate previous/next controls, and theme controls needing icons. Then consolidate the three theme buttons into a single button that cycles through Auto, Dark, and Light.

## Plan

1. Apply shared theme controls to project detail pages and About, not only Portfolio and Photography.
2. Replace three separate theme buttons with one icon button that cycles Auto -> Dark -> Light.
3. Add a Portfolio project-detail back button.
4. Remove duplicate text Previous/Next controls from Photography detail while keeping overlay controls.
5. Broaden light-theme CSS coverage for About and project/detail surfaces.
6. Bump cache references for changed scripts/styles.

## Verification

- `node --check JS/viewcontrols.js`
- `node --check JS/photography.js`
- `node --check JS/projects.js`
- `git diff --check`
- Confirmed no stale old cache references remain for touched controls/scripts.
- Confirmed source contains one theme control constructor and no text Auto/Dark/Light button labels.
