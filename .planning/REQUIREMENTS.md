# Requirements: Subtle Sayak Portfolio

**Defined:** 2026-06-30
**Core Value:** A visitor can quickly understand the designer, browse work by meaningful category sections, and open rich project/gallery entries without the website losing its simple editable structure.

## v1 Requirements

### Homepage Polish

- [x] **HOME-01**: Visitor can see a clean profile/header area with comfortable spacing on desktop and mobile.
- [x] **HOME-02**: Visitor can read each project title without relying on hover-only behavior.
- [x] **HOME-03**: Visitor can browse project cards in a visually consistent grid where images fit cleanly inside their placeholders.
- [x] **HOME-04**: Visitor can use the homepage on mobile without overlapping text, crowded controls, or hidden essential information.

### Categories

- [x] **CAT-01**: Visitor can browse work grouped into dedicated homepage sections such as UI/UX, Branding, Web, Visual Design, and Photography.
- [x] **CAT-02**: Visitor can still access an All view or equivalent complete project list without losing the simple portfolio overview.
- [x] **CAT-03**: Project metadata can assign each project to one or more categories using beginner-editable text-file fields.
- [x] **CAT-04**: Category section ordering and labels can be edited without changing JavaScript logic.

### Project Authoring

- [ ] **AUTHR-01**: Template user can add a new project by copying a documented folder/template and editing text files.
- [ ] **AUTHR-02**: Template user can understand required `description.txt`, `media.txt`, and `stats.txt` formats from in-repo documentation.
- [ ] **AUTHR-03**: Template user can validate that every project listed in `Config/projects.txt` has required files before publishing.
- [ ] **AUTHR-04**: Template user can update profile/social/about content through `Config/*.txt` without editing JavaScript.

### Photography

- [x] **PHOTO-01**: Visitor can browse Photography as its own homepage category section.
- [ ] **PHOTO-02**: Visitor can open a photography entry representing an event, shoot, or collection.
- [ ] **PHOTO-03**: Photography entries can display multiple images in one entry without needing a separate app or backend.
- [ ] **PHOTO-04**: Photography entries can include a title, short context, optional date/location text, and captions using beginner-editable files.

### Simplicity And Template Fit

- [ ] **TEMP-01**: Site remains deployable on GitHub Pages without a required build step.
- [ ] **TEMP-02**: Core content remains editable through plain text files and folders.
- [ ] **TEMP-03**: Any helper scripts are optional and do not prevent manual editing.
- [ ] **TEMP-04**: Template/example content is clearly separated from Sayak's live portfolio content.

### Quality And Safety

- [ ] **QUAL-01**: Project/config text-file validation catches missing files, malformed sections, and broken local asset references.
- [ ] **QUAL-02**: Generated external links opened in new tabs include safe `rel` attributes where applicable.
- [ ] **QUAL-03**: Content rendered from text files avoids unsafe `innerHTML` where simple text rendering is sufficient.
- [ ] **QUAL-04**: Cache-busting guidance or tooling reduces the chance of stale CSS/JS/config after publishing.

## v2 Requirements

### Design Enhancements

- **DES-01**: Visitor can switch between multiple homepage layout densities or presentation modes.
- **DES-02**: Visitor can use advanced filtering combinations across category, tool, and project type.

### Template Tooling

- **TOOL-01**: Template user can run a guided project generator to create project folders and metadata.
- **TOOL-02**: Template user can run a media optimization helper for local images.

### Photography Enhancements

- **PHOTOV2-01**: Visitor can view photography images in a lightbox or full-screen gallery.
- **PHOTOV2-02**: Visitor can browse photography albums by event date or location.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full framework rewrite | Conflicts with the simple static template goal. |
| Server-side CMS or database | GitHub Pages static hosting and text-file editing are sufficient for v1. |
| Heavy admin dashboard | Too complex for beginner-editable portfolio/template use. |
| Separate photography app | Photography should live inside the portfolio category/gallery model. |
| Paid booking/contact system | Not part of the current portfolio polish and template goal. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOME-01 | Phase 1 | Complete |
| HOME-02 | Phase 1 | Complete |
| HOME-03 | Phase 1 | Complete |
| HOME-04 | Phase 1 | Complete |
| CAT-01 | Phase 2 | Complete |
| CAT-02 | Phase 2 | Complete |
| CAT-03 | Phase 2 | Complete |
| CAT-04 | Phase 2 | Complete |
| AUTHR-01 | Phase 4 | Pending |
| AUTHR-02 | Phase 4 | Pending |
| AUTHR-03 | Phase 4 | Pending |
| AUTHR-04 | Phase 4 | Pending |
| PHOTO-01 | Phase 2 | Complete |
| PHOTO-02 | Phase 3 | Pending |
| PHOTO-03 | Phase 3 | Pending |
| PHOTO-04 | Phase 3 | Pending |
| TEMP-01 | Phase 4 | Pending |
| TEMP-02 | Phase 4 | Pending |
| TEMP-03 | Phase 4 | Pending |
| TEMP-04 | Phase 4 | Pending |
| QUAL-01 | Phase 4 | Pending |
| QUAL-02 | Phase 4 | Pending |
| QUAL-03 | Phase 4 | Pending |
| QUAL-04 | Phase 4 | Pending |
**Coverage:**

- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-06-30*
*Last updated: 2026-06-30 after roadmap creation*
