const fs = require("fs");
const path = require("path");

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

function checkProjects() {
  requireFile("Config/projects.txt");
  if (!exists("Config/projects.txt")) return;

  lines("Config/projects.txt").forEach(folder => {
    const base = path.join("Projects", folder);
    ["description.txt", "media.txt", "stats.txt"].forEach(file => requireFile(path.join(base, file)));

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
    }
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
    "Config/software.txt",
    "Config/skills.txt",
    "Config/site.txt"
  ].forEach(requireFile);
}

checkConfig();
checkProjects();
checkPhotography();
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
