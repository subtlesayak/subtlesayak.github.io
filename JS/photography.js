const PHOTOGRAPHY_CACHE_VERSION = "1.9";
const PHOTOGRAPHY_COLLECTIONS_PATH = "../Projects/Photography/collections.txt";
const PHOTOGRAPHY_ROOT_ID = ".";
const PHOTOGRAPHY_BASE_PATH = "../Projects/Photography/";
const PHOTOGRAPHY_COLLECTIONS_BASE_PATH = "../Projects/Photography/Collections/";
const PHOTOGRAPHY_METADATA_PATH = "../Projects/Photography/metadata.json";

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

function getCollectionBasePath(collectionId) {
    return collectionId === PHOTOGRAPHY_ROOT_ID
        ? PHOTOGRAPHY_BASE_PATH
        : `${PHOTOGRAPHY_COLLECTIONS_BASE_PATH}${encodeURI(collectionId)}/`;
}

function getCollectionMediaPath(collectionId) {
    return `${getCollectionBasePath(collectionId)}media.txt`;
}

function getCollectionEntryPath(collectionId) {
    return `${getCollectionBasePath(collectionId)}entry.txt`;
}

function getImagePath(collectionId, fileName) {
    return `${getCollectionBasePath(collectionId)}${encodeURI(fileName)}`;
}

function getThumbPath(collectionId, fileName) {
    return `${getCollectionBasePath(collectionId)}thumbs/${encodeURI(fileName)}`;
}

function collectionUrl(collectionId) {
    return `photography.html?collection=${encodeURIComponent(collectionId)}`;
}

function photoUrl(collectionId, fileName) {
    return `photography.html?collection=${encodeURIComponent(collectionId)}&photo=${encodeURIComponent(fileName)}`;
}

function getSelectedCollectionId(collections) {
    const params = new URLSearchParams(window.location.search);
    const collection = params.get("collection") || (params.get("photo") ? PHOTOGRAPHY_ROOT_ID : "");
    if (!collection) return "";
    return collections.some(item => item.id === collection) ? collection : "";
}

function getSelectedPhotoIndex(photoFiles) {
    const selectedPhoto = new URLSearchParams(window.location.search).get("photo");
    if (!selectedPhoto) return -1;
    return photoFiles.findIndex(fileName => fileName === selectedPhoto);
}

async function fetchText(path, fallback) {
    const response = await fetch(`${path}?v=${PHOTOGRAPHY_CACHE_VERSION}`);
    if (!response.ok) {
        if (fallback !== undefined) return fallback;
        throw new Error(`Unable to load ${path}`);
    }
    return response.text();
}

async function fetchCollectionIds() {
    try {
        const text = await fetchText(PHOTOGRAPHY_COLLECTIONS_PATH, PHOTOGRAPHY_ROOT_ID);
        const ids = parsePhotoLines(text);
        return ids.length ? ids : [PHOTOGRAPHY_ROOT_ID];
    } catch (error) {
        console.error("Error loading photography collections:", error);
        return [PHOTOGRAPHY_ROOT_ID];
    }
}

async function fetchCollection(collectionId) {
    const [entryText, mediaText] = await Promise.all([
        fetchText(getCollectionEntryPath(collectionId), "Photography Collection\n---\n\n---\n\n---\n\n---\n"),
        fetchText(getCollectionMediaPath(collectionId), "")
    ]);

    return {
        id: collectionId,
        entry: parsePhotographyEntry(entryText),
        photos: parsePhotoLines(mediaText)
    };
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

function showPhotographyEmptyState(container) {
    const emptyState = document.createElement("div");
    emptyState.className = "portfolio-empty";

    const heading = document.createElement("h1");
    heading.textContent = "Photography";

    const body = document.createElement("p");
    body.textContent = "Add collections to Projects/Photography/collections.txt to show photos here.";

    emptyState.appendChild(heading);
    emptyState.appendChild(body);
    container.appendChild(emptyState);
}

function createCollectionCard(collection) {
    const link = document.createElement("a");
    link.className = "photo-collection-card";
    link.href = collectionUrl(collection.id);

    const coverName = collection.photos[0];
    const imageWrap = document.createElement("div");
    imageWrap.className = "photo-collection-cover";

    if (coverName) {
        const image = document.createElement("img");
        const fullImageUrl = getImagePath(collection.id, coverName);
        image.src = getThumbPath(collection.id, coverName);
        image.alt = collection.entry.title;
        image.loading = "lazy";
        image.decoding = "async";
        image.onerror = () => {
            image.onerror = null;
            image.src = fullImageUrl;
        };
        imageWrap.appendChild(image);
    }

    const body = document.createElement("div");
    body.className = "photo-collection-body";

    const meta = document.createElement("span");
    meta.className = "photo-collection-meta";
    meta.textContent = [collection.entry.date, collection.entry.location].filter(Boolean).join(" | ") || `${collection.photos.length} photos`;

    const title = document.createElement("h2");
    title.textContent = collection.entry.title;

    const description = document.createElement("p");
    description.textContent = collection.entry.context || `${collection.photos.length} photos`;

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(description);
    link.appendChild(imageWrap);
    link.appendChild(body);
    return link;
}

function renderCollectionList(container, collections) {
    document.body.classList.remove("photography-project-mode");
    container.className = "photography-collections";

    const fragment = document.createDocumentFragment();
    collections.forEach(collection => fragment.appendChild(createCollectionCard(collection)));
    container.replaceChildren(fragment);

    if (window.PortfolioControls) window.PortfolioControls.initViewControls({ showResize: false });
}

function createPhotoCard(collection, fileName, index) {
    const link = document.createElement("a");
    link.className = "photo-card";
    link.href = photoUrl(collection.id, fileName);
    link.setAttribute("aria-label", `Open ${collection.entry.title} photo ${index + 1}`);

    const image = document.createElement("img");
    const fullImageUrl = getImagePath(collection.id, fileName);
    image.src = getThumbPath(collection.id, fileName);
    image.alt = collection.entry.captions.get(fileName) || `${collection.entry.title} ${index + 1}`;
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

function renderCollectionGallery(container, collection) {
    document.body.classList.remove("photography-project-mode");
    container.className = "photography-collection-view";

    const intro = document.createElement("section");
    intro.className = "photography-entry-intro";

    const back = document.createElement("a");
    back.className = "photography-collection-back";
    back.href = "photography.html";
    back.textContent = "Back to collections";

    const title = document.createElement("h1");
    title.textContent = collection.entry.title;

    const meta = document.createElement("p");
    meta.className = "photography-entry-meta";
    meta.textContent = [collection.entry.date, collection.entry.location].filter(Boolean).join(" | ");

    const context = document.createElement("p");
    context.className = "photography-entry-context";
    context.textContent = collection.entry.context || `${collection.photos.length} photos`;

    intro.appendChild(back);
    intro.appendChild(title);
    if (meta.textContent) intro.appendChild(meta);
    intro.appendChild(context);

    const grid = document.createElement("div");
    grid.className = "photography-grid";
    collection.photos.forEach((fileName, index) => grid.appendChild(createPhotoCard(collection, fileName, index)));

    container.replaceChildren(intro, grid);

    if (window.PortfolioControls) {
        window.PortfolioControls.initViewControls({
            thumbnailContainer: grid,
            storageKey: "photographyThumbnailColumns"
        });
    }
}

function preloadPhoto(collectionId, fileName) {
    const image = new Image();
    image.decoding = "async";
    image.src = getImagePath(collectionId, fileName);
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

function renderPhotoDetail(container, collection, selectedIndex, metadataByFile) {
    document.body.classList.add("photography-project-mode");

    const fileName = collection.photos[selectedIndex];
    const metadata = metadataByFile.get(fileName) || {};
    const previousPhoto = collection.photos[(selectedIndex - 1 + collection.photos.length) % collection.photos.length];
    const nextPhoto = collection.photos[(selectedIndex + 1) % collection.photos.length];
    preloadPhoto(collection.id, previousPhoto);
    preloadPhoto(collection.id, nextPhoto);

    const camera = [metadata.Make, metadata.Model].filter(Boolean).join(" ");
    const settings = [metadata.ExposureTime, formatFNumber(metadata.FNumber), metadata.ISO ? `ISO ${metadata.ISO}` : ""].filter(Boolean).join("  ");
    const dimensions = metadata.ImageWidth && metadata.ImageHeight ? `${metadata.ImageWidth} x ${metadata.ImageHeight}` : "";
    const caption = collection.entry.captions.get(fileName) || "";

    document.title = `${collection.entry.title} - ${fileName}`;

    const detail = document.createElement("section");
    detail.className = "photo-detail";
    detail.setAttribute("aria-label", "Photography detail");

    const mediaPanel = document.createElement("div");
    mediaPanel.className = "photo-detail-media";

    const image = document.createElement("img");
    image.src = getImagePath(collection.id, fileName);
    image.alt = caption || `${collection.entry.title} ${selectedIndex + 1}`;
    mediaPanel.appendChild(image);

    const goToPhoto = fileNameToOpen => {
        window.location.href = photoUrl(collection.id, fileNameToOpen);
    };

    mediaPanel.appendChild(createPhotoNavButton("Previous photo", "fa fa-chevron-left", "photo-nav-button photo-nav-prev", () => goToPhoto(previousPhoto)));
    mediaPanel.appendChild(createPhotoNavButton("Next photo", "fa fa-chevron-right", "photo-nav-button photo-nav-next", () => goToPhoto(nextPhoto)));
    mediaPanel.appendChild(createPhotoNavButton("Back to collection", "fa fa-arrow-left", "photo-nav-button photo-nav-back", () => {
        window.location.href = collectionUrl(collection.id);
    }));

    const infoPanel = document.createElement("aside");
    infoPanel.className = "photo-detail-info";

    const descriptionPanel = document.createElement("div");
    descriptionPanel.className = "project-description-container";

    const title = document.createElement("h1");
    title.textContent = collection.entry.title;

    const description = document.createElement("p");
    description.textContent = collection.entry.context || `Photo ${selectedIndex + 1} of ${collection.photos.length}`;

    descriptionPanel.appendChild(title);
    descriptionPanel.appendChild(description);

    const sectionLabel = document.createElement("h3");
    sectionLabel.textContent = caption ? "Caption" : "Collection";

    const captionText = document.createElement("p");
    captionText.className = "photo-caption";
    captionText.textContent = caption || `Photo ${selectedIndex + 1} of ${collection.photos.length}`;

    const tagContainer = document.createElement("div");
    tagContainer.className = "project-tags-container";

    const tag = document.createElement("div");
    tag.className = "software-tag";
    tag.textContent = "Photography";
    tagContainer.appendChild(tag);

    const statsContainer = document.createElement("div");
    statsContainer.className = "project-stats-container";

    [
        createStat("Image", `${selectedIndex + 1} / ${collection.photos.length}`),
        createStat("Date", collection.entry.date),
        createStat("Location", collection.entry.location),
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
    fullImageLink.href = getImagePath(collection.id, fileName);
    fullImageLink.target = "_blank";
    fullImageLink.rel = "noopener noreferrer";
    fullImageLink.textContent = "Open Full Image";

    infoPanel.appendChild(descriptionPanel);
    infoPanel.appendChild(document.createElement("hr"));
    infoPanel.appendChild(sectionLabel);
    infoPanel.appendChild(captionText);
    infoPanel.appendChild(tagContainer);
    infoPanel.appendChild(document.createElement("hr"));
    infoPanel.appendChild(statsContainer);
    infoPanel.appendChild(fullImageLink);

    detail.appendChild(mediaPanel);
    detail.appendChild(infoPanel);
    container.replaceChildren(detail);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            window.location.href = collectionUrl(collection.id);
        } else if (event.key === "ArrowLeft") {
            window.location.href = photoUrl(collection.id, previousPhoto);
        } else if (event.key === "ArrowRight") {
            window.location.href = photoUrl(collection.id, nextPhoto);
        }
    });
}

async function loadPhotography() {
    const gallery = document.getElementById("photography-gallery");
    if (!gallery) return;

    try {
        const collectionIds = await fetchCollectionIds();
        const collections = (await Promise.all(collectionIds.map(fetchCollection))).filter(collection => collection.photos.length);
        if (!collections.length) {
            showPhotographyEmptyState(gallery);
            return;
        }

        const selectedCollectionId = getSelectedCollectionId(collections);
        if (!selectedCollectionId) {
            renderCollectionList(gallery, collections);
            return;
        }

        const collection = collections.find(item => item.id === selectedCollectionId);
        const selectedIndex = getSelectedPhotoIndex(collection.photos);
        if (selectedIndex !== -1) {
            if (window.PortfolioControls) window.PortfolioControls.initViewControls({ showResize: false });
            const metadataByFile = collection.id === PHOTOGRAPHY_ROOT_ID ? await fetchPhotoMetadata() : new Map();
            gallery.classList.remove("photography-grid");
            gallery.classList.add("photography-detail-shell");
            renderPhotoDetail(gallery, collection, selectedIndex, metadataByFile);
            return;
        }

        renderCollectionGallery(gallery, collection);
    } catch (error) {
        console.error("Error loading photography:", error);
        showPhotographyEmptyState(gallery);
    }
}

document.addEventListener("DOMContentLoaded", loadPhotography);
