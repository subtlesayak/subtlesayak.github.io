# Portfolio Publisher

The publisher is a static, mobile-first admin screen at `/admin/`. It creates the same text files and project HTML pages used by the portfolio, then writes them to GitHub in one atomic commit. A commit to `main` triggers the existing GitHub Pages deployment.

## First-time phone setup

1. On GitHub, open **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Create a token limited to `subtlesayak/subtlesayak.github.io`.
3. Under repository permissions, grant **Contents: Read and write**. No administration or workflow permission is required.
4. Open `https://subtlesayak.github.io/admin/` on the phone and connect:
   - Repository: `subtlesayak/subtlesayak.github.io`
   - Branch: `main`
5. Leave **Remember on this private device** off on a shared phone. When it is off, the token lasts only for the browser session.

The token is sent directly from the browser to `api.github.com`; this repository does not contain or receive the token. Revoke the token immediately from GitHub if the device is lost.

## Publishing behavior

Each publish creates:

- `Projects/<Project Title>/description.txt`
- `Projects/<Project Title>/media.txt`
- `Projects/<Project Title>/stats.txt`
- `Projects/<Project Title>/categories.txt`
- `Projects/<Project Title>/card.txt`
- `Projects/<Project Title>/<project-slug>.html`
- compressed WebP images in `Projects/<Project Title>/assets/`
- an updated `Config/projects.txt`
- an updated `Config/selected-work.txt` when **Feature in selected work** is enabled

All files and images are committed together. If any upload fails, the publishing branch is not changed.

## Practical limits

- Up to 12 uploaded gallery images per project.
- Uploaded images are resized in the browser to a maximum dimension of 2200px and converted to WebP before publishing.
- Very large phone photos may use significant memory during conversion. Upload fewer images in one project if the browser reloads.
- Videos should be added as external `.mp4`, YouTube, or Sketchfab URLs in **More publishing options**. Large video files should not be committed to the portfolio repository.
- Text-only drafts are saved locally. Browser storage intentionally does not retain selected image files, so images must be selected again after a reload.

## Template reuse

The repository and branch fields are editable, but the connected repository must use this portfolio's `Config/projects.txt` and `JS/projects.js` content contract. The publisher refuses repositories that do not match that structure.
