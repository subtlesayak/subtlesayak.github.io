const fs = require("fs");
const path = require("path");

const root = process.cwd();
const errors = [];
const warnings = [];

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

function requireFile(relPath) {
  if (!exists(relPath)) errors.push(`Missing required file: ${relPath}`);
}

function checkLocalAsset(reference, context) {
  if (!reference || /^https?:\/\//i.test(reference) || reference.startsWith("mailto:")) return;
  const clean = reference.replace(/^\.\.\//, "").replace(/^\.\//, "");
  if (!exists(clean)) warnings.push(`Possible missing local asset in ${context}: ${reference}`);
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
      if (parts.length < 5) errors.push(`${descriptionPath} must have 5 sections separated by ---`);
      checkLocalAsset(parts[3], descriptionPath, base);
    }

    const mediaPath = path.join(base, "media.txt");
    if (exists(mediaPath)) {
      lines(mediaPath).forEach(line => {
        if (/\.(jpg|jpeg|png|gif|webp|mp4|mov|pdf)$/i.test(line)) checkLocalAsset(line, mediaPath, base);
      });
    }
  });
}

function checkPhotography() {
  const base = "Projects/Photography";
  ["media.txt", "entry.txt"].forEach(file => requireFile(path.join(base, file)));

  if (exists(path.join(base, "media.txt"))) {
    lines(path.join(base, "media.txt")).forEach(file => {
      requireFile(path.join(base, file));
    });
  }

  if (exists(path.join(base, "entry.txt"))) {
    const parts = read(path.join(base, "entry.txt")).split("---");
    if (parts.length < 5) errors.push("Projects/Photography/entry.txt must have 5 sections separated by ---");
  }
}

function checkArticles() {
  if (!exists("Config/articles.txt")) return;

  lines("Config/articles.txt").forEach(folder => {
    const articlePath = path.join("Articles", folder, "article.txt");
    requireFile(articlePath);
    if (exists(articlePath)) {
      const parts = read(articlePath).split("---");
      if (parts.length < 4) errors.push(`${articlePath} must have 4 sections separated by ---`);
    }
  });
}

function checkConfig() {
  [
    "Config/userinformation.txt",
    "Config/summary.txt",
    "Config/software.txt",
    "Config/skills.txt"
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