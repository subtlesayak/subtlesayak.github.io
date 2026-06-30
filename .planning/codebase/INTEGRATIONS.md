---
last_mapped: 2026-06-30
focus: tech
---

# Integrations

## Summary

The site has no backend integrations, database connections, authentication provider, or webhook flow. Integrations are static-browser dependencies: external media hosts, CDN-hosted libraries, social links, and GitHub Pages hosting.

## Hosting And Repositories

- The published site is `https://subtlesayak.github.io/`.
- The GitHub Pages remote is `pages`, pointing at `https://github.com/subtlesayak/subtlesayak.github.io.git`.
- The original template remote is `origin`, pointing at `https://github.com/artofpilgrim/portfolio-template.git`.
- The current working branch is `codex/deploy-pages`, tracking `pages/main`.

## External CSS And Font Services

- Google Material Symbols is loaded from `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined...`.
- Google Fonts Poppins is loaded from `https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap`.
- Font Awesome is loaded from `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css`.
- If any of these CDNs fail, icons or typography degrade because there is no local fallback bundle.

## External Media Services

- Project thumbnails and media commonly use Behance CDN URLs in `Projects/*/description.txt` and `Projects/*/media.txt`.
- `JS/index.js` reads thumbnail URLs directly from `description.txt`.
- `JS/projects.js` renders image, video, YouTube, Sketchfab, and Marmoset-style embeds based on URL patterns in `media.txt`.
- Local profile imagery is stored at `Resources/profile/sayak-profile.jpg` and referenced from `Config/userinformation.txt`.

## Social And Contact Links

- `Config/userinformation.txt` currently includes X, YouTube, LinkedIn, Behance, GitHub, and email.
- `JS/userinformation.js` maps domains to Font Awesome classes with `socialIconMap`.
- Email is rendered only when a config line matches the email regex, preventing blank lines from becoming mail icons.
- Links are opened with `target="_blank"`; most generated links do not set `rel="noopener noreferrer"`.

## Project Detail Embeds

- `JS/projects.js` creates YouTube embeds from `youtube.com` URLs by reading the `v` query parameter.
- `JS/projects.js` creates Sketchfab embeds by extracting a model id from the URL suffix.
- `.mview` handling is present for Marmoset viewer-style entries, but no local runtime or viewer library is bundled.

## Data Boundaries

- There is no private API or server-side secret handling.
- Text files under `Config/` and `Projects/` are public content because they are served directly by GitHub Pages.
- Any future credentials, private email tokens, analytics IDs, or form endpoints must not be placed in these text files.

## Operational Dependencies

- The site requires a static server or GitHub Pages for `fetch()` to load local `.txt` files reliably; direct `file://` use may fail in browsers because of fetch restrictions.
- Remote project images and CDNs are single points of failure for visual completeness.
- Manual cache query bumps are required after changing fetched config or script behavior.