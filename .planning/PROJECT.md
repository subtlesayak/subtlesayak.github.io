# Subtle Sayak Portfolio

## What This Is

Subtle Sayak Portfolio is an existing static GitHub Pages portfolio that showcases UI/UX, branding, visual design, web experiments, and future photography work. The project is becoming a more polished personal portfolio while staying simple enough for other people to reuse as a beginner-editable template.

The site keeps its current low-friction model: plain HTML, CSS, JavaScript, and text-file content instead of a heavy framework or build pipeline.

## Core Value

A visitor can quickly understand the designer, browse work by meaningful category sections, and open rich project/gallery entries without the website losing its simple editable structure.

## Requirements

### Validated

- [x] Static portfolio deploys on GitHub Pages from the repository root - existing
- [x] Homepage renders a project grid from `Config/projects.txt` and per-project text files - existing
- [x] Project detail pages render descriptions, tags, stats, media, and previous/next navigation - existing
- [x] About page renders summary, skills, recommendations, and education/experience from `Config/*.txt` - existing
- [x] Shared profile block renders profile image, role, location, social links, GitHub, and email - existing
- [x] Local profile image and favicon assets are served from `Resources/` - existing
- [x] Codebase map exists under `.planning/codebase/` for brownfield planning - existing
- [x] Homepage layout, profile spacing, project card readability, image fit, and mobile presentation polished - validated in Phase 1
- [x] Category sections let visitors browse All Work, UI/UX, Branding, Web, Visual Design, and Photography - validated in Phase 2
- [x] Category labels/order and per-project category assignments are editable through text files - validated in Phase 2

### Active

- [ ] Preserve beginner-editable content authoring through simple text files and clear folder conventions.
- [ ] Make adding a project easier and less error-prone through documentation, templates, and/or lightweight validation.
- [ ] Support photography entries that can contain multiple images for an event, shoot, or collection.
- [ ] Keep the site reusable as a portfolio template without stripping away Sayak's personal portfolio use case.

### Out of Scope

- Full framework rewrite - would undermine the simplicity and beginner-editable goal.
- Server-side CMS or database - unnecessary for the static GitHub Pages workflow.
- Heavy admin dashboard - too much complexity for the current template direction.
- Removing text-file editing - text files are the core maintainability model for non-developers.
- Turning photography into a separate app - photography should be a category/gallery experience inside the portfolio.

## Context

This is a brownfield static portfolio derived from a portfolio template. It currently uses plain browser JavaScript to fetch content from `Config/*.txt` and `Projects/*/*.txt`, then renders pages client-side. The codebase map identifies the architecture as a static page shell plus text-file content database.

The homepage now uses a single simple project grid again, with Photography available as its own top navigation tab beside Portfolio and About. Category metadata files from Phase 2 remain in the repo for possible future use, but the active homepage renderer no longer shows category sections.

The user wants the site to improve in two directions at once: it should become a better personal portfolio and remain reusable for other people. Improvements should therefore favor small, teachable conventions over hidden complexity. The current project system already supports multiple media entries on detail pages, which can be adapted into photography/event galleries.

Important current concerns from the codebase map:

- Project data formats are implicit and can break if `description.txt`, `media.txt`, `stats.txt`, or `categories.txt` are malformed.
- Project page shells are duplicated across project folders.
- Cache-busting query strings are manual and scattered.
- The site relies on external Behance images and CDN-hosted fonts/icons.

## Constraints

- **Tech stack**: Plain HTML, CSS, and JavaScript - keeps the site beginner-editable and GitHub Pages friendly.
- **Content model**: Text files and folders remain the primary editing surface - other users should be able to add work without learning a framework.
- **Hosting**: GitHub Pages static hosting - no backend assumptions.
- **Design direction**: Polish should be calm and portfolio-focused, not a heavy marketing redesign.
- **Template direction**: Personal customizations should coexist with reusable examples and instructions.
- **Category model**: Categories should appear as their own homepage sections, not only as filter chips.
- **Photography model**: Photography should support multi-image event/gallery entries.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep the static text-file architecture | Simplicity and beginner editability are explicit goals | Preserved in Phases 1-2 |
| Improve both personal portfolio and reusable template value | User wants options 1 and 2, not one at the expense of the other | In progress |
| Categories should have their own homepage sections | Earlier preference, later superseded by a simpler tab request | Superseded by quick task 260701-g1m |
| Category labels/order belong in `Config/categories.txt` | Keeps section editing beginner-friendly and avoids JavaScript edits | Preserved as inactive metadata after quick task 260701-g1m |
| Per-project category assignment belongs in `Projects/*/categories.txt` | Keeps adding/editing a project folder-local and copyable | Implemented in Phase 2 |
| Prioritize visual polish, category filtering/sections, and easier project adding for v1 | These were named as the most important v1 outcomes | Visual polish and categories complete; easier project adding remains Phase 4 |
| Treat photography as multi-image entries | User wants event-style or collection-style photo entries | Photography tab exists; gallery entries pending Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-01 after quick task 260701-g1m*
