---
last_mapped: 2026-06-30
focus: quality
---

# Testing

## Summary

There is no automated test suite in this repository. Verification is currently manual: run the static site locally or inspect the deployed GitHub Pages URLs after pushing.

## Current Test Tooling

- No `package.json` is present.
- No Jest, Vitest, Playwright, Cypress, or similar test framework is configured.
- No CI workflow files were observed in the inspected file list.
- No unit test files or browser test files were found.

## Manual Verification Patterns

Recent changes were verified by:

- Serving the repo with `python -m http.server 8000 --bind 127.0.0.1`.
- Probing local URLs such as `/Config/userinformation.txt`, `/Resources/profile/sayak-profile.jpg`, and `/JS/userinformation.js?v=1.3`.
- Probing live GitHub Pages URLs after pushing.
- Running `node --check JS/index.js` and `node --check JS/userinformation.js` for syntax-only checks.

## High-Value Smoke Tests

A future lightweight smoke suite should verify:

- `index.html` loads without console errors.
- `Config/projects.txt` resolves every listed project folder.
- Every listed project has `description.txt`, `media.txt`, `stats.txt`, and the HTML filename referenced in `description.txt`.
- Every `description.txt` has exactly five `---` sections.
- Homepage thumbnails render with non-empty title, href, image src, and alt text.
- Project pages render title, description, tags, media, stats, and previous/next navigation.
- `Config/userinformation.txt` creates one profile image, expected social icons, one email icon, and no blank social links.
- All local assets referenced from config files return HTTP 200 from a static server.

## Browser Interaction Tests

Useful browser-level checks:

- Homepage `+`, `-`, and `r` thumbnail resizing update `localStorage` and grid columns.
- Project page `Escape`, `ArrowLeft`, `ArrowRight`, `ArrowUp`, and `ArrowDown` keyboard handlers work.
- Image comparison sliders in `JS/projects.js` update the secondary image clip path.
- Recommendation carousel dot clicks and touch swipes transition correctly.
- Back-to-top button appears after scrolling project media.

## Data Validation Tests

Because text files are the content database, validation would catch many breakages before deploy:

- Validate `Config/projects.txt` folder names against `Projects/` directories.
- Validate project `description.txt` HTML filename exists in the same folder.
- Validate media URLs have supported extensions or supported providers.
- Validate stats lines include `:` before `JS/projects.js` reads key/value pairs.
- Validate social lines are known URLs or email addresses.

## Visual Regression Needs

The site is highly visual, so screenshot comparison would be valuable for:

- Homepage grid at desktop and mobile widths.
- About page profile, recommendations, and productions layout.
- Project detail split-view layout on desktop.
- Project detail stacked layout on mobile.
- Thumbnail containment behavior in `CSS/thumbnailstyle.css`.

## Known Testing Gaps

- No test currently catches malformed text config before deployment.
- No test catches missing remote Behance images or CDN CSS failures.
- No accessibility checks for keyboard focus, link labels, or color contrast.
- No automated check verifies that cache query strings were bumped after a script/config change.

## Suggested Minimal Setup

A low-friction first step would be a Node script under `tools/` that validates file existence and text-file schema, followed by optional Playwright smoke tests for the homepage and one project page.