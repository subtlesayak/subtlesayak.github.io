---
status: complete
completed: 2026-07-01
commit: 2ba5797
---

# Summary

Added adaptive thumbnail text sizing across the existing ten resize steps. The grid now sets matching CSS variables for title font size, overlay icon size, and inset whenever the plus/minus controls change the thumbnail count.

The thumbnail CSS now uses those variables, so small dense grids get smaller titles and larger grids restore larger text. Cache references were bumped for the changed assets.
