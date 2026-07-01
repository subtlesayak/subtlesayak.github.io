# Summary

## Completed

- Added a single e-ink refresh on/off icon button beside the existing theme control.
- The refresh is on by default, can be turned off with one click, and stores the setting in `portfolioEinkRefresh`.
- The effect uses a temporary blended overlay so colors return immediately and are not permanently desaturated.
- Same-site navigation now briefly plays the refresh before moving to the next page.
- Reduced-motion users do not receive the animated refresh overlay.
- Bumped `viewcontrols.js` and `viewcontrols.css` cache versions to `v=1.3` across root and project pages.

## Verification

- `node --check JS\\viewcontrols.js`
- `git diff --check`
- Confirmed no stale `viewcontrols.js?v=1.2`, `viewcontrols.css?v=1.1`, or `viewcontrols.css?v=1.2` HTML references remain.

## Site Commit

- `4d43b89 feat(quick): add e-ink refresh toggle`