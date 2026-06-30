<!-- GSD:project-start source:PROJECT.md -->

## Project

Subtle Sayak Portfolio is an existing static GitHub Pages portfolio that showcases UI/UX, branding, visual design, web experiments, and future photography work. The project should become a more polished personal portfolio while staying simple enough for other people to reuse as a beginner-editable template.

The site should keep its current low-friction model: plain HTML, CSS, JavaScript, and text-file content instead of a heavy framework or build pipeline.

**Core Value:** A visitor can quickly understand the designer, browse work by meaningful category sections, and open rich project/gallery entries without the website losing its simple editable structure.

### Constraints

- **Tech stack**: Plain HTML, CSS, and JavaScript - keeps the site beginner-editable and GitHub Pages friendly.
- **Content model**: Text files and folders remain the primary editing surface - other users should be able to add work without learning a framework.
- **Hosting**: GitHub Pages static hosting - no backend assumptions.
- **Design direction**: Polish should be calm and portfolio-focused, not a heavy marketing redesign.
- **Template direction**: Personal customizations should coexist with reusable examples and instructions.
- **Category model**: Categories should appear as their own homepage sections, not only as filter chips.
- **Photography model**: Photography should support multi-image event/gallery entries.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Summary

## Languages And Runtime

- HTML documents are the primary page shells: `index.html`, `about.html`, and project pages under `Projects/*/*.html`.
- CSS is split across `CSS/*.css` files and loaded directly by pages.
- JavaScript is plain browser-side ES6 loaded through script tags from `JS/*.js`.
- Runtime is the browser plus a static host. There is no Node runtime required for the site itself.
- GitHub Pages deploys the `pages/main` branch from this same static file tree.

## Page Entrypoints

- `index.html` is the portfolio grid entrypoint.
- `about.html` renders profile summary, recommendations, skills, and education/experience panels.
- Project detail pages are repeated HTML shells such as `Projects/Branding and UIUX RED PRODUCTIONS/branding-red-productions.html`.
- Legacy/template examples still exist in `Projects/Example Project/`, `Projects/BigMegaGunExample/`, and `Resources/Example Project/`.

## Browser Dependencies

- Google Material Symbols is loaded in `index.html`, `about.html`, `CSS/main.css`, and project pages.
- Google Fonts Poppins is loaded from `fonts.googleapis.com`.
- Font Awesome 6.4.2 is loaded from `cdnjs.cloudflare.com` and used for social icons and overlay icons.
- Browser APIs used include `fetch`, `Promise.all`, `DocumentFragment`, `localStorage`, `URL`, touch events, and keyboard events.

## Configuration Files

- `Config/projects.txt` lists project folder names in display order.
- `Config/userinformation.txt` provides profile image, name, role, location, social URLs, GitHub, and email.
- `Config/summary.txt`, `Config/skills.txt`, `Config/software.txt`, `Config/recommendations.txt`, and `Config/productions.txt` feed the About page.
- Each project folder has `description.txt`, `media.txt`, and `stats.txt` consumed by `JS/index.js` and `JS/projects.js`.

## Asset Storage

- Most project cover and media URLs are externally hosted on Behance CDN and are referenced directly in `description.txt` / `media.txt`.
- Local shared assets live under `Resources/`, including `Resources/profile/sayak-profile.jpg` and `Resources/favicon/pilfav.png`.
- The site currently depends on both local assets and remote image/font/CDN availability.

## Build And Tooling

- There is no `package.json`, bundler, test runner, transpiler, linter, or formatter config in the repository.
- Local verification can be done with a static server such as `python -m http.server` from the repo root.
- Deployment is via git push to `pages/main` on the `pages` remote.

## Cache Busting

- Static resources use manual query-string versions such as `?v=1.2`, `?v=1.3`, and `?v=1.4`.
- Cache versions are scattered across HTML and JS files; there is no centralized version constant.
- Recent user info changes use `JS/userinformation.js?v=1.4`; homepage project scripts use `JS/index.js?v=1.3` and `CSS/thumbnailstyle.css?v=1.3`.

## Key Files

- `JS/index.js` builds the homepage grid from `Config/projects.txt` and project metadata files.
- `JS/projects.js` renders detail page descriptions, media, stats, navigation, and keyboard controls.
- `JS/userinformation.js` injects the profile panel and social icons.
- `CSS/indexstyle.css`, `CSS/thumbnailstyle.css`, `CSS/projectsstyle.css`, and `CSS/userinformationstyle.css` define the main visual shell.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Summary

## JavaScript Style

- Scripts use browser globals and direct DOM APIs rather than modules.
- Most files register behavior through `document.addEventListener('DOMContentLoaded', ...)`.
- Async data loading is done with `fetch()` and either `async/await` or promise chains.
- DOM updates usually create elements with `document.createElement()` and batch with `DocumentFragment`.
- Several renderers use `innerHTML` for templated markup, notably `JS/recommendations.js` and `JS/projects.js`.

## Data Parsing Patterns

- Line-based config files are parsed with `split('\n').map(line => line.trim()).filter(...)`.
- Record-based config files use `---` as a delimiter, for example `Config/recommendations.txt` and project `description.txt` files.
- Project media supports special conventions: ` // ` for image comparison pairs, `*` for cover/banner marking, and URL substrings for YouTube/Sketchfab detection.
- Version query strings are hard-coded at fetch call sites, such as `?v=1.2` and `?v=1.4`.

## Error Handling

- Most fetch functions use `try/catch` or `.catch()` and log errors with `console.error`.
- User-facing fallback UI is limited; homepage has an empty-state card when no projects are configured.
- Missing or malformed project data generally logs to console instead of showing an in-page error.
- No schema validation exists for text files before rendering.

## CSS Style

- CSS is split by page and component rather than by design tokens.
- Selectors are class-heavy and direct, for example `.thumbnail`, `.user-info-panel`, `.media-container`, `.production-subpanel`.
- Dark theme colors are repeated throughout files (`#121212`, `#151515`, `#171717`, `#d7d7d7`, `grey`, `#edb049`, `#f5ba13`).
- Media queries primarily use `max-width: 600px` plus a few homepage thumbnail breakpoints.
- Some comments are descriptive remnants from template code and do not always match behavior.

## HTML Style

- Pages are static shells with placeholder containers that JavaScript fills.
- Project HTML files are nearly identical, differing mostly by filename and path depth.
- Script and stylesheet tags include manual version query strings.
- Navigation active-state logic is repeated inline in `index.html` and `about.html`.

## Content Authoring Conventions

- To add a project, create a folder under `Projects/`, add `description.txt`, `media.txt`, `stats.txt`, and an HTML shell, then add the folder name to `Config/projects.txt`.
- `description.txt` must preserve the five-part `---` format used by `JS/index.js`.
- `media.txt` captions are positional: a non-media line after a URL becomes that media item caption.
- Social links are added line-by-line to `Config/userinformation.txt`; `JS/userinformation.js` maps known domains to icons.

## Git And Release Conventions

- Changes have been committed directly to `codex/deploy-pages` and pushed to `pages/main`.
- Cache-busting query strings are bumped manually when fetched files or scripts change.
- There is no automated deploy workflow in the repo; GitHub Pages serves committed files.

## Notable Inconsistencies

- `CSS/thumbnailstyle.css` contains a duplicate `.thumbnail` rule block.
- Root pages use `../CSS/...` paths even though they live at repo root; this currently works on the deployed site but is conceptually odd.
- Font/color choices are repeated rather than centralized.
- Some external links opened with `target="_blank"` lack `rel="noopener noreferrer"`.

## Recommended Future Convention Work

- Add a small authoring guide for project folders and config text formats.
- Centralize cache version constants or update all relevant versions with a script.
- Prefer `textContent` or sanitized templating when rendering text-file content.
- Consolidate duplicated CSS and repeated inline active-navigation scripts.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Summary

## High-Level Pattern

- Static page shell: `index.html`, `about.html`, and `Projects/*/*.html` define containers and script/style links.
- Text-file content model: `Config/*.txt` and `Projects/*/*.txt` are the content database.
- Browser renderer modules: `JS/*.js` fetch text records, parse delimiters or lines, create DOM nodes, and append them to known containers.
- CSS modules: `CSS/*.css` are loaded directly and sometimes aggregated through `CSS/main.css` for project pages.

## Homepage Data Flow

## Project Page Data Flow

## About Page Data Flow

- `about.html` loads `JS/summary.js`, `JS/skills.js`, `JS/userinformation.js`, `JS/recommendations.js`, and `JS/productions.js`.
- `JS/summary.js` loads one text blob from `Config/summary.txt`.
- `JS/skills.js` loads line-based lists from `Config/software.txt` and `Config/skills.txt`.
- `JS/recommendations.js` splits `Config/recommendations.txt` on `---` and builds a carousel.
- `JS/productions.js` splits `Config/productions.txt` on `---` and creates education/experience cards.

## Page Shell Architecture

- The homepage has `.main-container`, `.top-container`, `.bottom-container`, and `#thumbnail-container`.
- Project pages have `.container`, `.media-container`, `.info-container`, and known placeholders for title, description, tags, stats, and media.
- About page has a top profile area plus bottom sections for summary, recommendations, skills, and productions.
- The profile renderer always appends a new `.user-info-panel` to `.top-container`; existing placeholder panels remain in the HTML.

## Content Format Contracts

- Project `description.txt` must contain five `---` separated sections: title, description, tags, thumbnail URL, and HTML filename.
- Project `media.txt` supports media URLs, optional descriptions, image comparison pairs separated by ` // `, and `*` markers for banner/cover entries.
- Project `stats.txt` uses `Key: Value` lines and optional parenthetical tooltip text.
- About config files use either newline lists or `---` separated records depending on renderer.

## Navigation Model

- Homepage cards link to project detail pages using the HTML filename from `description.txt`.
- Project page previous/next navigation is derived from the folder order in `Config/projects.txt`.
- Escape on project pages returns to `../../index.html`.
- `index.html` and `about.html` each add an active nav class by comparing the current path basename to link `href` values.

## Architectural Tradeoffs

- The static text-file model is easy to edit and deploy, with no build step.
- Runtime parsing makes content mistakes visible only in the browser; there is no validation step.
- Many page shells duplicate script/style references, so cache bumps and structural changes must touch multiple files.
- Direct DOM building keeps dependencies low but spreads parsing and display logic across multiple scripts.

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
