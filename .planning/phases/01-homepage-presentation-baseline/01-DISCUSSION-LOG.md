# Phase 1: Homepage Presentation Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 1-Homepage Presentation Baseline
**Areas discussed:** Profile/header layout, Project card readability, Grid rhythm and image fit, Visual polish level

---

## Profile/Header Layout

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| How should the top profile area feel? | Compact centered identity block; Larger intro header; Small profile strip | Compact centered identity block with better spacing and no overlap |
| How much personal intro copy should the homepage include? | No extra intro copy; One short line under the role; A small intro paragraph | One short intro line under the role |
| How should the profile/social links be presented? | Small icon row; Icon row with tiny labels on hover only; Text labels beside key links | Small icon row |
| Should the navigation stay directly under the profile? | Keep under profile; Move nav above profile; Make nav sticky at top | Keep navigation under profile |

**Notes:** User wants simplicity and compactness, but with better spacing so the header no longer overlaps or feels cramped.

---

## Project Card Readability

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| How should project titles appear on the homepage? | Always visible below image; Subtle overlay; Hover/focus only | Desktop hover/focus only; mobile always visible below image |
| What should the desktop hover/focus treatment feel like? | Clean dark overlay; Soft card lift plus footer; Minimal reveal | Clean dark overlay with title |
| What extra info should cards show beyond the title? | Title only; Title plus type/category; Title plus tags/tools | Title only |
| How should long titles behave? | Wrap to two lines then clamp; Single-line ellipsis; Full wrapping | Wrap to two lines, then clamp |
| Should keyboard/focus users see the same overlay as hover? | Same overlay; Focus outline only; Overlay plus outline | Same overlay on focus |

**Notes:** Desktop can stay image-forward, but mobile and keyboard access must not hide essential titles.

---

## Grid Rhythm And Image Fit

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| How should the homepage grid feel? | Uniform card grid; Dense gallery grid; Light editorial grid | Uniform card grid |
| How should images fit inside cards? | Contain full image; Cover/crop; Auto-fit per type | Contain full image with a quiet background |
| What card aspect ratio should the grid use? | Landscape 4:3; Wide 16:9; Square 1:1 | Landscape 4:3 |
| How much spacing should the grid have? | Comfortable medium gaps; Tight gaps; Large airy gaps | Comfortable medium gaps |
| Should thumbnail size controls stay? | Remove; Keep smaller; Move to settings | Decide after all changes; default remove if unnecessary |

**Notes:** This area preserves the user's explicit requirement that project images fit inside placeholders.

---

## Visual Polish Level

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| What overall visual direction should Phase 1 take? | Clean dark portfolio refresh; Lighter editorial portfolio; Very minimal black gallery | Clean dark portfolio refresh |
| How strong should the accent color be? | Subtle gold accent; Mostly monochrome; More colorful accents | Subtle gold accent |
| How much motion should Phase 1 include? | Quiet micro-interactions only; No motion; More expressive animation | Quiet micro-interactions only |
| How should typography feel? | Keep Poppins and tune sizing/weight; Switch sans; Stronger display style | Keep Poppins and tune sizing/weight |
| How rounded should the UI feel? | Small radius crisp cards; Sharper/square cards; Very rounded cards/buttons | Small radius, crisp cards |

**Notes:** The refresh should look polished without becoming decorative or complex.

---

## the agent's Discretion

- Decide whether thumbnail size controls should be removed or retained after seeing the redesigned grid in place.
- Choose exact CSS values, breakpoints, spacing, and transition timings that best satisfy the locked decisions.

## Deferred Ideas

- Category sections remain Phase 2.
- Photography gallery entries remain Phase 3.
- Authoring/validation/template safety remains Phase 4.