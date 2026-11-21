const CACHE_VERSION = "3.0";

// Function to create a thumbnail with overlay icons
function createThumbnail(src, alt, label, context, galleryPageUrl, hasMultipleImages, hasVideo, hasYouTube, hasSketchfab, isFeatured = false, isPriority = false) {
    const thumbnailLink = document.createElement("a");
    thumbnailLink.href = galleryPageUrl;
    thumbnailLink.classList.add("thumbnail-link");
    thumbnailLink.setAttribute("aria-label", "Open " + alt);

    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.classList.add("thumbnail");

    const thumbnailImg = document.createElement("img");
    thumbnailImg.loading = isPriority ? "eager" : "lazy";
    thumbnailImg.decoding = "async";
    if (isPriority) thumbnailImg.fetchPriority = "high";
    thumbnailImg.src = src;
    thumbnailImg.alt = alt;

    const thumbnailTitle = document.createElement("div");
    thumbnailTitle.classList.add("thumbnail-title");
    thumbnailTitle.textContent = alt;

    const thumbnailCopy = document.createElement("div");
    thumbnailCopy.className = "thumbnail-copy";

    const thumbnailLabel = document.createElement("span");
    thumbnailLabel.className = "thumbnail-card-label content-label";
    thumbnailLabel.textContent = label;

    const thumbnailContext = document.createElement("p");
    thumbnailContext.className = "thumbnail-context";
    thumbnailContext.textContent = context;

    thumbnailCopy.appendChild(thumbnailLabel);
    thumbnailCopy.appendChild(thumbnailTitle);
    thumbnailCopy.appendChild(thumbnailContext);

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

    if (isFeatured) {
        const featuredMarker = document.createElement("span");
        featuredMarker.className = "featured-marker";
        featuredMarker.textContent = "Selected";
        thumbnailDiv.appendChild(featuredMarker);
    }

    thumbnailDiv.appendChild(thumbnailImg);
    thumbnailDiv.appendChild(thumbnailCopy);
    thumbnailLink.appendChild(thumbnailDiv);

    return thumbnailLink;
}

// Get the thumbnail container element
const thumbnailContainer = document.getElementById("thumbnail-container");
const clientWebsitesSection = document.querySelector(".client-websites-section");
const clientWebsitesContainer = document.getElementById("client-websites-container");

if (window.PortfolioControls) {
    window.PortfolioControls.initViewControls({
        thumbnailContainers: [clientWebsitesContainer, thumbnailContainer],
        storageKey: "portfolioThumbnailColumns"
    });
}

function createClientWebsiteThumbnail(website, isPriority) {
    const thumbnailLink = createThumbnail(
        website.thumbnail,
        website.title,
        website.kind,
        website.summary,
        website.liveUrl,
        false,
        false,
        false,
        false,
        false,
        isPriority
    );

    thumbnailLink.target = "_blank";
    thumbnailLink.rel = "noopener noreferrer";
    thumbnailLink.setAttribute("aria-label", `Visit the ${website.title} website (opens in a new tab)`);

    const externalIcon = document.createElement("i");
    externalIcon.className = "fa-solid fa-arrow-up-right-from-square overlay-icon";
    externalIcon.setAttribute("aria-hidden", "true");
    thumbnailLink.querySelector(".thumbnail").appendChild(externalIcon);

    return thumbnailLink;
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

async function loadPortfolioCards() {
    try {
        const response = await fetch(`../Config/portfolio-cards.json?v=${CACHE_VERSION}`);
        if (!response.ok) throw new Error("Could not load portfolio cards");
        const {projects, websites} = await response.json();
        if (clientWebsitesSection && clientWebsitesContainer && websites.length) {
            clientWebsitesContainer.replaceChildren(...websites.map((website, index) =>
                createClientWebsiteThumbnail(website, index === 0)));
            clientWebsitesSection.hidden = false;
        }
        if (projects.length) {
            const fragment = document.createDocumentFragment();
            for (const [index, project] of projects.entries()) {
                fragment.appendChild(createThumbnail(
                    project.src, project.alt, project.label, project.context,
                    project.galleryPageUrl, project.hasMultipleImages, project.hasVideo,
                    project.hasYouTube, project.hasSketchfab, project.featured,
                    !websites.length && index === 0
                ));
            }
            thumbnailContainer.replaceChildren(fragment);
        } else {
            thumbnailContainer.appendChild(createPortfolioEmptyState());
        }
        document.dispatchEvent(new Event("portfolio:list-rendered"));
    } catch (error) {
        console.error("Error loading portfolio cards:", error);
        thumbnailContainer.appendChild(createPortfolioEmptyState());
    }
}

loadPortfolioCards();
