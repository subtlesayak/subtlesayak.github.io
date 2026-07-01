const CACHE_VERSION = "2.3";

// Function to create a thumbnail with overlay icons
function createThumbnail(src, alt, galleryPageUrl, hasMultipleImages, hasVideo, hasYouTube, hasSketchfab) {
    const thumbnailLink = document.createElement("a");
    thumbnailLink.href = galleryPageUrl;
    thumbnailLink.classList.add("thumbnail-link");
    thumbnailLink.setAttribute("aria-label", "Open " + alt);

    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.classList.add("thumbnail");

    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = src;
    thumbnailImg.alt = alt;

    const thumbnailTitle = document.createElement("div");
    thumbnailTitle.classList.add("thumbnail-title");
    thumbnailTitle.textContent = alt;

    let iconIndex = 0;

    if (hasMultipleImages) {
        const multipleImagesIcon = document.createElement("i");
        multipleImagesIcon.className = "fa-solid fa-layer-group overlay-icon";
        multipleImagesIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(multipleImagesIcon);
        iconIndex++;
    }

    if (hasVideo) {
        const videoIcon = document.createElement("i");
        videoIcon.className = "fa-solid fa-video overlay-icon";
        videoIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(videoIcon);
        iconIndex++;
    }

    if (hasYouTube) {
        const youtubeIcon = document.createElement("i");
        youtubeIcon.className = "fa-brands fa-youtube overlay-icon";
        youtubeIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(youtubeIcon);
        iconIndex++;
    }

    if (hasSketchfab) {
        const sketchfabIcon = document.createElement("i");
        sketchfabIcon.className = "fa-solid fa-cube overlay-icon";
        sketchfabIcon.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(sketchfabIcon);
        iconIndex++;
    }

    thumbnailDiv.appendChild(thumbnailImg);
    thumbnailDiv.appendChild(thumbnailTitle);
    thumbnailLink.appendChild(thumbnailDiv);

    return thumbnailLink;
}

// Get the thumbnail container element
const thumbnailContainer = document.getElementById("thumbnail-container");

if (window.PortfolioControls) {
    window.PortfolioControls.initViewControls({
        thumbnailContainer,
        storageKey: "portfolioThumbnailColumns"
    });
}

function fetchText(path) {
    return fetch(`${path}?v=${CACHE_VERSION}`).then(response => {
        if (!response.ok) {
            throw new Error(`Unable to load ${path}`);
        }

        return response.text();
    });
}

function parseLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
}

function createPortfolioEmptyState() {
    const emptyState = document.createElement("div");
    emptyState.className = "portfolio-empty";

    const heading = document.createElement("h1");
    heading.textContent = "Selected work coming soon";

    const body = document.createElement("p");
    body.textContent = "Portfolio case studies are being curated. In the meantime, view current work and visual explorations on Behance.";

    const link = document.createElement("a");
    link.href = "https://www.behance.net/sayaksajith";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open Behance";

    emptyState.appendChild(heading);
    emptyState.appendChild(body);
    emptyState.appendChild(link);

    return emptyState;
}

// Function to fetch and parse the description.txt file
function fetchProjectData(projectName) {
    const descriptionPath = `../Projects/${projectName}/description.txt`;
    const mediaPath = `../Projects/${projectName}/media.txt`;

    return Promise.all([
        fetchText(descriptionPath),
        fetchText(mediaPath)
    ])
    .then(([descriptionText, mediaText]) => {
        const [title, description, tags, thumbnailUrl, htmlFileName] = descriptionText.split("---").map(line => line.trim());
        const galleryPageUrl = descriptionPath.replace("description.txt", htmlFileName);

        const mediaLines = parseLines(mediaText);
        const hasMultipleImages = mediaLines.filter(line => line.match(/\.(jpeg|jpg|gif|png)$/i)).length > 1;
        const hasVideo = mediaLines.some(line => line.match(/\.(mp4)$/i));
        const hasYouTube = mediaLines.some(line => line.includes("youtube.com"));
        const hasSketchfab = mediaLines.some(line => line.includes("sketchfab.com"));

        // Find the banner image
        const bannerImageLine = mediaLines.find(line => line.endsWith("*"));
        const bannerImageUrl = bannerImageLine ? bannerImageLine.replace("*", "").trim() : null;

        return {
            src: thumbnailUrl,
            alt: title,
            galleryPageUrl,
            hasMultipleImages,
            hasVideo,
            hasYouTube,
            hasSketchfab,
            bannerImageUrl
        };
    })
    .catch(error => {
        console.error(`Error loading data for project: ${projectName}`, error);
        return null;
    });
}

// Function to fetch the projects.txt file
function fetchProjects() {
    return fetchText("../Config/projects.txt")
        .then(parseLines)
        .catch(error => {
            console.error("Error loading projects:", error);
            return [];
        });
}

fetchProjects().then(projectNames => {
    if (projectNames.length === 0) {
        thumbnailContainer.appendChild(createPortfolioEmptyState());
        return;
    }

    const fragment = document.createDocumentFragment();

    Promise.all(projectNames.map(fetchProjectData)).then(projectResults => {
        projectResults.filter(Boolean).forEach(project => {
            const thumbnail = createThumbnail(
                project.src,
                project.alt,
                project.galleryPageUrl,
                project.hasMultipleImages,
                project.hasVideo,
                project.hasYouTube,
                project.hasSketchfab
            );
            fragment.appendChild(thumbnail);
        });

        thumbnailContainer.appendChild(fragment);
    });
});
