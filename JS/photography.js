const PHOTOGRAPHY_CACHE_VERSION = "1.0";
const PHOTOGRAPHY_MEDIA_PATH = "../Projects/Photography/media.txt";
const PHOTOGRAPHY_BASE_PATH = "../Projects/Photography/";

function parsePhotoLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
}

function createPhotoCard(fileName, index) {
    const link = document.createElement("a");
    link.className = "photo-card";
    link.href = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Open photo " + (index + 1));

    const image = document.createElement("img");
    image.src = PHOTOGRAPHY_BASE_PATH + encodeURI(fileName);
    image.alt = "Photography work " + (index + 1);
    image.loading = "lazy";
    image.decoding = "async";

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
