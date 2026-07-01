---
id: 260701-gex
status: complete
created: 2026-07-01
completed: 2026-07-01
type: quick
---

# EXIF Photo Detail Metadata

Use ExifTool to extract image details for the Photography section and render those details in the photo detail page.

## Scope

- Locate the installed ExifTool executable.
- Generate `Projects/Photography/metadata.json` from the full-size Photography images.
- Render camera, lens, settings, focal length, date, dimensions, orientation, and file name when available.
- Make the photo detail view follow the existing project page layout reference.

## Verification

- ExifTool read 32 Photography image files.
- `metadata.json` contains 32 records.
- `node --check JS/photography.js` passed.
- Sample metadata includes Sony camera model, lens model, and ISO fields.
