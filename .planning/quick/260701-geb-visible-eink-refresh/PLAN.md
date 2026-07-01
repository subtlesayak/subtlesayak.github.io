# Quick Task 260701-geb: More Visible E-ink Refresh

## Request

Make the e-ink refresh effect more noticeable by turning the page black-and-white briefly and doubling the effect duration.

## Plan

- Add a temporary grayscale filter during the refresh state.
- Strengthen the overlay contrast and use a saturation blend for a clearer monochrome moment.
- Double the refresh duration and navigation delay from the previous implementation.
- Bump shared control cache versions so the live site serves the stronger effect.
- Validate JavaScript syntax and stale cache references.