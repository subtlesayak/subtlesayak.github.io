# subtlesayak.github.io
Static portfolio site for [subtlesayak.github.io](https://subtlesayak.github.io/).

## Local project media

Project galleries use files inside each project's `assets/` folder so the live site does not depend on Behance's image CDN. Each imported folder includes `assets/source-manifest.json` with source URLs, byte counts, and SHA-256 checksums.

To preview which public Behance case studies will be imported:

```powershell
node tools/import-behance-media.js --dry-run
```

Remove `--dry-run` to download the display-sized images and update the project's `description.txt` and `media.txt`. The importer only processes public `behance.net/gallery/` links already present in project descriptions.

After importing or editing project media, run:

```powershell
node tools/validate-content.js
```
