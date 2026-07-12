---
quick_id: 260712-kwv
status: complete
---

# Scannable Card Metadata and Curated Ordering

## Goal

Make the portfolio faster to scan and easier to curate while preserving optional, beginner-editable text-file conventions.

## Tasks

1. Add optional project `card.txt` metadata and `Config/selected-work.txt`, then render curated projects first with short labels and one-line context.
2. Add consistent Article, Tool, and Photography labels, plus optional article `author-note.txt` rendering.
3. Update templates, authoring documentation, validation, styles, and cache versions for the new conventions.

## Verification

- Validate selected-work ordering, fallback behavior, and optional note loading.
- Run JavaScript syntax checks and `node tools/validate-content.js`.
- Verify affected routes and assets through a local static server.
- Attempt rendered desktop/mobile QA with the in-app browser.
