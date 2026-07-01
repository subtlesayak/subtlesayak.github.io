# Quick Task 260701-ger: E-ink Refresh Toggle

## Request

Add an optional e-reader/e-ink style page refresh effect with one on/off button in the same floating control group as theme and thumbnail resize controls.

## Plan

- Add a shared e-ink refresh toggle to `JS/viewcontrols.js`.
- Keep the effect color-preserving by using a temporary overlay instead of changing page colors.
- Persist the on/off setting in `localStorage` and respect reduced-motion preferences.
- Trigger the refresh on load and before same-site navigation.
- Bump shared control cache versions across root and project pages.
- Verify JavaScript syntax, cache references, and diff hygiene.