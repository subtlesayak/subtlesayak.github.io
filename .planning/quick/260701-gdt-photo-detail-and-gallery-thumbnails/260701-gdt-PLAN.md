---
id: 260701-gdt
status: complete
created: 2026-07-01
completed: 2026-07-01
type: quick
---

# Photo Detail View And Gallery Thumbnails

Update the Photography tab so photo clicks open a project-like detail view and make the gallery grid load faster with optimized thumbnails.

## Scope

- Invert the homepage resize button order so the plus button appears before the minus button.
- Change Photography gallery cards from raw image links to `photography.html?photo=...` detail links.
- Render a detail layout with the selected image on the left and details/actions on the right.
- Add previous/next navigation, back-to-gallery, and full-image actions.
- Generate optimized thumbnail files under `Projects/Photography/thumbs/`.
- Load thumbnails in gallery view while preserving full-size images for detail view.

## Verification

- `node --check JS/index.js` passed.
- `node --check JS/photography.js` passed.
- 32 thumbnails generated for 32 full-size Photography images.
- Full Photography originals total about 204.9 MB; gallery thumbnails total about 1.0 MB.
