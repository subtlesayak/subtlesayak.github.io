# Subtle Sayak Portfolio

[View the live portfolio](https://subtlesayak.github.io/) | [Use the reusable template](https://github.com/subtlesayak/portfolio-template) | [Original inspiration](https://github.com/artofpilgrim/portfolio-template)

A static portfolio for Subtle Sayak, a UI/UX and visual designer based in Bengaluru. The site presents design case studies, photography collections, articles, public software projects, and professional experience without a framework or build step.

The implementation stays deliberately simple: plain HTML, CSS, JavaScript, folders, and editable text files. GitHub Pages serves the repository directly.

## Browse The Site

- **Portfolio** - selected UI/UX, branding, visual-design, and product work.
- **Photography** - event and collection galleries with individual photo views and available EXIF details.
- **Articles** - long-form notes and process writing rendered from text files.
- **Projects** - public tools and apps with user-facing and GitHub links.
- **About** - summary, software knowledge, skills, experience, education, projects, and activities.

## Current Experience

- Responsive project and photography grids with ten thumbnail-size steps.
- Auto, dark, and light themes stored in the browser.
- Optional region-based e-ink refresh effect.
- Circular glass navigation for detail pages, including previous, next, back, and back-to-top controls.
- Adjacent-image preloading in photography detail views.
- Locally hosted project media instead of a runtime dependency on Behance's image CDN.
- Search and generative-engine discovery files: `robots.txt`, `sitemap.xml`, and `llms.txt`.
- Static content validation before publishing.

## Technology

- HTML5
- CSS3
- Plain browser JavaScript
- Text-file and folder-based content
- GitHub Pages

There is no package installation, database, server application, bundler, or production build command.

## Repository Map

```text
Articles/                 One folder per article
Config/                   Profile, ordering, labels, About content, and site settings
CSS/                      Shared and page-specific styling
JS/                       Browser-side content loaders and interactions
Projects/                 Portfolio project folders and photography collections
Resources/                Profile, favicon, resume, and shared public assets
Templates/                Starter folders for projects, photography, and articles
tools/                    Content validator and Behance media importer
index.html                Portfolio
photography.html          Photography
articles.html             Articles
projects.html             Public software projects
about.html                About
sitemap.html              Human-readable sitemap
```

## Editing Content

Most content changes do not require touching CSS or JavaScript.

| Content | File or folder |
| --- | --- |
| Name, role, location, intro, social links, resume | `Config/userinformation.txt` |
| About summary | `Config/summary.txt` |
| Software and skills | `Config/software.txt`, `Config/skills.txt` |
| Experience and education | `Config/productions.txt` |
| Portfolio project order | `Config/projects.txt` |
| Selected-work priority | `Config/selected-work.txt` |
| Public software projects | `Config/codeprojects.txt` |
| Article order | `Config/articles.txt` |
| Quiet last-updated line | `Config/site.txt` |
| Project case studies | `Projects/<Project Name>/` |
| Photography | `Projects/Photography/` |
| Articles | `Articles/<Article Name>/article.txt` |

See [AUTHORING.md](AUTHORING.md) for the file formats and complete authoring workflow. The starter folders under `Templates/` can be copied when adding new work.

## Preview Locally

The pages load text files with `fetch()`, so opening `index.html` directly may not work in every browser. Run a small local server from the repository root:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Validate Before Publishing

With Node.js installed, run:

```bash
node tools/validate-content.js
```

The validator checks required configuration, project metadata formats, local media paths, article files, photography collections, and common missing-file mistakes.

Successful output:

```text
Content validation passed.
```

## Local Project Media

Project galleries use files inside each project's `assets/` folder. Imported folders include `assets/source-manifest.json` with the original public URLs, byte counts, and SHA-256 checksums.

Preview a Behance import without changing files:

```bash
node tools/import-behance-media.js --dry-run
```

Remove `--dry-run` to download display-sized images and update the corresponding `description.txt` and `media.txt`. The importer only processes public `behance.net/gallery/` links already present in project descriptions.

Run the content validator after importing or replacing media.

## Publishing

The live site is deployed from the `main` branch of [`subtlesayak/subtlesayak.github.io`](https://github.com/subtlesayak/subtlesayak.github.io).

1. Preview and validate changes locally.
2. Review the exact files being committed.
3. Push the public site files to `main`.
4. Wait for GitHub Pages to finish deploying.
5. Refresh the live URL after deployment propagation.

## Public And Private Boundary

This repository is public and contains only files intended to support the website.

- The local publishing/admin workspace is intentionally excluded.
- Internal planning and agent workflow files are intentionally excluded.
- Environment files, credentials, private keys, editor state, dependencies, and test output are ignored.
- The profile, portfolio media, social links, and downloadable resume are intentionally public because they are presented by the live site.
- No API keys or authentication tokens are required by the public website.

Never commit private client work, passwords, API keys, access tokens, identity documents, invoices, or unapproved personal information.

## Template

For a generic, beginner-editable version with placeholder content and detailed setup instructions, use [`subtlesayak/portfolio-template`](https://github.com/subtlesayak/portfolio-template).

## Credits

The site began from the plain-file approach in [`artofpilgrim/portfolio-template`](https://github.com/artofpilgrim/portfolio-template) and has been extended with photography collections, articles, public software projects, themes, responsive grid controls, e-ink refresh behavior, local media, discovery metadata, and content validation.

## License

See [LICENSE](LICENSE).