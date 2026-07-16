---
quick_id: 260716-sdq
status: planned
date: 2026-07-16
---

# Complete portfolio CMS

Expand `/admin/` from a new-project publisher into a complete GitHub-backed CMS, then deploy the tested result to `pages/main` together.

## Content surfaces

- Overview with live repository-derived counts and quick actions.
- Projects: create, edit, delete, reorder, selected-work status, metadata, cover/gallery media, and external media.
- Photography: create/edit/delete/reorder collections, metadata, captions, and uploaded images.
- Articles: create/edit/delete/reorder article folders, summaries, bodies, and author notes.
- About: profile identity/social links, summary, skills, software, recommendations, education, projects, certificates, and work experience.
- Media & resume: profile portrait replacement, favicon replacement, and versioned PDF résumé upload.
- Settings: site update text, categories, and reusable repository settings.
- Publishing: recent Git commits, current version, commit details, and history-preserving restore commits.

## Architecture and safety

- Preserve the plain HTML/CSS/JavaScript and text-file content model.
- Use the GitHub Git Data API to publish each operation as one atomic commit.
- Validate the repository contract before enabling editing.
- Keep the token session-only by default; never embed it in source or logs.
- Implement deletion using explicit tree entries scoped to the selected content folder.
- Restore older versions by creating a new commit whose tree matches the chosen historical commit; never rewrite Git history.
- Keep the existing local résumé change user-owned during development. The deployed CMS will support choosing and publishing a newer PDF from any phone.

## Design contract

- Continue the accepted Pilgrim Studio system: near-black background, charcoal surfaces, amber actions, white/cool-gray typography, restrained borders, open lists and editor drawers.
- Desktop uses persistent sidebar, content list, and editor panel/drawer.
- Mobile uses a compact bottom navigation, full-width lists, editor sheets, and sticky publish actions.
- Avoid dashboards with fake metrics, bento layouts, marketing copy, decorative gradients, and nested cards.

## Verification and release

- Syntax, serializer, secret, and repository-contract tests.
- In-app browser QA at desktop and 390×844 mobile sizes.
- Mocked GitHub API tests for create/update/delete/reorder, asset upload, commit history, and restore.
- Compare rendered screenshots with both generated design concepts using `view_image`.
- Commit code and GSD artifacts separately, preserve unrelated changes unless explicitly included, then push the tested HEAD to `pages/main` as one release.
