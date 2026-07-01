---
status: complete
created: 2026-07-01
completed: 2026-07-01
commit: 1a7c9be
---

# Quick Task: Shared Controls And Photo Navigation

## Request

Fix portfolio project previous/next navigation, add matching previous/next/back controls to photography photo detail pages, add shared dark/light/auto theme controls beside resize controls, add the same 10-step thumbnail resize scale to Photography, remove the visible Photography page header, correct the smallest thumbnail scale to 24 items per row, and make project-view photos fit within the viewport height.

## Plan

1. Extract portfolio resize behavior into beginner-editable shared `JS/viewcontrols.js` and `CSS/viewcontrols.css`.
2. Apply shared controls to the Portfolio and Photography gallery pages with a 24-to-4, 10-step column scale.
3. Fix project previous/next navigation by decoding URL folder names before matching `Config/projects.txt`.
4. Add photo detail previous/next/back buttons and keyboard navigation.
5. Fit project and photography detail images to the viewport height.
6. Bump cache versions on touched HTML, CSS, and JS references for GitHub Pages.

## Verification

- `node --check JS/index.js`
- `node --check JS/photography.js`
- `node --check JS/projects.js`
- `node --check JS/viewcontrols.js`
- `git diff --cached --check`
- Confirmed no stale project page `CSS/main.css?v=1.2` or `JS/projects.js?v=1.3` references remained before commit.
