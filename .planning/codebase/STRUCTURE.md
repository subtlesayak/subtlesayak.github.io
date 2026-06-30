---
last_mapped: 2026-06-30
focus: arch
---

# Structure

## Repository Root

- `index.html` - portfolio grid page.
- `about.html` - profile/about page.
- `README.md` - minimal project readme.
- `LICENSE` - MIT license from the source template.
- `.planning/codebase/` - GSD codebase map generated for this repo.

## Config Directory

`Config/` acts as the site content source for cross-page data.

- `Config/projects.txt` - ordered list of project folder names.
- `Config/userinformation.txt` - profile photo, name, title, location, social URLs, GitHub, email.
- `Config/summary.txt` - about page summary copy.
- `Config/skills.txt` and `Config/software.txt` - line-based tag lists.
- `Config/recommendations.txt` - recommendation carousel records separated by `---`.
- `Config/productions.txt` - education/experience records separated by `---`.

## JavaScript Directory

`JS/` contains browser modules grouped by page or component.

- `JS/index.js` - homepage project grid renderer.
- `JS/projects.js` - project detail renderer, media loader, stats renderer, and keyboard navigation.
- `JS/userinformation.js` - shared profile and social link renderer.
- `JS/resize-thumbnails.js` - homepage thumbnail size controls.
- `JS/summary.js`, `JS/skills.js`, `JS/recommendations.js`, and `JS/productions.js` - About page renderers.

## CSS Directory

`CSS/` contains page-level and component-level styles.

- `CSS/indexstyle.css` - homepage shell layout.
- `CSS/thumbnailstyle.css` - homepage project card grid and resize buttons.
- `CSS/aboutstyle.css` - about page shell layout.
- `CSS/projectsstyle.css` - project detail split-view layout.
- `CSS/main.css` - project-page import aggregator.
- `CSS/userinformationstyle.css` - shared profile/social styles.
- `CSS/tagsstyle.css`, `CSS/statsstyle.css`, `CSS/navigation.css`, `CSS/slider.css`, `CSS/readmore.css`, and `CSS/b2t.css` - project page components.
- `CSS/recommendationsstyle.css`, `CSS/productionsstyle.css`, and `CSS/softwareskillsstyle.css` - about page sections.

## Projects Directory

Each real project folder under `Projects/` usually contains:

- one HTML shell named for the project slug.
- `description.txt` with title, description, tags, thumbnail URL, and HTML filename.
- `media.txt` with media URLs and optional captions.
- `stats.txt` with key-value stats.

Current listed projects in `Config/projects.txt`:

- `Projects/Branding and UIUX RED PRODUCTIONS/`
- `Projects/Namma Metro App Case Study/`
- `Projects/AyuRest Mental Health Companion App/`
- `Projects/University Website Analysis Mock Redesign/`
- `Projects/Google Pay Homepage Redesign/`
- `Projects/Visual Design Diary/`
- `Projects/Experimental Y2K Web Design Format/`
- `Projects/Exploring Color Harmony with Posters/`

## Resources Directory

- `Resources/profile/sayak-profile.jpg` - local profile image used by `Config/userinformation.txt`.
- `Resources/favicon/pilfav.png` - favicon referenced by site pages.
- `Resources/Example Project/` - template/example project content.

## Template And Legacy Areas

- `Projects/Example Project/` and `Resources/Example Project/` are template examples.
- `Projects/BigMegaGunExample/` appears to be legacy/demo content and is not currently listed in `Config/projects.txt`.
- These areas are useful references but may confuse future automation unless marked as templates or excluded.

## Naming Conventions

- Project folder names are human-readable and contain spaces, ampersands, and uppercase letters.
- Project page filenames are lowercase slug-style HTML names.
- CSS and JS files use lowercase descriptive names without modules or bundling.
- Data format conventions are implicit in the parser code rather than documented in a schema.

## Deployment Structure

- The repo root is also the web root for GitHub Pages.
- Paths in HTML commonly use `../` or `../../` prefixes depending on page depth.
- Some root pages use parent-relative paths like `../CSS/...`, which work on GitHub Pages but are easy to break if the site is moved under a subdirectory.