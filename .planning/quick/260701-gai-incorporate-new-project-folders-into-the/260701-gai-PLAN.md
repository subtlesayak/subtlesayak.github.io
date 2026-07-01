---
id: 260701-gai
status: complete
created: 2026-07-01
completed: 2026-07-01
type: quick
---

# Incorporate New Project Folders

Add the five user-provided project folders to the existing static portfolio grid without changing the simple HTML/CSS/JS and text-file editing model.

## Scope

- Append the new project folder names to `Config/projects.txt`.
- Add `description.txt`, `media.txt`, `stats.txt`, `categories.txt`, and a project HTML shell for each new folder.
- Use the images already present in each folder as project media.
- Keep unsupported `.tif` files out of `media.txt` while preserving the original asset in the folder.
- Bump cache versions so GitHub Pages fetches the updated project list and detail navigation.

## Projects

- `3D Modeling`
- `Alias Modeling`
- `Digital Rendering`
- `Rendering`
- `Workshop Design`

## Verification

- Static integrity check confirms each new project has a valid five-part `description.txt`, a matching HTML page, `stats.txt`, and no missing supported media references.
- Media counts verified:
  - `3D Modeling`: 57 image entries
  - `Alias Modeling`: 2 image entries
  - `Digital Rendering`: 8 image entries
  - `Rendering`: 8 image entries
  - `Workshop Design`: 11 image entries
