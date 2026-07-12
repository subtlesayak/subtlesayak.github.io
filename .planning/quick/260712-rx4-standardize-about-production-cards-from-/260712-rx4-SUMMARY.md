---
quick_id: 260712-rx4
status: complete
commit: 3810a96
---

# Uniform About Production Cards Summary

Standardized the About page cards from Experience through Certificates without changing their content.

## Delivered

- Added one fixed, bordered media frame for every production image with contained image fitting.
- Replaced mixed inline text styling with semantic company and date classes.
- Standardized content starts, card padding, section rhythm, typography, and border treatment.
- Added a stable mobile grid with an 84px media frame and full-width descriptions.
- Bumped About production CSS, JS, and content cache versions.

## Verification

- `JS/productions.js` syntax passed.
- `node tools/validate-content.js` passed.
- Git whitespace and CSS brace checks passed.
- About page, CSS, JS, config, and image asset returned HTTP 200 locally.
- Desktop and mobile media-frame contracts were verified in served CSS.
- In-app rendered QA remained unavailable because the Windows browser runtime could not launch (`CreateProcessWithLogonW 1168`).

## Commit

- `3810a96 style: standardize about production cards`
