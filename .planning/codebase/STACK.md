---
last_mapped: 2026-06-30
focus: tech
---

# Stack

## Summary

This repository is a static portfolio website for GitHub Pages. It uses plain HTML, CSS, and browser JavaScript with text-file configuration instead of a build system, package manager, or server framework.

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