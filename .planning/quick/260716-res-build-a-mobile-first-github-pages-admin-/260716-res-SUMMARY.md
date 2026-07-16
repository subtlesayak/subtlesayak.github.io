---
quick_id: 260716-res
status: complete
date: 2026-07-16
code_commit: f5e43a3
---

# Mobile portfolio publisher complete

Implemented a static `/admin/` dashboard for creating and publishing portfolio projects from a phone or desktop.

## Delivered

- Fine-grained GitHub token connection with repository-contract verification.
- Correct default target: `subtlesayak/subtlesayak.github.io` on `main`.
- Responsive project editor, local text drafts, live preview, cover and 12-image gallery workflow, drag reordering, and optional external media URLs.
- Browser-side WebP conversion and resizing for phone photos.
- Serialization of the portfolio's six-file project contract and SEO-aware HTML shell.
- One atomic Git tree/commit per publish, followed by a non-forced branch update that triggers GitHub Pages.
- Setup, security, publishing behavior, and practical-limit documentation.

## Verification

- `node --check` passed for all JavaScript modules.
- `node tools/validate-content.js` passed.
- `git diff --check` passed before commit.
- Serializer test produced the expected project text, HTML, cover, and gallery paths.
- Required DOM contract and embedded-token scan passed.
- Playwright fallback verified 1440×1000 desktop and 390×844 mobile rendering after the in-app browser was blocked by Windows `CreateProcessWithLogonW` error 1168.
- Mocked end-to-end GitHub flow verified repository connection, live preview updates, two-image gallery, atomic publish requests, success state, canonical project link, and zero mobile horizontal overflow.
- The only console 404 was the intentional pre-publish project-folder existence check.
- The normal `view_image` helper was also blocked by error 1168; the same PNGs were loaded and inspected directly from base64 output instead.

## Fidelity ledger

- Layout: sidebar/editor/preview desktop structure and single-column mobile editor match the concept.
- Palette: true near-black, charcoal borders, neutral type, amber primary actions preserved.
- Typography: compact DM Sans UI chrome and Georgia portfolio preview hierarchy implemented.
- Media: cover frame, horizontal mobile gallery, removal controls, and completed states verified.
- Responsive behavior: desktop persistent actions and mobile sticky `Preview & publish` action verified without overflow.
- Publish state: focused modal, progress steps, success copy, and live-project action verified.

No real GitHub publish was performed during QA; all remote requests were intercepted with deterministic mocks.
