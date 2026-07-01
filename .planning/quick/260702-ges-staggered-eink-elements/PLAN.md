# Quick Task 260702-ges: Staggered E-ink Element Flashes

## Request

Make every visible element flash at randomized timings during the e-ink refresh so the transition feels more like an e-reader redraw.

## Plan

- Mark visible page elements during each e-ink refresh with temporary flash classes.
- Assign each marked element a randomized delay and duration through CSS variables.
- Add a stepped element flash animation in shared view controls CSS.
- Clean up temporary classes and inline CSS variables after the refresh ends.
- Bump shared view controls cache versions for GitHub Pages.
- Validate JavaScript syntax, stale cache references, and diff hygiene.