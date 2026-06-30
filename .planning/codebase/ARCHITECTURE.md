---
last_mapped: 2026-06-30
focus: arch
---

# Architecture

## Summary

The codebase is a data-driven static portfolio. HTML files provide page shells, text files provide content records, JavaScript fetches those records at runtime, and CSS controls presentation. There is no server-side layer or client-side framework.

## High-Level Pattern

- Static page shell: `index.html`, `about.html`, and `Projects/*/*.html` define containers and script/style links.
- Text-file content model: `Config/*.txt` and `Projects/*/*.txt` are the content database.
- Browser renderer modules: `JS/*.js` fetch text records, parse delimiters or lines, create DOM nodes, and append them to known containers.
- CSS modules: `CSS/*.css` are loaded directly and sometimes aggregated through `CSS/main.css` for project pages.

## Homepage Data Flow

1. `index.html` loads `JS/userinformation.js?v=1.4`, `JS/index.js?v=1.3`, and `JS/resize-thumbnails.js?v=1.2`.
2. `JS/userinformation.js` fetches `Config/userinformation.txt?v=1.4` and appends a `.user-info-panel` into `.top-container`.
3. `JS/index.js` fetches `Config/projects.txt?v=1.2` to get project folder names.
4. For each project, `JS/index.js` fetches `Projects/<Project Name>/description.txt?v=1.2` and `media.txt?v=1.2`.
5. `JS/index.js` parses title, description, tags, thumbnail URL, and HTML filename from `description.txt` using `---` separators.
6. Project cards are built with `createThumbnail()` and appended to `#thumbnail-container`.
7. `JS/resize-thumbnails.js` mutates `grid-template-columns` and stores the preferred min width in `localStorage`.

## Project Page Data Flow

1. Each project page, for example `Projects/Branding and UIUX RED PRODUCTIONS/branding-red-productions.html`, loads `../../CSS/main.css?v=1.2`, `../../JS/userinformation.js?v=1.4`, and `../../JS/projects.js?v=1.2`.
2. `JS/projects.js` fetches local `description.txt`, `media.txt`, and `stats.txt` from the current project folder.
3. Description content populates `#project-title`, `#project-description`, and `#project-tags`.
4. Media lines are parsed into image/video/embed elements and appended to `#project-media`.
5. Stats lines are parsed into `.stat` blocks using an icon map for known labels.
6. Previous/next buttons and arrow keys use `Config/projects.txt` order to navigate between project folders.

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