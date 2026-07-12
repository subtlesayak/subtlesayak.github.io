const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const rootDir = path.resolve(__dirname, "..");
const projectsDir = path.join(rootDir, "Projects");
const isDryRun = process.argv.includes("--dry-run");
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36";
const allowedAssetHost = "mir-s3-cdn-cf.behance.net";
const siteOrigin = "https://subtlesayak.github.io";
const downloadConcurrency = 4;

function decodeHtmlAttribute(value) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&#x2F;/gi, "/");
}

function getAttribute(tag, name) {
    const expression = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
    const match = tag.match(expression);
    return match ? decodeHtmlAttribute(match[2]) : "";
}

function extractBehanceImages(html) {
    const imageTags = html.match(/<img\b[^>]*>/gi) || [];
    const ordered = [];
    const seen = new Set();

    imageTags.forEach(tag => {
        const className = getAttribute(tag, "class");
        if (!/(?:BeStaticImage|ImageElement-image)/i.test(className)) return;

        const rawSource = getAttribute(tag, "src");
        if (!rawSource) return;

        let sourceUrl;
        try {
            sourceUrl = new URL(rawSource);
        } catch (_error) {
            return;
        }

        if (sourceUrl.hostname !== allowedAssetHost || !sourceUrl.pathname.includes("/project_modules/")) return;
        sourceUrl.search = "";
        sourceUrl.hash = "";

        const normalized = sourceUrl.toString();
        if (seen.has(normalized)) return;
        seen.add(normalized);
        ordered.push(normalized);
    });

    return ordered;
}

function parseDescription(rawText, filePath) {
    const parts = rawText.replace(/\r\n/g, "\n").split("---").map(part => part.trim());
    if (parts.length !== 5) throw new Error(`${filePath} must contain exactly five --- separated sections`);
    return parts;
}

function getBehanceProjectUrl(description) {
    const match = description.match(/https:\/\/www\.behance\.net\/gallery\/[^\s]+/i);
    return match ? match[0].replace(/[),.;]+$/, "") : "";
}

function detectImageExtension(buffer) {
    if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
    if (buffer.length >= 6 && /^GIF8[79]a$/.test(buffer.subarray(0, 6).toString("ascii"))) return "gif";
    if (buffer.length >= 12 && buffer.subarray(4, 12).toString("ascii").startsWith("ftypavif")) return "avif";
    return "";
}

function sha256(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (response.status < 500 && response.status !== 429) throw new Error(`HTTP ${response.status} for ${url}`);
            lastError = new Error(`HTTP ${response.status} for ${url}`);
        } catch (error) {
            lastError = error;
        }
        if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, attempt * 700));
    }
    throw lastError;
}

async function mapWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runWorker() {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await worker(items[index], index);
        }
    }

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
    return results;
}

async function downloadImage(sourceUrl, index, assetsDir, projectUrl) {
    const response = await fetchWithRetry(sourceUrl, {
        headers: {
            "User-Agent": userAgent,
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            "Referer": projectUrl
        }
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const extension = detectImageExtension(buffer);
    if (!extension) throw new Error(`Unsupported or invalid image response from ${sourceUrl}`);

    const fileName = `image-${String(index + 1).padStart(3, "0")}.${extension}`;
    const destination = path.join(assetsDir, fileName);
    const temporary = `${destination}.part`;
    const digest = sha256(buffer);

    let existingMatches = false;
    try {
        const existing = await fs.readFile(destination);
        existingMatches = sha256(existing) === digest;
    } catch (_error) {
        existingMatches = false;
    }

    if (!existingMatches) {
        await fs.writeFile(temporary, buffer);
        await fs.rm(destination, { force: true });
        await fs.rename(temporary, destination);
    }

    return {
        file: fileName,
        source: sourceUrl,
        bytes: buffer.length,
        contentType: response.headers.get("content-type") || `image/${extension}`,
        sha256: digest
    };
}

async function discoverProjects() {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const descriptionPath = path.join(projectsDir, entry.name, "description.txt");
        let rawDescription;
        try {
            rawDescription = await fs.readFile(descriptionPath, "utf8");
        } catch (_error) {
            continue;
        }

        const descriptionParts = parseDescription(rawDescription, path.relative(rootDir, descriptionPath));
        const projectUrl = getBehanceProjectUrl(descriptionParts[1]);
        if (!projectUrl) continue;

        projects.push({
            folder: entry.name,
            directory: path.join(projectsDir, entry.name),
            descriptionPath,
            descriptionParts,
            projectUrl
        });
    }

    return projects.sort((first, second) => first.folder.localeCompare(second.folder));
}

async function processProject(project) {
    const pageResponse = await fetchWithRetry(project.projectUrl, {
        headers: {
            "User-Agent": userAgent,
            "Accept-Language": "en-US,en;q=0.9"
        }
    });
    const html = await pageResponse.text();
    const imageUrls = extractBehanceImages(html);
    if (!imageUrls.length) throw new Error(`No Behance image modules found for ${project.folder}`);

    console.log(`${isDryRun ? "Would import" : "Importing"} ${imageUrls.length} images: ${project.folder}`);
    if (isDryRun) return { folder: project.folder, count: imageUrls.length, bytes: 0 };

    const assetsDir = path.join(project.directory, "assets");
    await fs.mkdir(assetsDir, { recursive: true });
    const images = await mapWithConcurrency(imageUrls, downloadConcurrency, (url, index) => downloadImage(url, index, assetsDir, project.projectUrl));

    const expectedFiles = new Set(images.map(image => image.file));
    const existingFiles = await fs.readdir(assetsDir);
    await Promise.all(existingFiles
        .filter(file => /^image-\d{3}\.(?:webp|png|jpe?g|gif|avif)$/i.test(file) && !expectedFiles.has(file))
        .map(file => fs.rm(path.join(assetsDir, file), { force: true })));

    const manifest = {
        sourceProject: project.projectUrl,
        retrievedAt: new Date().toISOString(),
        imageCount: images.length,
        totalBytes: images.reduce((total, image) => total + image.bytes, 0),
        images
    };
    await fs.writeFile(path.join(assetsDir, "source-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    const localMediaPaths = images.map((image, index) => `assets/${image.file}${index === 0 ? "*" : ""}`);
    await fs.writeFile(path.join(project.directory, "media.txt"), `${localMediaPaths.join("\n\n")}\n`, "utf8");

    project.descriptionParts[3] = `Projects/${project.folder}/assets/${images[0].file}`;
    await fs.writeFile(project.descriptionPath, `${project.descriptionParts.join("\n---\n")}\n`, "utf8");
    const publicCoverPath = `Projects/${project.folder}/assets/${images[0].file}`;
    const publicCoverUrl = `${siteOrigin}/${publicCoverPath.split("/").map(encodeURIComponent).join("/")}`;
    const htmlPath = path.join(project.directory, project.descriptionParts[4]);

    try {
        const html = await fs.readFile(htmlPath, "utf8");
        const updatedHtml = html
            .replace(/(<meta\s+property=["']og:image["']\s+content=["'])[^"']*(["'])/i, `$1${publicCoverUrl}$2`)
            .replace(/(<meta\s+name=["']twitter:image["']\s+content=["'])[^"']*(["'])/i, `$1${publicCoverUrl}$2`)
            .replace(/("image"\s*:\s*")[^"]*(")/i, `$1${publicCoverUrl}$2`);

        if (updatedHtml !== html) await fs.writeFile(htmlPath, updatedHtml, "utf8");
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
    }


    return {
        folder: project.folder,
        count: images.length,
        bytes: manifest.totalBytes
    };
}

async function main() {
    const projects = await discoverProjects();
    if (!projects.length) throw new Error("No public Behance project links found in project descriptions");

    const results = [];
    for (const project of projects) results.push(await processProject(project));

    const totalImages = results.reduce((total, result) => total + result.count, 0);
    const totalBytes = results.reduce((total, result) => total + result.bytes, 0);
    console.log(`Processed ${results.length} projects and ${totalImages} images${isDryRun ? "" : ` (${(totalBytes / 1024 / 1024).toFixed(2)} MiB)`}.`);
}

main().catch(error => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
});
