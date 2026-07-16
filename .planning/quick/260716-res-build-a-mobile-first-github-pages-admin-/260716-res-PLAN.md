---
quick_id: 260716-res
status: planned
date: 2026-07-16
---

# Mobile portfolio publisher

Build a responsive, static `/admin/` dashboard that lets the portfolio owner create a complete project from a phone or desktop and publish it to the `pages/main` GitHub Pages source branch.

## Design contract

- Follow the approved dark editorial concept: true near-black canvas, charcoal rails, warm amber accent, crisp neutral typography, 1px borders, modest radii, and restrained motion.
- Desktop uses a compact sidebar, editor canvas, live preview, and persistent publish actions.
- Mobile uses a single-column stepped editor with horizontally scrollable media and sticky final action.
- Keep controls code-native and accessible. Avoid marketing chrome, fake metrics, decorative cards, gradients, and glass effects.

## Implementation

1. Add `admin/index.html`, `admin/admin.css`, and focused JavaScript modules for UI state, GitHub API access, project serialization, and application orchestration.
2. Authenticate with a fine-grained GitHub personal access token supplied by the owner. Keep it in `sessionStorage` by default; offer an explicit device-only remember option.
3. Auto-detect the canonical repository and branch defaults as `subtlesayak/subtlesayak.github.io` and `main`, while keeping settings editable for template reuse.
4. Load the current project list and project template from GitHub. Support cover and gallery uploads, client-side image conversion/compression, ordering, captions, draft persistence, and a live preview.
5. On publish, create blobs and one atomic Git tree/commit containing the new project folder plus the updated `Config/projects.txt`; then update `refs/heads/main` so GitHub Pages deploys automatically.
6. Generate the existing content contract: `description.txt`, `media.txt`, `stats.txt`, `categories.txt`, `card.txt`, and an SEO-aware HTML shell cloned from `Templates/Project Template` or a known existing project.
7. Add a concise `admin/README.md` covering token permissions, phone setup, deployment behavior, limits, and revocation.

## Verification

- Run syntax/static checks available without introducing a build system.
- Serve the site locally and exercise repository connection, draft editing, media preview/reorder, generated file output, and publish confirmation without performing a real remote publish.
- Verify desktop and 360px mobile layouts in the in-app browser.
- Compare browser screenshots against the saved concept with `view_image`, document at least five fidelity checks, and fix visible drift before handoff.

