# Portfolio Authoring Guide

This site is intentionally editable without a build step. Most content lives in folders and `.txt` files.

## Projects

To add a portfolio project:

1. Copy an existing folder inside `Projects/`.
2. Rename the folder.
3. Edit these required files:
   - `description.txt`
   - `media.txt`
   - `stats.txt`
   - `categories.txt`
4. Add the folder name to `Config/projects.txt`.

### `description.txt`

Use five sections separated by `---`:

```txt
Project Title
---
Project description
---
tag one, tag two
---
thumbnail image URL or local path
---
project-page.html
```

### `media.txt`

List one media URL or local path per line. A text line after a media URL becomes that media item's caption.

### `stats.txt`

Use one stat per line:

```txt
Role: UI/UX Designer
Timeline: 2025
Tools: Figma, Photoshop
```

### `categories.txt`

Use category slugs, one per line. Category labels and order live in `Config/categories.txt`.

## Photography

Photography lives in `Projects/Photography/`.

- Add image files to `Projects/Photography/`.
- Add image filenames to `Projects/Photography/media.txt`.
- Edit `Projects/Photography/entry.txt` for the collection title, date, location, context, and captions.

`entry.txt` format:

```txt
Collection Title
---
Date
---
Location
---
Short context
---
filename.jpg: Caption text
another-file.jpg: Another caption
```

Thumbnails can live in `Projects/Photography/thumbs/` with the same filenames as the full images.

## Articles

Articles live in `Articles/`.

- Create one folder per article.
- Add `article.txt` inside that folder.
- Add the folder name to `Config/articles.txt`.

`article.txt` format:

```txt
Article Title
---
Date
---
Short summary
---
Article body text
```

The article renderer supports simple text, `#` / `##` headings, `---` dividers, `**bold**`, and `*italic*`.

## About/Profile

Profile, summary, skills, software, and work/education content live in `Config/*.txt` files.

## Optional Validation

Before publishing, run:

```bash
node tools/validate-content.js
```

The site still works without running this script; it is only a safety helper.

## Publishing

The site is static and GitHub Pages friendly. There is no required build command. Commit and push changes to the Pages branch.

When changing CSS or JavaScript, bump the matching `?v=` cache version in the HTML files that load it.