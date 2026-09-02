<div align="center">
  <a href="https://subtlesayak.github.io/">
    <img src="Resources/profile/sayak-profile.jpg" width="112" height="112" alt="Portrait of Subtle Sayak">
  </a>

  <h1>Subtle Sayak Portfolio</h1>

  <p><strong>UI/UX design, visual systems, photography, writing, and useful software.</strong></p>
  <p>A calm, plain-file portfolio built to be explored by visitors and edited by beginners.</p>

  <p>
    <a href="https://subtlesayak.github.io/"><img src="https://img.shields.io/badge/Live_portfolio-Open-a76b00?style=for-the-badge&logo=githubpages&logoColor=ffffff&labelColor=171717" alt="Open the live portfolio"></a>
    <a href="https://github.com/subtlesayak/portfolio-template"><img src="https://img.shields.io/badge/Reusable_template-View-4d4d4d?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=171717" alt="View the reusable portfolio template"></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=171717" alt="JavaScript">
    <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=githubpages&logoColor=white" alt="Hosted on GitHub Pages">
    <img src="https://img.shields.io/badge/Build_step-None-2f855a?style=flat-square" alt="No build step">
  </p>

  <p>
    <a href="https://github.com/subtlesayak/subtlesayak.github.io/commits/main"><img src="https://img.shields.io/github/last-commit/subtlesayak/subtlesayak.github.io?style=flat-square&label=Updated&color=a76b00" alt="Date of the latest repository update"></a>
    <a href="https://github.com/subtlesayak/subtlesayak.github.io"><img src="https://img.shields.io/github/repo-size/subtlesayak/subtlesayak.github.io?style=flat-square&label=Public%20site&color=171717" alt="Public repository size"></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/subtlesayak/subtlesayak.github.io?style=flat-square&color=edb049" alt="MIT license"></a>
  </p>
</div>

---

## About

This repository powers the personal portfolio of **Subtle Sayak**, a UI/UX and visual designer based in Bengaluru, India. It brings client websites, design case studies, photography collections, articles, public software projects, and professional experience into one intentionally simple website.

The site uses plain HTML, CSS, JavaScript, folders, and editable text files. There is no framework, database, package installation, or production build command. GitHub Pages serves the repository directly.

> The design stays out of the way so the work can remain the focus.

## Explore

| Page | What you will find |
| --- | --- |
| [Portfolio](https://subtlesayak.github.io/) | Selected client websites plus UI/UX, branding, visual design, and product case studies. |
| [Photography](https://subtlesayak.github.io/photography.html) | Event and collection galleries, individual photo views, and available EXIF details. |
| [Articles](https://subtlesayak.github.io/articles.html) | Long-form notes, experiments, and process writing rendered from text files. |
| [Projects](https://subtlesayak.github.io/projects.html) | Public tools and apps with user-facing links and source repositories. |
| [About](https://subtlesayak.github.io/about.html) | Profile, skills, experience, education, university projects, and activities. |

## Highlights

- **Responsive work grids** with ten thumbnail-size steps, from dense overview to close inspection.
- **Dedicated client website showcase** kept separate from personal tools and open-source projects.
- **Auto, dark, and light themes** remembered locally by the browser.
- **Optional e-ink refresh mode** with region-based element rendering.
- **Focused detail views** with glass navigation for back, previous, next, and back-to-top actions.
- **Fast photography browsing** through adjacent-image preloading and viewport-fit presentation.
- **Local project media** with no runtime dependency on Behance's image CDN.
- **Search-friendly metadata** through `robots.txt`, `sitemap.xml`, and `llms.txt`.
- **Content validation** for common file, path, and formatting mistakes before publishing.

## How It Works

```text
Editable text files + content folders
                  |
       Browser-side HTML, CSS, and JS
                  |
              GitHub Pages
```

Most portfolio updates are content edits. The browser loads the configuration and project files at runtime, then builds the appropriate page without a CMS or compilation step.

## Edit Your Content

| Change | Edit |
| --- | --- |
| Name, role, location, intro, social links, resume | `Config/userinformation.txt` |
| About summary | `Config/summary.txt` |
| Software and skills | `Config/software.txt` and `Config/skills.txt` |
| Experience and education | `Config/productions.txt` |
| Portfolio project order | `Config/projects.txt` |
| Selected-work priority | `Config/selected-work.txt` |
| Client website thumbnails | `Config/client-websites.txt` and `Resources/client-websites/` |
| Public software projects | `Config/codeprojects.txt` |
| Article order | `Config/articles.txt` |
| Quiet last-updated line | `Config/site.txt` |
| Project case studies | `Projects/<Project Name>/` |
| Photography collections | `Projects/Photography/` |
| Articles | `Articles/<Article Name>/article.txt` |

Read the complete [authoring guide](AUTHORING.md) for file formats, examples, and the content workflow. Copy a starter folder from `Templates/` when adding a project, photography collection, or article.

## Quick Start

The pages fetch local text files, so opening `index.html` directly may not work in every browser. Start a small local server from the repository root:

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000), then validate the content before publishing:

```bash
node tools/validate-content.js
```

A successful check prints:

```text
Content validation passed.
```

<details>
<summary><strong>Repository map</strong></summary>

```text
Articles/                 One folder per article
Config/                   Profile, ordering, labels, About content, and settings
CSS/                      Shared and page-specific styling
JS/                       Content loaders and browser interactions
Projects/                 Portfolio projects and photography collections
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

</details>

<details>
<summary><strong>Local project media workflow</strong></summary>

Project galleries use files inside each project's `assets/` folder. Imported folders include `assets/source-manifest.json` with the original public URLs, byte counts, and SHA-256 checksums.

Preview a Behance import without changing files:

```bash
node tools/import-behance-media.js --dry-run
```

Remove `--dry-run` to download display-sized images and update the matching `description.txt` and `media.txt`. The importer processes only public `behance.net/gallery/` links already present in project descriptions.

Run the content validator after importing or replacing media.

</details>

<details>
<summary><strong>Publishing checklist</strong></summary>

The live site is deployed from the `main` branch of [`subtlesayak/subtlesayak.github.io`](https://github.com/subtlesayak/subtlesayak.github.io).

1. Preview the website locally.
2. Run `node tools/validate-content.js`.
3. Review the exact files being committed.
4. Push the public website files to `main`.
5. Wait for GitHub Pages to deploy, then check the live URL.

</details>

## Public And Private Boundary

This is a public repository and should contain only files intended to support the website.

- Local publishing and administration workspaces are intentionally excluded.
- Internal planning and agent workflow files are intentionally excluded.
- Environment files, credentials, private keys, editor state, dependencies, and test output are ignored.
- Profile media, portfolio work, social links, and the downloadable resume are intentionally public because the live site presents them.
- The public website requires no API keys or authentication tokens.

Never commit private client work, passwords, API keys, access tokens, identity documents, invoices, or unapproved personal information.

## Make It Yours

The generic [`subtlesayak/portfolio-template`](https://github.com/subtlesayak/portfolio-template) keeps the same beginner-editable structure with placeholder content and detailed setup instructions. Its sections are optional: photography, articles, projects, and About content can be renamed, removed, or adapted to suit another person's interests.

## Credits

The site began with the plain-file approach in [`artofpilgrim/portfolio-template`](https://github.com/artofpilgrim/portfolio-template). It now includes photography collections, articles, public software projects, themes, responsive grid controls, e-ink refresh behavior, local media, discovery metadata, and content validation.

## License

Released under the [MIT License](LICENSE).
