# Portfolio Authoring Guide

This site is intentionally editable without a build step. Most content lives in folders and `.txt` files.

## About and Key Achievements

Edit the About introduction in `Config/summary.txt`. Edit `Config/achievements.txt` to add, remove, rewrite, or reorder the achievements shown beneath it.

Each achievement is a title followed by its description. Separate achievements with `---` on its own line:

```txt
Achievement title
One concise sentence explaining the result or significance.
---
Another achievement
Another concise supporting sentence.
```

## Projects

To add a portfolio project:

1. Copy `Templates/Project Template/` into `Projects/`.
2. Rename the copied folder.
3. Edit these required files:
   - `description.txt`
   - `media.txt`
   - `stats.txt`
   - `categories.txt`
4. Copy an existing project HTML page, rename it, and put that filename in `description.txt`.
5. Add the folder name to `Config/projects.txt`.

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

## Client Websites

Client websites appear in their own section above the Portfolio project grid. Edit `Config/client-websites.txt` to add, remove, rewrite, or reorder them.

Each website uses six sections separated by `---`:

```txt
Website Name
---
Client Website
---
One-sentence description of the website and your contribution.
---
https://example.com/
---
Resources/client-websites/example.webp
---
UI/UX, Responsive Web Design, Client Work
```

The sections are: name, short label, description, live website URL, thumbnail image path, and comma-separated tags. Add an optimized preview image to `Resources/client-websites/`, then use its path in the fifth section. Move a complete six-section block to change its position.

### Portfolio Section Divider

The prominent divider and the `Portfolio Works` heading between Client Websites and the remaining portfolio projects are intentionally editable without any tooling:

- Change the visible `Portfolio Works` heading and its description in `index.html` by searching for `portfolio-work-heading`.
- Change its color, line thickness, or spacing in `CSS/indexstyle.css` by editing `--portfolio-divider-color`, `--portfolio-divider-thickness`, and `--portfolio-divider-spacing` near the top of the file.
- Increase the cache number on the `indexstyle.css` link in `index.html` after changing the divider CSS so returning visitors receive the update immediately.

## Photography

Photography is collection-based. The existing root collection lives in `Projects/Photography/`, and future collections can live in `Projects/Photography/Collections/`.

### Root Collection

- Add image files to `Projects/Photography/`.
- Add image filenames to `Projects/Photography/media.txt`.
- Edit `Projects/Photography/entry.txt` for the collection title, date, location, context, and captions.
- Keep `.` in `Projects/Photography/collections.txt` to show this root collection.

### New Photography Collection

1. Copy `Templates/Photography Collection Template/` into `Projects/Photography/Collections/`.
2. Rename the copied folder, for example `Campus Walk`.
3. Add full-size photos inside the copied folder.
4. Add optional thumbnail files with the same filenames inside `thumbs/`.
5. Edit `entry.txt` and `media.txt`.
6. Add the folder name to `Projects/Photography/collections.txt`.

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

`media.txt` format:

```txt
filename.jpg
another-file.jpg
```

## Articles

Articles live in `Articles/`.

1. Copy `Templates/Article Template/` into `Articles/`.
2. Rename the copied folder.
3. Edit `article.txt`.
4. Add the folder name to `Config/articles.txt`.

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

## Site Info

The quiet footer line comes from `Config/site.txt`. Keep it short, for example:

```txt
Last updated: July 2026
```

The sitemap page is `sitemap.html`; it reads the same project, photography, and article config files as the rest of the site.

## About/Profile

Profile, summary, skills, software, and work/education content live in `Config/*.txt` files.

## Optional Validation

Before publishing, run:

```bash
node tools/validate-content.js
```

Known legacy missing-media warnings can be documented in `Config/validation-ignore.txt`.

The site still works without running this script; it is only a safety helper.

## Publishing

The site is static and GitHub Pages friendly. There is no required build command. Commit and push changes to the Pages branch.

When changing CSS or JavaScript, bump the matching `?v=` cache version in the HTML files that load it.
