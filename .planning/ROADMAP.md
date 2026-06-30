# Roadmap: Subtle Sayak Portfolio

## Overview

This MVP improves the existing static portfolio in vertical slices that remain useful after every phase: first making the homepage clearer and more reliable to browse, then adding dedicated category sections, then supporting richer photography/gallery entries, and finally making the portfolio safer and easier to reuse as a beginner-editable template without adding a required build step.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Homepage Presentation Baseline** - Visitors can understand the portfolio and browse readable project cards on desktop and mobile. (completed 2026-06-30)
- [x] **Phase 2: Category-Based Browsing** - Visitors can browse work through dedicated editable category sections while retaining a complete project overview. (completed 2026-06-30)
- [ ] **Phase 3: Photography Gallery Entries** - Visitors can open photography entries that present multi-image shoots or collections inside the existing portfolio model.
- [ ] **Phase 4: Template Authoring & Publish Safety** - Template users can add and validate content safely while preserving the no-build, text-file workflow.

## Phase Details

### Phase 1: Homepage Presentation Baseline

**Goal**: Visitors can quickly understand Sayak and browse readable, stable project cards across desktop and mobile.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04
**Success Criteria** (what must be TRUE):

  1. Visitor can see the profile/header area with comfortable spacing on desktop and mobile.
  2. Visitor can read every project title without relying on hover-only behavior.
  3. Visitor can browse project cards in a consistent grid with images fitting cleanly inside their placeholders.
  4. Visitor can use the homepage on mobile without overlapping text, crowded controls, or hidden essential information.

**Plans**: TBD
**UI hint**: yes

### Phase 2: Category-Based Browsing

**Goal**: Visitors can browse work through meaningful homepage category sections without losing access to the full portfolio.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, PHOTO-01
**Success Criteria** (what must be TRUE):

  1. Visitor can browse dedicated homepage sections for categories such as UI/UX, Branding, Web, Visual Design, and Photography.
  2. Visitor can still access an All view or equivalent complete list of projects.
  3. Template user can assign one or more categories to each project through beginner-editable text-file fields.
  4. Template user can edit category labels and ordering without changing JavaScript logic.
  5. Visitor can find Photography as its own homepage category section.

**Plans**: 1/1 plans complete

- [x] 02-01-PLAN.md

**UI hint**: yes

### Phase 3: Photography Gallery Entries

**Goal**: Visitors can open photography entries for events, shoots, or collections with multiple images and contextual details.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PHOTO-02, PHOTO-03, PHOTO-04
**Success Criteria** (what must be TRUE):

  1. Visitor can open a photography entry representing an event, shoot, or collection.
  2. Visitor can view multiple images inside one photography entry without a separate app or backend.
  3. Visitor can see photography title, short context, optional date/location text, and captions.
  4. Template user can author photography entry content through beginner-editable files.

**Plans**: TBD
**UI hint**: yes

### Phase 4: Template Authoring & Publish Safety

**Goal**: Template users can add, validate, and publish portfolio content safely while the site remains a simple static GitHub Pages template.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: AUTHR-01, AUTHR-02, AUTHR-03, AUTHR-04, TEMP-01, TEMP-02, TEMP-03, TEMP-04, QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):

  1. Template user can add a project by copying a documented folder/template and editing text files.
  2. Template user can understand required project and profile/about text-file formats from in-repo documentation.
  3. Template user can validate required files, malformed sections, and broken local asset references before publishing.
  4. Site remains deployable on GitHub Pages without a required build step, and any helper scripts remain optional.
  5. External-link safety, safer text rendering, cache-busting guidance, and template/example separation are visible in the finished template workflow.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Homepage Presentation Baseline | 1/1 | Complete    | 2026-06-30 |
| 2. Category-Based Browsing | 1/1 | Complete    | 2026-06-30 |
| 3. Photography Gallery Entries | 0/TBD | Not started | - |
| 4. Template Authoring & Publish Safety | 0/TBD | Not started | - |
