---
last_mapped: 2026-06-30
focus: concerns
---

# Concerns

## Summary

The site is small and easy to deploy, but several fragile areas come from runtime parsing, duplicated page shells, manual cache busting, external dependencies, and unsanitized rendering of public text-file content.

## Data Format Fragility

- `JS/index.js` assumes every project `description.txt` splits into title, description, tags, thumbnail URL, and HTML filename using `---`.
- `JS/projects.js` assumes `stats.txt` lines contain `:` and then calls methods on `value`; malformed stats lines can throw.
- `JS/projects.js` infers media captions by checking whether the next line looks like a media URL; unusual captions or URLs can be misclassified.
- `Config/projects.txt` is the source of navigation order, so a typo in a folder name breaks homepage rendering and previous/next navigation.

## Security And Markup Risks

- `JS/recommendations.js` builds recommendation cards with `innerHTML` from `Config/recommendations.txt` values.
- `JS/projects.js` uses `innerHTML` for formatted descriptions and generated link markup.
- Public text files are currently trusted content, but future untrusted content would require escaping/sanitization.
- Generated links using `target="_blank"` should add `rel="noopener noreferrer"` to reduce opener risk.

## Deployment And Cache Risks

- Cache versions are scattered across HTML and JavaScript files, making stale deploys likely after content or script changes.
- Different resources are on different cache versions (`v=1.2`, `v=1.3`, `v=1.4`), so it is easy to update one without the others.
- GitHub Pages CDN refresh can lag after push; live verification should poll both raw GitHub and Pages URLs.

## Layout And Responsiveness Risks

- `CSS/thumbnailstyle.css` has duplicate `.thumbnail` declarations.
- Homepage card titles appear only on hover, which is weak on touch devices.
- The resize controls in `JS/resize-thumbnails.js` are always visible and may not be needed on mobile.
- The profile renderer appends a new `.user-info-panel` instead of populating the placeholder already present in HTML shells.
- `CSS/projectsstyle.css` uses an 80/20 split for media/info that may feel cramped for long descriptions or many social icons.

## External Dependency Risks

- Many project thumbnails/media assets are remote Behance CDN URLs. If those links change or rate-limit, the portfolio loses key visuals.
- Fonts and icons depend on Google Fonts and cdnjs. There is no local fallback for Font Awesome icons.
- Project descriptions link to Behance full case studies; the local site may be thin if the remote case study is unavailable.

## Accessibility Concerns

- Hidden scrollbars in `CSS/indexstyle.css` and `CSS/aboutstyle.css` can make scrollable areas harder to discover.
- Icon-only buttons have some aria labels on project pages, but homepage resize buttons are plain `+` and `-` without descriptive labels.
- Hover-only thumbnail titles reduce discoverability for keyboard and touch users.
- Color contrast should be checked for grey text on dark backgrounds and yellow/orange text on dark panels.

## Maintainability Concerns

- Project page HTML shells are duplicated across every project folder.
- Active navigation script is duplicated inline in `index.html` and `about.html`.
- Style tokens are repeated across many CSS files instead of centralized.
- Template/demo project folders remain alongside real projects and could be accidentally included.
- There is no content validation script for the text-file database.

## Browser Robustness Concerns

- `fetch()` of local text files requires serving through HTTP; opening files directly may fail.
- `new URL(url)` in `JS/projects.js` can throw if a malformed URL reaches `convertUrlsToLinks`.
- YouTube embed logic assumes a `v` query parameter and may fail for shortened or embed URLs.
- Sketchfab id extraction uses a string split heuristic that may not match all Sketchfab URL formats.

## Priority Improvements

1. Add a validation script for project/config text files before deployment.
2. Replace or sanitize `innerHTML` rendering for content from text files.
3. Add always-visible project titles and stronger mobile card affordances.
4. Centralize cache versioning or automate query-string updates.
5. Remove duplicate CSS and consolidate repeated page shell/nav logic.
6. Add a local media policy for critical thumbnail/profile assets where possible.