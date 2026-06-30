---
last_mapped: 2026-06-30
focus: quality
---

# Conventions

## Summary

The codebase follows simple browser-native conventions: plain scripts, direct DOM construction, text-file parsing, and component-oriented CSS files. There is no enforced formatter or linter, so conventions are informal and vary by file age.

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