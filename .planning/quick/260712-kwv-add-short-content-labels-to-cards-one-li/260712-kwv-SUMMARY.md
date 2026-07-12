---
quick_id: 260712-kwv
status: complete
commit: e3a5e0d
---

# Scannable Card Metadata and Curated Ordering Summary

Added beginner-editable card metadata, curated homepage ordering, consistent content labels, and optional article author notes without changing the static text-and-folder content model.

## Delivered

- Added optional two-line `card.txt` metadata for every configured portfolio project and its reusable template.
- Added `Config/selected-work.txt` so selected work appears first in a user-controlled order.
- Added consistent Article, Tool, Photography, and project labels plus one-line project context.
- Added optional `author-note.txt` rendering and template guidance for articles.
- Extended content validation and bumped affected static-asset cache versions.

## Verification

- JavaScript syntax checks passed for five changed scripts.
- `node tools/validate-content.js` passed.
- Git diff whitespace and CSS brace checks passed.
- All 13 configured projects have valid card metadata; all five selected-work entries are unique.
- Main pages and new assets returned HTTP 200 from a local static server.
- Common secret, credential, sensitive-extension, and oversized-untracked-file scans passed.
- Rendered browser QA was attempted, but the Windows browser runtime could not start (`CreateProcessWithLogonW 1168`).

## Commit

- `e3a5e0d feat: add curated card metadata`
