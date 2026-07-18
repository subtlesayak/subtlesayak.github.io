export const CONTENT_PATHS = {
  projects: "Config/projects.txt",
  selectedWork: "Config/selected-work.txt",
  articles: "Config/articles.txt",
  profile: "Config/userinformation.txt",
  summary: "Config/summary.txt",
  skills: "Config/skills.txt",
  software: "Config/software.txt",
  recommendations: "Config/recommendations.txt",
  productions: "Config/productions.txt",
  site: "Config/site.txt",
  categories: "Config/categories.txt",
  photographyCollections: "Projects/Photography/collections.txt",
  codeProjects: "Config/codeprojects.txt",
  robots: "robots.txt",
  llms: "llms.txt",
  sitemap: "sitemap.xml"
};

export function cleanLines(text, comments = false) {
  return String(text || "").replace(/\r\n/g, "\n").split("\n")
    .map(line => line.trim())
    .filter(line => line && (comments || !line.startsWith("#")));
}

export function joinLines(lines) {
  return lines.map(line => String(line).trim()).filter(Boolean).join("\n") + "\n";
}

export function splitRecords(text) {
  return String(text || "").replace(/\r\n/g, "\n").split(/\n?---\n?/).map(record => record.trim()).filter(Boolean);
}

export function joinRecords(records) {
  return records.map(record => String(record).trim()).filter(Boolean).join("\n---\n") + (records.length ? "\n" : "");
}

export function parseProject({ folder, description = "", categories = "", card = "", stats = "", media = "" }) {
  const parts = description.split("---").map(part => part.trim());
  const cardLines = cleanLines(card);
  const statLines = cleanLines(stats);
  const statMap = Object.fromEntries(statLines.map(line => {
    const index = line.indexOf(":");
    return index < 0 ? [line, ""] : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }));
  return {
    id: folder,
    folder,
    title: parts[0] || folder,
    description: parts[1] || "",
    tags: parts[2] || "",
    cover: parts[3] || "",
    htmlFile: parts[4] || "",
    category: cleanLines(categories)[0] || "other",
    cardLabel: cardLines[0] || "Project",
    cardContext: cardLines.slice(1).join(" "),
    role: statMap.Role || "",
    year: statMap.Timeline || statMap.Year || "",
    stats,
    media,
    mediaLines: cleanLines(media)
  };
}

export function serializeProject(project) {
  return {
    description: [project.title, "---", project.description, "---", project.tags, "---", project.cover, "---", project.htmlFile].join("\n") + "\n",
    categories: `${project.category || "other"}\n`,
    card: `${project.cardLabel || "Project"}\n${project.cardContext || project.description}\n`,
    stats: project.stats || [project.role && `Role: ${project.role}`, project.year && `Timeline: ${project.year}`].filter(Boolean).join("\n") + "\n",
    media: cleanLines(project.media).join("\n\n") + "\n"
  };
}

export function parseProfile(text) {
  const lines = cleanLines(text);
  const [profilePath = "/Resources/profile/sayak-profile.jpg", name = "", role = "", location = "", ...links] = lines;
  const resumeIndex = links.findIndex(value => value.toLowerCase().endsWith(".pdf") || value.toLowerCase().startsWith("resume:"));
  const resumePath = resumeIndex >= 0 ? links.splice(resumeIndex, 1)[0] : "/Resources/resume/sayak-sajith-resume.pdf";
  const looksLikeLink = value => /^https?:\/\//i.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const intro = links[0] && !looksLikeLink(links[0]) ? links.shift() : "";
  return { profilePath, name, role, location, intro, socials: links.join("\n"), resumePath };
}

export function serializeProfile(profile) {
  return joinLines([
    profile.profilePath || "/Resources/profile/sayak-profile.jpg",
    profile.name,
    profile.role,
    profile.location,
    profile.intro,
    ...cleanLines(profile.socials),
    profile.resumePath || "/Resources/resume/sayak-sajith-resume.pdf"
  ]);
}

export function parseRecommendations(text) {
  return splitRecords(text).map((record, index) => {
    const lines = cleanLines(record);
    const hasAvatar = /^https?:\/\//i.test(lines[1] || "");
    return {
      id: `recommendation-${index}`,
      name: lines[0] || "",
      avatar: hasAvatar ? lines[1] : "",
      position: hasAvatar ? lines[2] || "" : lines[1] || "",
      date: hasAvatar ? lines[3] || "" : lines[2] || "",
      quote: hasAvatar ? lines.slice(4).join(" ") : lines.slice(3).join(" ")
    };
  });
}

export function serializeRecommendations(items) {
  return joinRecords(items.map(item => joinLines([item.name, item.avatar, item.position, item.date, item.quote]).trim()));
}

export function parseProductions(text) {
  return splitRecords(text).map((record, index) => {
    const lines = cleanLines(record);
    return { id: `production-${index}`, title: lines[0] || "", company: lines[1] || "", time: lines[2] || "", thumbnail: lines[3] || "", description: lines.slice(4).join("\n") };
  });
}

export function serializeProductions(items) {
  return joinRecords(items.map(item => joinLines([item.title, item.company, item.time, item.thumbnail, item.description]).trim()));
}

export function parseArticle(folder, text, authorNote = "") {
  const parts = text.split("---").map(part => part.trim());
  return { id: folder, folder, title: parts[0] || folder, date: parts[1] || "", summary: parts[2] || "", body: parts.slice(3).join("\n\n---\n\n"), authorNote: authorNote.trim() };
}

export function serializeArticle(article) {
  return [article.title, "---", article.date, "---", article.summary, "---", article.body].join("\n") + "\n";
}

export function parsePhotographyEntry(folder, text, media = "") {
  const parts = text.split("---").map(part => part.trim());
  return { id: folder, folder, title: parts[0] || "Photography Collection", date: parts[1] || "", location: parts[2] || "", description: parts[3] || "", captions: parts[4] || "", media: cleanLines(media).join("\n") };
}

export function serializePhotographyEntry(collection) {
  return [collection.title, "---", collection.date, "---", collection.location, "---", collection.description, "---", collection.captions].join("\n") + "\n";
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

const SITE_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function parseSiteUpdated(text) {
  const line = String(text || "").split(/\r?\n/).find(value => /^Last updated:/i.test(value.trim())) || "";
  const match = line.match(/^Last updated:\s*([A-Za-z]+)\s+(?:(\d{1,2}),?\s+)?(\d{4})\s*$/i);
  if (!match) return "";
  const month = SITE_MONTHS.findIndex(value => value.toLowerCase() === match[1].toLowerCase());
  const day = Number(match[2] || 1), year = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (month < 0 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return "";
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function serializeSiteUpdated(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const year = Number(match[1]), month = Number(match[2]) - 1, day = Number(match[3]);
  const date = new Date(Date.UTC(year, month, day));
  if (month < 0 || month > 11 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return "";
  return `Last updated: ${SITE_MONTHS[month]} ${day}, ${year}\n`;
}
