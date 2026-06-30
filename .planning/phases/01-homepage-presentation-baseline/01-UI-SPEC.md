---
phase: 01
slug: homepage-presentation-baseline
status: approved
shadcn_initialized: false
preset: none
created: 2026-06-30
---

# Phase 01 - UI Design Contract

> Visual and interaction contract for the homepage presentation baseline. Generated from Phase 1 CONTEXT.md and approved decisions.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | Font Awesome 6.4.2 for socials; Material Symbols only where already used |
| Font | Poppins |
| Implementation style | Plain HTML, CSS, and browser JavaScript |

Design direction: clean dark portfolio refresh. Preserve the simple static portfolio identity while improving spacing, readability, image containment, hover/focus states, and mobile behavior.

---

## Layout Contract

### Header/Profile
- Use a compact centered identity block.
- Profile image, name, role, one short intro line, location, social icon row, and navigation must not overlap at desktop or mobile widths.
- Keep navigation directly under the profile block.
- Social links render as a small icon row without visible text labels.
- The short intro line should be a single concise sentence, for example: `Designing simple interfaces, brands, and visual systems.`

### Project Grid
- Use a uniform card grid.
- Card media areas use a 4:3 landscape ratio.
- Project images must use `object-fit: contain` or equivalent so the full image remains visible.
- Image placeholders use a quiet dark surface so padding around contained images looks intentional.
- Use comfortable medium gaps between cards.
- Thumbnail size controls are discretionary after implementation: remove by default if the fixed grid makes them unnecessary; keep only if they remain genuinely useful and visually quiet.

---

## Interaction Contract

### Project Cards
- Desktop: title appears on hover and keyboard focus using a clean dark overlay.
- Mobile/touch: title is always visible below the image.
- Cards show title only in Phase 1. Do not add tags, tools, category chips, or stats to the card surface.
- Long titles wrap to two lines and then clamp.
- Keyboard focus must reveal the same title overlay as hover and retain a visible focus indication.

### Motion
- Use quiet micro-interactions only.
- Hover/focus transitions should feel smooth and quick.
- Avoid expressive page animations, animated backgrounds, or large motion effects.
- Respect `prefers-reduced-motion` by removing non-essential transforms/transitions.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline alignment |
| sm | 8px | Compact element spacing, small nav padding |
| md | 16px | Card padding, default element spacing |
| lg | 24px | Header groups, card gaps on mobile |
| xl | 32px | Desktop grid gaps, header-to-grid spacing |
| 2xl | 48px | Major vertical separation |
| 3xl | 64px | Maximum page-level breathing room |

Exceptions: none unless required to preserve existing icon dimensions.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px-16px | 400 | 1.5 |
| Label | 12px-13px | 500 | 1.3 |
| Heading | 20px-28px | 600 | 1.2 |
| Display/Profile name | 32px-48px responsive clamp | 600-700 | 1.05-1.15 |
| Project card title | 14px-16px | 600 | 1.25 |

Typography rules:
- Keep Poppins.
- Do not scale font size directly with viewport width.
- Use `clamp()` only with fixed rem/px boundaries when needed for profile-name safety.
- Letter spacing should remain `0`.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #101010 | Page background |
| Secondary (30%) | #171717 | Header surfaces, card surfaces, image placeholder background |
| Secondary raised | #202020 | Hover/focus surface and subtle borders |
| Text primary | #f2f2f2 | Main readable text |
| Text secondary | #a9a9a9 | Role, location, metadata, secondary text |
| Accent (10%) | #edb049 | Active nav, focus, subtle highlights only |
| Overlay | rgba(0, 0, 0, 0.72) | Desktop card title overlay |
| Destructive | #d9534f | Destructive actions only, not expected in Phase 1 |

Accent reserved for: active navigation state, focus ring/accent line, selected state, and small text highlights. Do not apply the gold accent to all links, all icons, or broad backgrounds.

---

## Shape And Borders

- Use small crisp radii: 6px-8px for cards and controls.
- Use subtle borders such as `1px solid rgba(255,255,255,0.08)` on card/surface edges.
- Avoid very rounded pill-heavy styling except where the existing nav pattern clearly requires compact active states.
- Avoid nested cards and decorative gradient/orb backgrounds.

---

## Responsive Rules

- Mobile must show project titles without hover.
- Mobile header must avoid crowding: profile image, text, social icons, and nav should stack with stable spacing.
- Grid should collapse to a single column or readable narrow layout before text or controls overlap.
- Card dimensions must be stable so image loading, overlay text, and hover/focus states do not shift layout.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Project card title as the link to open work |
| Header intro line | `Designing simple interfaces, brands, and visual systems.` or equivalent one-line text from config/content |
| Empty state heading | `No projects found` |
| Empty state body | `Add project folders to Config/projects.txt to show work here.` |
| Error state | `Projects could not load. Check project files and refresh.` |
| Destructive confirmation | Not applicable in Phase 1 |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registries | none | do not use |

---

## Implementation Notes For Planning

- Likely files: `index.html`, `CSS/indexstyle.css`, `CSS/thumbnailstyle.css`, `CSS/userinformationstyle.css`, `JS/index.js`, `JS/userinformation.js`, and possibly `JS/resize-thumbnails.js`.
- If scripts or styles change, update relevant query-string cache versions in HTML/script references.
- Do not introduce a build step, dependency manager, component framework, or CMS.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-06-30