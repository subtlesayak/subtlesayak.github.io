# Complete Portfolio CMS

The online admin at `/admin/` manages the portfolio directly through GitHub. Every publish action creates one atomic commit on the configured branch, so content and uploaded files are versioned together.

## Managed content

- **Projects:** create, edit, delete, reorder, feature in selected work, replace covers, append gallery images, and edit external media.
- **Photography:** create, edit, delete, and reorder collections; upload compressed WebP images and thumbnails; edit context and captions.
- **Articles:** create, edit, delete, and reorder article folders; edit summaries, bodies, dates, and author notes.
- **About:** edit identity, social/contact links, summary, skills, software, recommendations, experience, education, projects, certificates, and activities.
- **Media & resume:** replace the profile portrait, favicon, and PDF résumé while retaining prior versions in Git history.
- **Settings:** edit last-updated text, category definitions, and selected-work ordering.
- **Publishing:** inspect recent commits and restore a previous complete portfolio state. Restore creates a new commit and never erases history.

## GitHub token

Use a fine-grained personal access token limited to `subtlesayak/subtlesayak.github.io` with **Contents: Read and write**. Leave “Remember on this private device” disabled on shared devices. A remembered token stays only in that browser’s local storage and can be revoked from GitHub at any time.

## Asset limits

- Profile portrait: JPEG, up to 8 MB.
- Favicon: PNG, up to 8 MB.
- Résumé: PDF, up to 20 MB.
- Project and photography images are resized in the browser and converted to WebP before publishing.
- Large videos should remain externally hosted and be added as URLs.

## Safety model

- The token is never committed to the repository.
- The admin verifies the Pilgrim content contract before loading editors.
- Deletes are scoped to the selected article, project, or photography collection folder.
- Git branch updates are non-forced; concurrent changes fail safely instead of overwriting newer work.
- Restores create a new commit from the chosen historical tree.
