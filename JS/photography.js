const PHOTOGRAPHY_CACHE_VERSION = "1.2";
const PHOTOGRAPHY_MEDIA_PATH = "../Projects/Photography/media.txt";
const PHOTOGRAPHY_BASE_PATH = "../Projects/Photography/";
const PHOTOGRAPHY_THUMB_PATH = "../Projects/Photography/thumbs/";

function parsePhotoLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
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

function getSelectedPhotoIndex(photoFiles) {
    const selectedPhoto = new URLSearchParams(window.location.search).get("photo");
    if (!selectedPhoto) return -1;

    return photoFiles.findIndex(fileName => fileName === selectedPhoto);
}

function createDetailLink(label, fileName, className) {
    const link = document.createElement("a");
    link.className = className;
    link.href = `photography.html?photo=${encodeURIComponent(fileName)}`;
    link.textContent = label;
    return link;
}

function renderPhotoDetail(container, photoFiles, selectedIndex) {
    const fileName = photoFiles[selectedIndex];
    const previousPhoto = photoFiles[(selectedIndex - 1 + photoFiles.length) % photoFiles.length];
    const nextPhoto = photoFiles[(selectedIndex + 1) % photoFiles.length];

    const detail = document.createElement("section");
    detail.className = "photo-detail";
    detail.setAttribute("aria-label", "Photography detail");

    const mediaPanel = document.createElement("div");
    mediaPanel.className = "photo-detail-media";

    const image = document.createElement("img");
    image.src = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    image.alt = "Photography work " + (selectedIndex + 1);
    mediaPanel.appendChild(image);

    const infoPanel = document.createElement("aside");
    infoPanel.className = "photo-detail-info";

    const backLink = document.createElement("a");
    backLink.className = "photo-back-link";
    backLink.href = "photography.html";
    backLink.textContent = "Back to Photography";

    const title = document.createElement("h1");
    title.textContent = "Photography";

    const counter = document.createElement("p");
    counter.className = "photo-counter";
    counter.textContent = `Photo ${selectedIndex + 1} of ${photoFiles.length}`;

    const fileLabel = document.createElement("p");
    fileLabel.className = "photo-file-name";
    fileLabel.textContent = fileName;

    const actions = document.createElement("div");
    actions.className = "photo-detail-actions";
    actions.appendChild(createDetailLink("Previous", previousPhoto, "photo-action"));
    actions.appendChild(createDetailLink("Next", nextPhoto, "photo-action"));

    const fullImageLink = document.createElement("a");
    fullImageLink.className = "photo-action photo-action-secondary";
    fullImageLink.href = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    fullImageLink.target = "_blank";
    fullImageLink.rel = "noopener noreferrer";
    fullImageLink.textContent = "Open Full Image";

    infoPanel.appendChild(backLink);
    infoPanel.appendChild(title);
    infoPanel.appendChild(counter);
    infoPanel.appendChild(fileLabel);
    infoPanel.appendChild(actions);
    infoPanel.appendChild(fullImageLink);

    detail.appendChild(mediaPanel);
    detail.appendChild(infoPanel);
    container.appendChild(detail);
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
            gallery.classList.remove("photography-grid");
            gallery.classList.add("photography-detail-shell");
            renderPhotoDetail(gallery, photoFiles, selectedIndex);
            return;
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


