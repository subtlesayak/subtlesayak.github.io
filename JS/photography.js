const PHOTOGRAPHY_CACHE_VERSION = "1.8";
const PHOTOGRAPHY_MEDIA_PATH = "../Projects/Photography/media.txt";
const PHOTOGRAPHY_METADATA_PATH = "../Projects/Photography/metadata.json";
const PHOTOGRAPHY_ENTRY_PATH = "../Projects/Photography/entry.txt";
const PHOTOGRAPHY_BASE_PATH = "../Projects/Photography/";
const PHOTOGRAPHY_THUMB_PATH = "../Projects/Photography/thumbs/";

function parsePhotoLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
}

function parsePhotographyEntry(text) {
    const parts = text.split("---").map(part => part.trim());
    const captionMap = new Map();

    (parts[4] || "").split("\n").forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes(":")) return;
        const separatorIndex = trimmed.indexOf(":");
        const fileName = trimmed.slice(0, separatorIndex).trim();
        const caption = trimmed.slice(separatorIndex + 1).trim();
        if (fileName && caption) captionMap.set(fileName, caption);
    });

    return {
        title: parts[0] || "Photography Collection",
        date: parts[1] || "",
        location: parts[2] || "",
        context: parts[3] || "",
        captions: captionMap
    };
}

async function fetchPhotographyEntry() {
    try {
        const response = await fetch(`${PHOTOGRAPHY_ENTRY_PATH}?v=${PHOTOGRAPHY_CACHE_VERSION}`);
        if (!response.ok) throw new Error("Unable to load photography entry metadata");
        return parsePhotographyEntry(await response.text());
    } catch (error) {
        console.error("Error loading photography entry:", error);
        return {
            title: "Photography Collection",
            date: "",
            location: "",
            context: "",
            captions: new Map()
        };
    }
}
function createPhotoCard(fileName, index) {
    const link = document.createElement("a");
    link.className = "photo-card";
    link.href = `photography.html?photo=${encodeURIComponent(fileName)}`;
    link.setAttribute("aria-label", "Open photo " + (index + 1));

    const image = document.createElement("img");
    const fullImageUrl = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    image.src = PHOTOGRAPHY_THUMB_PATH + encodeURI(fileName);
    image.alt = "Photography work " + (index + 1);
    image.loading = index < 6 ? "eager" : "lazy";
    image.decoding = "async";
    image.fetchPriority = index < 6 ? "high" : "auto";
    image.onerror = () => {
        image.onerror = null;
        image.src = fullImageUrl;
    };

    link.appendChild(image);
    return link;
}

function showPhotographyEmptyState(container) {
    const emptyState = document.createElement("div");
    emptyState.className = "portfolio-empty";

    const heading = document.createElement("h1");
    heading.textContent = "Photography";

    const body = document.createElement("p");
    body.textContent = "Add image filenames to Projects/Photography/media.txt to show photos here.";

    emptyState.appendChild(heading);
    emptyState.appendChild(body);
    container.appendChild(emptyState);
}

async function fetchPhotoMetadata() {
    try {
        const response = await fetch(`${PHOTOGRAPHY_METADATA_PATH}?v=${PHOTOGRAPHY_CACHE_VERSION}`);
        if (!response.ok) throw new Error("Unable to load photography metadata");

        const records = await response.json();
        return new Map(records.map(record => [record.FileName, record]));
    } catch (error) {
        console.error("Error loading photography metadata:", error);
        return new Map();
    }
}

function getSelectedPhotoIndex(photoFiles) {
    const selectedPhoto = new URLSearchParams(window.location.search).get("photo");
    if (!selectedPhoto) return -1;

    return photoFiles.findIndex(fileName => fileName === selectedPhoto);
}
function preloadPhoto(fileName) {
    const image = new Image();
    image.decoding = "async";
    image.src = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
}



function createPhotoNavButton(label, iconClass, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);

    const icon = document.createElement("i");
    icon.className = iconClass;
    button.appendChild(icon);
    button.addEventListener("click", onClick);
    return button;
}
function formatExifDate(value) {
    if (!value) return "";

    const normalized = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatFNumber(value) {
    if (!value) return "";
    return `f/${Number(value).toString()}`;
}

function createStat(label, value) {
    if (!value) return null;

    const stat = document.createElement("div");
    stat.className = "stat";

    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;

    const span = document.createElement("span");
    span.textContent = value;

    stat.appendChild(strong);
    stat.appendChild(span);
    return stat;
}

function renderPhotoDetail(container, photoFiles, selectedIndex, metadataByFile, entry) {
    document.body.classList.add("photography-project-mode");

    const fileName = photoFiles[selectedIndex];
    const metadata = metadataByFile.get(fileName) || {};
    const previousPhoto = photoFiles[(selectedIndex - 1 + photoFiles.length) % photoFiles.length];
    const nextPhoto = photoFiles[(selectedIndex + 1) % photoFiles.length];
    preloadPhoto(previousPhoto);
    preloadPhoto(nextPhoto);
    const camera = [metadata.Make, metadata.Model].filter(Boolean).join(" ");
    const settings = [metadata.ExposureTime, formatFNumber(metadata.FNumber), metadata.ISO ? `ISO ${metadata.ISO}` : ""].filter(Boolean).join("  ");
    const dimensions = metadata.ImageWidth && metadata.ImageHeight ? `${metadata.ImageWidth} x ${metadata.ImageHeight}` : "";

    const caption = entry.captions.get(fileName) || "";
    document.title = `${entry.title} - ${fileName}`;

    const detail = document.createElement("section");
    detail.className = "photo-detail";
    detail.setAttribute("aria-label", "Photography detail");

    const mediaPanel = document.createElement("div");
    mediaPanel.className = "photo-detail-media";

    const image = document.createElement("img");
    image.src = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    image.alt = "Photography work " + (selectedIndex + 1);
    mediaPanel.appendChild(image);

    const goToPhoto = fileNameToOpen => {
        window.location.href = `photography.html?photo=${encodeURIComponent(fileNameToOpen)}`;
    };

    mediaPanel.appendChild(createPhotoNavButton("Previous photo", "fa fa-chevron-left", "photo-nav-button photo-nav-prev", () => goToPhoto(previousPhoto)));
    mediaPanel.appendChild(createPhotoNavButton("Next photo", "fa fa-chevron-right", "photo-nav-button photo-nav-next", () => goToPhoto(nextPhoto)));
    mediaPanel.appendChild(createPhotoNavButton("Back to photography", "fa fa-arrow-left", "photo-nav-button photo-nav-back", () => {
        window.location.href = "photography.html";
    }));

    const infoPanel = document.createElement("aside");
    infoPanel.className = "photo-detail-info";


    const descriptionPanel = document.createElement("div");
    descriptionPanel.className = "project-description-container";

    const title = document.createElement("h1");
    title.textContent = entry.title;

    const description = document.createElement("p");
    description.textContent = entry.context || `Photo ${selectedIndex + 1} of ${photoFiles.length}`;

    descriptionPanel.appendChild(title);
    descriptionPanel.appendChild(description);

    const sectionLabel = document.createElement("h3");
    sectionLabel.textContent = caption ? "Caption" : "Collection";

    const captionText = document.createElement("p");
    captionText.className = "photo-caption";
    captionText.textContent = caption || `Photo ${selectedIndex + 1} of ${photoFiles.length}`;

    const tagContainer = document.createElement("div");
    tagContainer.className = "project-tags-container";

    const tag = document.createElement("div");
    tag.className = "software-tag";
    tag.textContent = "Photography";
    tagContainer.appendChild(tag);

    const statsContainer = document.createElement("div");
    statsContainer.className = "project-stats-container";

    [
        createStat("Image", `${selectedIndex + 1} / ${photoFiles.length}`),
        createStat("Date", entry.date),
        createStat("Location", entry.location),
        createStat("Camera", camera),
        createStat("Lens", metadata.LensModel),
        createStat("Settings", settings),
        createStat("Focal Length", metadata.FocalLength),
        createStat("Taken", formatExifDate(metadata.DateTimeOriginal || metadata.CreateDate)),
        createStat("Dimensions", dimensions),
        createStat("Orientation", metadata.Orientation),
        createStat("File", fileName)
    ].filter(Boolean).forEach(stat => statsContainer.appendChild(stat));


    const fullImageLink = document.createElement("a");
    fullImageLink.className = "photo-action photo-action-secondary";
    fullImageLink.href = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    fullImageLink.target = "_blank";
    fullImageLink.rel = "noopener noreferrer";
    fullImageLink.textContent = "Open Full Image";

    infoPanel.appendChild(descriptionPanel);
    infoPanel.appendChild(document.createElement("hr"));
    infoPanel.appendChild(sectionLabel);
    infoPanel.appendChild(tagContainer);
    infoPanel.appendChild(document.createElement("hr"));
    infoPanel.appendChild(statsContainer);
    infoPanel.appendChild(fullImageLink);

    detail.appendChild(mediaPanel);
    detail.appendChild(infoPanel);
    container.appendChild(detail);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            window.location.href = "photography.html";
        } else if (event.key === "ArrowLeft") {
            window.location.href = `photography.html?photo=${encodeURIComponent(previousPhoto)}`;
        } else if (event.key === "ArrowRight") {
            window.location.href = `photography.html?photo=${encodeURIComponent(nextPhoto)}`;
        }
    });
}

async function loadPhotography() {
    const gallery = document.getElementById("photography-gallery");
    if (!gallery) return;

    try {
        const response = await fetch(`${PHOTOGRAPHY_MEDIA_PATH}?v=${PHOTOGRAPHY_CACHE_VERSION}`);
        if (!response.ok) throw new Error("Unable to load photography media list");

        const photoFiles = parsePhotoLines(await response.text());
        if (photoFiles.length === 0) {
            showPhotographyEmptyState(gallery);
            return;
        }

        const selectedIndex = getSelectedPhotoIndex(photoFiles);
        if (selectedIndex !== -1) {
            if (window.PortfolioControls) window.PortfolioControls.initViewControls({ showResize: false });
            const metadataByFile = await fetchPhotoMetadata();
            const entry = await fetchPhotographyEntry();
            gallery.classList.remove("photography-grid");
            gallery.classList.add("photography-detail-shell");
            renderPhotoDetail(gallery, photoFiles, selectedIndex, metadataByFile, entry);
            return;
        }

        if (window.PortfolioControls) {
            window.PortfolioControls.initViewControls({
                thumbnailContainer: gallery,
                storageKey: "photographyThumbnailColumns"
            });
        }

        const fragment = document.createDocumentFragment();
        photoFiles.forEach((fileName, index) => {
            fragment.appendChild(createPhotoCard(fileName, index));
        });
        gallery.appendChild(fragment);
    } catch (error) {
        console.error("Error loading photography:", error);
        showPhotographyEmptyState(gallery);
    }
}

document.addEventListener("DOMContentLoaded", loadPhotography);
