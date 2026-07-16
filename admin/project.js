const CATEGORY_LABELS = {
  uiux: "UI/UX",
  branding: "Branding",
  web: "Web",
  "visual-design": "Visual Design",
  photography: "Photography",
  other: "Other Work"
};

const CARD_LABELS = {
  uiux: "Case Study",
  branding: "Brand Study",
  web: "Web Experiment",
  "visual-design": "Visual Study",
  photography: "Photo Story",
  other: "Project"
};

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.other;
}

export function suggestedCardLabel(category) {
  return CARD_LABELS[category] || CARD_LABELS.other;
}

export function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80) || "project";
}

export function folderName(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.slice(0, 90) || "Untitled Project";
}

export function splitTags(value) {
  return value.split(",").map(item => item.trim()).filter(Boolean).slice(0, 12);
}

export function parseNonCommentLines(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#"));
}

export function addProjectToList(text, name) {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const current = parseNonCommentLines(text);
  if (current.some(item => item.toLowerCase() === name.toLowerCase())) {
    throw new Error(`A project folder named “${name}” already exists in Config/projects.txt.`);
  }
  const prefix = text.trim() ? `${text.replace(/\s+$/, "")}${newline}` : "";
  return `${prefix}${name}${newline}`;
}

export function addSelectedProject(text, name) {
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const current = parseNonCommentLines(text).filter(item => item.toLowerCase() !== name.toLowerCase());
  return [name, ...current].join(newline) + newline;
}

export async function prepareImage(file, index, options = {}) {
  const maxDimension = options.maxDimension || 2200;
  const quality = options.quality || 0.86;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#111111";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(result => result ? resolve(result) : reject(new Error("This browser could not convert the image.")), "image/webp", quality);
  });
  const base64 = await blobToBase64(blob);
  return {
    id: crypto.randomUUID(),
    name: `image-${String(index).padStart(3, "0")}.webp`,
    base64,
    previewUrl: URL.createObjectURL(blob),
    size: blob.size,
    width,
    height
  };
}

export async function prepareCover(file) {
  const image = await prepareImage(file, 1, { maxDimension: 2400, quality: 0.88 });
  image.name = "cover.webp";
  return image;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error || new Error("Unable to read image."));
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonForHtml(value) {
  return JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");
}

export function buildProjectFiles(data) {
  const folder = folderName(data.title);
  const slug = slugify(data.title);
  const htmlName = `${slug}.html`;
  const tags = splitTags(data.tags);
  const category = data.category || "other";
  const label = data.cardLabel.trim() || suggestedCardLabel(category);
  const year = data.year.trim() || String(new Date().getFullYear());
  const description = data.description.trim();
  const coverPath = `Projects/${folder}/assets/cover.webp`;
  const canonicalPath = `Projects/${encodeURIComponent(folder).replaceAll("%2F", "/")}/${htmlName}`;
  const canonicalUrl = `https://subtlesayak.github.io/${canonicalPath}`;
  const mediaLines = ["assets/cover.webp*"];

  data.gallery.forEach((image, index) => {
    mediaLines.push("", `assets/${image.name || `image-${String(index + 1).padStart(3, "0")}.webp`}`);
  });
  data.mediaUrls.split(/\r?\n/).map(item => item.trim()).filter(Boolean).forEach(url => mediaLines.push("", url));

  const shortContext = description.length > 150 ? `${description.slice(0, 147).trimEnd()}...` : description;
  const stats = [
    data.role.trim() && `Role: ${data.role.trim()}`,
    `Timeline: ${year}`,
    `Category: ${categoryLabel(category)}`,
    tags.length && `Tools: ${tags.join(", ")}`
  ].filter(Boolean).join("\n") + "\n";

  const descriptionText = [
    data.title.trim(),
    "---",
    description,
    "---",
    tags.join(", "),
    "---",
    coverPath,
    "---",
    htmlName
  ].join("\n") + "\n";

  const seoDescription = description.length > 155 ? `${description.slice(0, 152).trimEnd()}...` : description;
  const pageHtml = createProjectHtml({
    title: data.title.trim(),
    description: seoDescription,
    tags,
    canonicalUrl,
    imageUrl: `https://subtlesayak.github.io/${coverPath.split(" ").join("%20")}`
  });

  const files = [
    { path: `Projects/${folder}/description.txt`, content: descriptionText },
    { path: `Projects/${folder}/media.txt`, content: mediaLines.join("\n") + "\n" },
    { path: `Projects/${folder}/stats.txt`, content: stats },
    { path: `Projects/${folder}/categories.txt`, content: `${category}\n` },
    { path: `Projects/${folder}/card.txt`, content: `${label}\n${shortContext}\n` },
    { path: `Projects/${folder}/${htmlName}`, content: pageHtml },
    { path: `Projects/${folder}/assets/cover.webp`, content: data.cover.base64, encoding: "base64" }
  ];

  data.gallery.forEach((image, index) => {
    files.push({
      path: `Projects/${folder}/assets/${image.name || `image-${String(index + 1).padStart(3, "0")}.webp`}`,
      content: image.base64,
      encoding: "base64"
    });
  });

  return { folder, htmlName, canonicalUrl, files };
}

function createProjectHtml({ title, description, tags, canonicalUrl, imageUrl }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(canonicalUrl);
  const safeImage = escapeHtml(imageUrl);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${canonicalUrl}#creativework`,
    name: title,
    description,
    url: canonicalUrl,
    image: imageUrl,
    keywords: tags.join(", "),
    creator: { "@type": "Person", "@id": "https://subtlesayak.github.io/#person", name: "Subtle Sayak" }
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle} - Subtle Sayak</title>
    <meta name="description" content="${safeDescription}" />
    <meta name="author" content="Subtle Sayak" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${safeUrl}" />
    <link rel="sitemap" type="application/xml" href="https://subtlesayak.github.io/sitemap.xml" />
    <link rel="alternate" type="text/plain" href="https://subtlesayak.github.io/llms.txt" title="LLM-readable site overview" />
    <meta property="og:site_name" content="Subtle Sayak Portfolio" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${safeTitle} - Subtle Sayak" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:image" content="${safeImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle} - Subtle Sayak" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    <script type="application/ld+json">${jsonForHtml(schema)}</script>
    <link rel="stylesheet" href="../../CSS/userinformationstyle.css?v=2.4" />
    <link rel="stylesheet" href="../../CSS/main.css?v=1.10" />
    <link rel="icon" href="../../Resources/favicon/pilfav.png" type="image/png" />
  </head>
  <body>
    <div class="container">
      <div class="media-container">
        <div id="project-media"></div>
        <button id="prev-project" class="nav-button" type="button" aria-label="Previous Project"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>
        <button id="next-project" class="nav-button" type="button" aria-label="Next Project"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>
        <button id="back-to-top" class="back-to-top-button" type="button" aria-label="Back to the top"><i class="fa fa-arrow-up"></i></button>
      </div>
      <div class="info-container">
        <div class="top-container"><div class="user-info-panel"></div></div>
        <div class="project-description-container"><h1 id="project-title"></h1><p id="project-description"></p></div>
        <hr />
        <h3>Software Used</h3>
        <div class="project-tags-container" id="project-tags"></div>
        <hr />
        <div class="project-stats-container" id="project-stats"></div>
      </div>
    </div>
    <script src="../../JS/viewcontrols.js?v=1.6"></script>
    <script src="../../JS/projects.js?v=1.7"></script>
  </body>
</html>
`;
}
