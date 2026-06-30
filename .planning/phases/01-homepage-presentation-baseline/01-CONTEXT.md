# Phase 1: Homepage Presentation Baseline - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase improves only the existing homepage presentation baseline: the profile/header area, project-card readability, grid stability, thumbnail image fit, desktop/mobile spacing, and restrained visual polish. It does not add category sections, photography galleries, project authoring tooling, validation scripts, or project-detail page redesigns.

</domain>

<decisions>
## Implementation Decisions

### Profile/Header Layout
- **D-01:** Use a compact centered identity block with better spacing and no overlap.
- **D-02:** Add one short intro line under the role. Keep it brief enough that projects still start quickly.
- **D-03:** Present social links as a small icon row.
- **D-04:** Keep the navigation directly under the profile block.

### Project Card Readability
- **D-05:** On desktop, project titles appear on hover and keyboard focus only.
- **D-06:** On mobile, project titles are always visible below the image so touch users are not dependent on hover.
- **D-07:** Desktop hover/focus treatment should be a clean dark overlay with the project title.
- **D-08:** Cards should show title only. Do not add tags, tools, categories, or extra metadata in Phase 1.
- **D-09:** Long titles should wrap to two lines and then clamp to avoid uneven card growth.
- **D-10:** Keyboard focus should reveal the same title overlay as mouse hover.

### Grid Rhythm And Image Fit
- **D-11:** Use a uniform card grid rather than dense gallery or editorial/featured layout.
- **D-12:** Project images must use contain behavior with a quiet background so the full image fits inside the placeholder.
- **D-13:** Use landscape 4:3 card media areas.
- **D-14:** Use comfortable medium gaps between cards.
- **D-15:** Existing thumbnail size controls are implementation discretion after the redesigned grid is visible. Default to removing them if the stable grid makes them unnecessary; keep only if they genuinely help without adding clutter.

### Visual Polish Level
- **D-16:** Use a clean dark portfolio refresh, preserving the dark identity while improving spacing, borders, typography, image backgrounds, hover states, focus states, and mobile polish.
- **D-17:** Use the existing warm/gold accent subtly for active nav, focus, and small highlights.
- **D-18:** Use quiet micro-interactions only: smooth hover/focus overlays and gentle lifts, no flashy animation.
- **D-19:** Keep Poppins and tune sizing/weight instead of changing the typeface.
- **D-20:** Use small-radius crisp cards and controls. Avoid very rounded or overly soft UI.

### the agent's Discretion
- Decide whether to remove or retain thumbnail size controls after implementing the new grid. The preferred default is removal if the grid feels complete without them.
- Use standard responsive breakpoints and layout details that best satisfy the locked desktop/mobile presentation decisions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Intent And Scope
- `.planning/PROJECT.md` - Defines the project as a simple static portfolio/template and captures the user's simplicity constraints.
- `.planning/REQUIREMENTS.md` - Defines Phase 1 requirements HOME-01 through HOME-04.
- `.planning/ROADMAP.md` - Defines Phase 1 goal, boundaries, dependencies, and success criteria.
- `.planning/STATE.md` - Records current project position and active focus.

### Codebase Map
- `.planning/codebase/CONVENTIONS.md` - Describes current JavaScript, CSS, data parsing, cache-busting, and authoring conventions.
- `.planning/codebase/STRUCTURE.md` - Maps page entrypoints, `Config/`, `JS/`, `CSS/`, `Projects/`, and `Resources/`.
- `.planning/codebase/STACK.md` - Confirms the plain HTML/CSS/JS static GitHub Pages stack and browser dependencies.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `index.html` - Existing homepage shell that loads the profile block, navigation, grid renderer, thumbnail styles, and resize controls.
- `JS/userinformation.js` - Renders the shared profile image, name, role, location, social links, GitHub, and email icons.
- `JS/index.js` - Fetches `Config/projects.txt` and each project `description.txt`, then builds homepage project cards.
- `CSS/userinformationstyle.css` - Controls the profile block, social row, and navigation-adjacent profile presentation.
- `CSS/indexstyle.css` - Controls the homepage shell and background/layout framing.
- `CSS/thumbnailstyle.css` - Controls project card grid, thumbnail media, overlay/title behavior, and thumbnail size controls.
- `JS/resize-thumbnails.js` - Supports existing thumbnail size controls; may be removed or kept depending on the final Phase 1 implementation.

### Established Patterns
- Site uses plain browser JavaScript and direct DOM construction. Keep implementation beginner-readable.
- Content comes from text files under `Config/` and `Projects/`. Phase 1 should not require new data fields.
- CSS is page/component-oriented rather than tokenized. Visual polish should stay scoped to homepage/profile/card styles.
- Cache-busting query strings are manual. If CSS/JS changes, update relevant query strings so GitHub Pages visitors see the new version.

### Integration Points
- Profile/header decisions connect through `Config/userinformation.txt`, `JS/userinformation.js`, and `CSS/userinformationstyle.css`.
- Card readability, title overlays, mobile title behavior, image containment, aspect ratio, and grid gaps connect through `JS/index.js` and `CSS/thumbnailstyle.css`.
- Thumbnail size control decision connects through `index.html`, `CSS/thumbnailstyle.css`, and `JS/resize-thumbnails.js`.

</code_context>

<specifics>
## Specific Ideas

- Keep the homepage simple and image-forward on desktop.
- Make mobile more explicit and readable than desktop because hover is unavailable.
- Preserve the portfolio's dark identity, but remove the cramped/overlapping feel shown in the current screenshot.
- Project images should fit inside placeholders rather than being cropped.

</specifics>

<deferred>
## Deferred Ideas

- Dedicated category sections belong to Phase 2.
- Photography gallery entries and multi-image event/shoot pages belong to Phase 3.
- Project authoring guides, validation, cache-busting tooling, and template safety belong to Phase 4.

</deferred>

---

*Phase: 1-Homepage Presentation Baseline*
*Context gathered: 2026-06-30*