const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = process.cwd();
const errors = [];
const warnings = [];

function normalizeRel(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .trim();
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function lines(relPath) {
  return read(relPath)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
}

function loadValidationIgnores() {
  const ignorePath = "Config/validation-ignore.txt";
  if (!exists(ignorePath)) return new Set();
  return new Set(lines(ignorePath).map(normalizeRel));
}

const ignoredWarnings = loadValidationIgnores();

function isIgnored(context, reference) {
  const normalizedContext = normalizeRel(context);
  const normalizedReference = normalizeRel(reference);
  return ignoredWarnings.has(normalizedContext) || ignoredWarnings.has(`${normalizedContext}|${normalizedReference}`);
}

function requireFile(relPath) {
  if (!exists(relPath)) errors.push(`Missing required file: ${normalizeRel(relPath)}`);
}

function isExternalReference(reference) {
  return /^(https?:|mailto:|tel:|data:|blob:|javascript:|#)/i.test(reference) || reference.startsWith("//");
}

function cleanReference(reference) {
  return String(reference || "")
    .trim()
    .replace(/^\*/, "")
    .replace(/^['"]|['"]$/g, "")
    .split("?")[0]
    .split("#")[0]
    .trim();
}

function candidatePaths(reference, baseDir) {
  const clean = cleanReference(reference);
  if (!clean) return [];

  const normalized = normalizeRel(clean);
  const withoutParent = normalizeRel(normalized.replace(/^(\.\.\/)+/, ""));
  const candidates = new Set([normalized, withoutParent]);

  if (baseDir && !/^(Articles|CSS|Config|JS|Projects|Resources|Templates|tools)\//.test(normalized)) {
    candidates.add(normalizeRel(path.join(baseDir, clean)));
  }

  return [...candidates].filter(Boolean);
}

function checkLocalAsset(reference, context, baseDir = "") {
  if (!reference) return;

  String(reference).split(" // ").forEach(part => {
    const clean = cleanReference(part);
    if (!clean || isExternalReference(clean)) return;
    if (candidatePaths(clean, baseDir).some(exists)) return;
    if (!isIgnored(context, clean)) warnings.push(`Possible missing local asset in ${normalizeRel(context)}: ${clean}`);
  });
}

function hasAssetExtension(value) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg|mp4|mov|pdf)$/i.test(cleanReference(value));
}
function checkAssetManifest(base) {
  const assetsDir = path.join(base, "assets");
  const manifestPath = path.join(assetsDir, "source-manifest.json");
  if (!exists(manifestPath)) return;

  let manifest;
  try {
    manifest = JSON.parse(read(manifestPath));
  } catch (error) {
    errors.push(`${normalizeRel(manifestPath)} is not valid JSON: ${error.message}`);
    return;
  }

  if (!Array.isArray(manifest.images)) {
    errors.push(`${normalizeRel(manifestPath)} must contain an images array`);
    return;
  }

  const listedFiles = new Set();
  let totalBytes = 0;

  manifest.images.forEach((image, index) => {
    const label = `${normalizeRel(manifestPath)} image ${index + 1}`;
    if (!image || typeof image.file !== "string" || image.file !== path.basename(image.file)) {
      errors.push(`${label} has an invalid file name`);
      return;
    }

    if (listedFiles.has(image.file)) errors.push(`${normalizeRel(manifestPath)} lists ${image.file} more than once`);
    listedFiles.add(image.file);

    const assetPath = path.join(assetsDir, image.file);
    if (!exists(assetPath)) {
      errors.push(`${label} is missing ${normalizeRel(assetPath)}`);
      return;
    }

    const buffer = fs.readFileSync(path.join(root, assetPath));
    const digest = crypto.createHash("sha256").update(buffer).digest("hex");
    totalBytes += buffer.length;

    if (image.bytes !== buffer.length) errors.push(`${label} byte count does not match the local file`);
    if (image.sha256 !== digest) errors.push(`${label} checksum does not match the local file`);
    if (!/^image\//i.test(image.contentType || "")) errors.push(`${label} has an invalid content type`);
  });

  if (manifest.imageCount !== manifest.images.length) {
    errors.push(`${normalizeRel(manifestPath)} imageCount does not match its images array`);
  }
  if (manifest.totalBytes !== totalBytes) {
    errors.push(`${normalizeRel(manifestPath)} totalBytes does not match its local files`);
  }

  const actualFiles = fs.readdirSync(path.join(root, assetsDir))
    .filter(file => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file));
  actualFiles.forEach(file => {
    if (!listedFiles.has(file)) errors.push(`${normalizeRel(assetsDir)} contains an image missing from its source manifest: ${file}`);
  });
}


function checkProjects() {
  requireFile("Config/projects.txt");
  if (!exists("Config/projects.txt")) return;

  lines("Config/projects.txt").forEach(folder => {
    const base = path.join("Projects", folder);
    ["description.txt", "media.txt", "stats.txt"].forEach(file => requireFile(path.join(base, file)));

    const cardPath = path.join(base, "card.txt");
    if (exists(cardPath)) {
      const cardLines = lines(cardPath);
      if (cardLines.length < 2) errors.push(`${normalizeRel(cardPath)} must have a short label on line 1 and one-line context on line 2`);
      if ((cardLines.slice(1).join(" ")).length > 160) warnings.push(`${normalizeRel(cardPath)} context is longer than 160 characters`);
    }

    const descriptionPath = path.join(base, "description.txt");
    if (exists(descriptionPath)) {
      const parts = read(descriptionPath).split("---").map(part => part.trim());
      if (parts.length < 5) errors.push(`${normalizeRel(descriptionPath)} must have 5 sections separated by ---`);
      checkLocalAsset(parts[3], descriptionPath, base);
    }

    const mediaPath = path.join(base, "media.txt");
    if (exists(mediaPath)) {
      lines(mediaPath).forEach(line => {
        if (hasAssetExtension(line) || line.includes(" // ")) checkLocalAsset(line, mediaPath, base);
      });
    checkAssetManifest(base);
    }
  });
}

function checkSelectedWork() {
  const selectedPath = "Config/selected-work.txt";
  if (!exists(selectedPath) || !exists("Config/projects.txt")) return;

  const configured = new Set(lines("Config/projects.txt"));
  const seen = new Set();
  lines(selectedPath).forEach(folder => {
    if (!configured.has(folder)) errors.push(`${normalizeRel(selectedPath)} references a project not in Config/projects.txt: ${folder}`);
    if (seen.has(folder)) errors.push(`${normalizeRel(selectedPath)} contains a duplicate project: ${folder}`);
    seen.add(folder);
  });
}

function collectionBase(collectionId) {
  return collectionId === "."
    ? path.join("Projects", "Photography")
    : path.join("Projects", "Photography", "Collections", collectionId);
}

function checkPhotographyCollection(collectionId) {
  const base = collectionBase(collectionId);
  const entryPath = path.join(base, "entry.txt");
  const mediaPath = path.join(base, "media.txt");

  requireFile(entryPath);
  requireFile(mediaPath);

  if (exists(entryPath)) {
    const parts = read(entryPath).split("---");
    if (parts.length < 5) errors.push(`${normalizeRel(entryPath)} must have 5 sections separated by ---`);
  }

  if (exists(mediaPath)) {
    lines(mediaPath).forEach(fileName => {
      checkLocalAsset(fileName, mediaPath, base);
    });
  }
}

function checkPhotography() {
  const collectionsPath = path.join("Projects", "Photography", "collections.txt");
  requireFile(collectionsPath);

  const collections = exists(collectionsPath) ? lines(collectionsPath) : ["."];
  const configuredCollections = collections.length ? collections : ["."];
  configuredCollections.forEach(checkPhotographyCollection);
}


function checkLinkedProjectConfig(configPath, itemLabel, options = {}) {
  const requireLiveUrl = options.requireLiveUrl === true;
  const usesThumbnail = options.usesThumbnail === true;
  requireFile(configPath);
  if (!exists(configPath)) return;

  const parts = read(configPath)
    .replace(/\r\n/g, "\n")
    .split(/\n---\n/)
    .map(part => part.trim());

  if (parts.length % 6 !== 0) {
    errors.push(`${normalizeRel(configPath)} must use 6 sections per ${itemLabel} separated by ---`);
    return;
  }

  for (let index = 0; index < parts.length; index += 6) {
    const title = parts[index] || `Untitled ${itemLabel}`;
    const liveUrl = parts[index + 3] || "";
    const secondaryReference = parts[index + 4] || "";
    if (!liveUrl && !secondaryReference) errors.push(`${normalizeRel(configPath)} ${itemLabel} "${title}" needs a live URL or secondary reference`);
    if (requireLiveUrl && !liveUrl) errors.push(`${normalizeRel(configPath)} ${itemLabel} "${title}" needs a live website URL`);
    if (liveUrl && !/^https?:\/\//i.test(liveUrl)) errors.push(`${normalizeRel(configPath)} ${itemLabel} "${title}" has an invalid live URL`);
    if (usesThumbnail) {
      if (!secondaryReference) errors.push(`${normalizeRel(configPath)} ${itemLabel} "${title}" needs a thumbnail image`);
      checkLocalAsset(secondaryReference, configPath);
    } else if (secondaryReference && !/^https?:\/\//i.test(secondaryReference)) {
      errors.push(`${normalizeRel(configPath)} ${itemLabel} "${title}" has an invalid source URL`);
    }
  }
}

function checkCodeProjects() {
  checkLinkedProjectConfig("Config/codeprojects.txt", "project");
}

function checkClientWebsites() {
  checkLinkedProjectConfig("Config/client-websites.txt", "client website", { requireLiveUrl: true, usesThumbnail: true });
}
function checkArticles() {
  if (!exists("Config/articles.txt")) return;

  lines("Config/articles.txt").forEach(folder => {
    const articlePath = path.join("Articles", folder, "article.txt");
    requireFile(articlePath);
    if (exists(articlePath)) {
      const parts = read(articlePath).split("---");
      if (parts.length < 4) errors.push(`${normalizeRel(articlePath)} must have 4 sections separated by ---`);
    }
  });
}

function checkConfig() {
  [
    "Config/userinformation.txt",
    "Config/summary.txt",
    "Config/achievements.txt",
    "Config/software.txt",
    "Config/skills.txt",
    "Config/site.txt",
    "Config/codeprojects.txt",
    "Config/client-websites.txt"
  ].forEach(requireFile);
}

function checkAchievements() {
  const configPath = "Config/achievements.txt";
  if (!exists(configPath)) return;

  const achievements = read(configPath)
    .replace(/\r\n/g, "\n")
    .split(/\n---\n/)
    .map(block => block.split("\n").map(line => line.trim()).filter(Boolean));

  achievements.forEach((lines, index) => {
    if (lines.length < 2) errors.push(`${normalizeRel(configPath)} achievement ${index + 1} needs a title and description`);
  });
}

checkConfig();
checkAchievements();
checkProjects();
checkSelectedWork();
checkPhotography();
checkCodeProjects();
checkClientWebsites();
checkArticles();

if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach(warning => console.log(`- ${warning}`));
  console.log("");
}

if (errors.length) {
  console.error("Validation failed:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Content validation passed.");
