---
phase: 02
slug: category-based-browsing
status: approved
shadcn_initialized: false
preset: none
created: 2026-06-30T17:48:07Z
---

# Phase 02 - UI Design Contract

> Visual and interaction contract for category-based homepage browsing. This contract preserves the Phase 1 calm portfolio baseline while adding category sections that remain simple to edit.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | Font Awesome only for existing media overlay icons; no new icon system required |
| Font | Poppins |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tiny label and counter gaps |
| sm | 8px | Category header metadata gaps, focus offsets |
| md | 16px | Mobile section padding, heading/body spacing |
| lg | 24px | Desktop section padding and existing card grid gap |
| xl | 32px | Category section internal spacing |
| 2xl | 48px | Desktop category-to-category spacing |
| 3xl | 64px | Reserved for major page breaks only; avoid by default |

Exceptions: none. Use existing Phase 1 card dimensions and gaps unless a category wrapper requires the tokens above.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14-15px | 400 | 1.5 |
| Label | 12-13px | 500-600 | 1.3 |
| Section Heading | 22-28px desktop, 19-22px mobile | 600 | 1.2 |
| Card Title | existing 15px | 600 | 1.25 |
| Small Count/Meta | 12px | 500 | 1.3 |

Section headings must be smaller than the profile name and larger than card titles. Avoid hero-scale type inside category sections.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #101010 | Page background and top area |
| Secondary (30%) | #171717 / #202020 | Bottom surface, category bands, card placeholders |
| Accent (10%) | #edb049 | Active nav, focus rings, subtle category accent, small counts |
| Muted text | #a9a9a9 | Category descriptions, project counts, secondary labels |
| Destructive | not applicable | No destructive actions in this phase |

Accent reserved for: active nav, keyboard focus, category count/eyebrow highlights, and subtle section dividers. Do not turn every heading or card into gold.

---

## Layout Contract

### Category Sections

- Render category groups as vertical homepage sections inside the existing bottom content area.
- Each section has a compact header with category label, optional short description, and project count.
- Section headers are unframed; do not put page sections inside decorative cards.
- Category sections reuse the existing thumbnail card component and 4:3 image presentation.
- Keep gaps medium and predictable: category section gap around 48px desktop, 32px mobile; card grid gap remains close to Phase 1.
- If a category has no projects, show a quiet text-only empty state for that section or omit the section if the config marks it hidden. Do not show broken blank grids.

### All View

- The visitor must have a clear way to see all projects.
- Preferred layout: All Work appears first or as a clearly accessible complete-project section, followed by dedicated category sections.
- Avoid duplicating the entire card grid too many times if it makes the homepage too long. The implementation may use a compact All section or a simple section switch, but it must stay obvious and accessible.

### Mobile

- Mobile category headers stack above their grids.
- Category section labels and counts must not overlap card titles.
- Mobile cards keep Phase 1 behavior: titles visible below images without hover.
- Horizontal scrolling is not allowed for the main page or category sections.

---

## Interaction Contract

- Category browsing should work without a heavy control panel.
- If section jump links or chips are added, they are secondary navigation aids, not the only way to browse categories.
- Keyboard focus must remain visible on category controls and project cards.
- Cards keep desktop hover/focus title overlay behavior from Phase 1.
- Motion remains quiet: short opacity/transform transitions only, covered by existing reduced-motion rules.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| All section label | All Work |
| Category fallback label | Other Work |
| Empty category heading | No projects here yet |
| Empty category body | Add a project to this category in the project text files. |
| Error state | Some project categories could not be loaded. Showing all projects instead. |
| Project count | Singular/plural count, for example `1 project` or `4 projects` |

Copy should be functional and quiet. Do not add explanatory marketing copy about how category browsing works.

---

## Content Contract

- Category labels and ordering must come from editable text content, not hard-coded rendering logic.
- Per-project category assignment must be readable by a beginner editing text files.
- Category metadata should support multiple categories per project.
- Photography must be present as a category label/section even if it has no dedicated Phase 3 gallery entries yet.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party | none | not required |

No component registry or package dependency may be introduced for this phase.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS - labels and fallbacks are concise and functional.
- [x] Dimension 2 Visuals: PASS - sectioned layout preserves Phase 1 card language and calm portfolio tone.
- [x] Dimension 3 Color: PASS - dark palette and gold accent stay restrained.
- [x] Dimension 4 Typography: PASS - section type hierarchy is bounded and does not compete with the profile header.
- [x] Dimension 5 Spacing: PASS - spacing tokens are explicit and compatible with existing CSS.
- [x] Dimension 6 Registry Safety: PASS - no registry, framework, or dependency is used.

**Approval:** approved 2026-06-30