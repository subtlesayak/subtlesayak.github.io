const CACHE_VERSION = "2.7";

// Function to create a thumbnail with overlay icons
function createThumbnail(src, alt, label, context, galleryPageUrl, hasMultipleImages, hasVideo, hasYouTube, hasSketchfab, isFeatured = false) {
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

function fetchText(path) {
    return fetch(`${path}?v=${CACHE_VERSION}`).then(response => {
        if (!response.ok) {
            throw new Error(`Unable to load ${path}`);
        }

        return response.text();
    });
}

function fetchOptionalText(path) {
    return fetch(`${path}?v=${CACHE_VERSION}`)
        .then(response => response.ok ? response.text() : "")
        .catch(() => "");
}

function parseLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
}

function parseClientWebsites(text) {
    const parts = text
        .replace(/\r\n/g, "\n")
        .split(/\n---\n/)
        .map(part => part.trim());
    const websites = [];

    for (let index = 0; index < parts.length; index += 6) {
        const title = parts[index] || "";
        const liveUrl = parts[index + 3] || "";
        if (!title || !liveUrl) continue;

        websites.push({
            title,
            kind: parts[index + 1] || "Client Website",
            summary: parts[index + 2] || "",
            liveUrl,
            thumbnail: parts[index + 4] || "",
            tags: parts[index + 5] || ""
        });
    }

    return websites;
}

function createClientWebsiteThumbnail(website) {
    const thumbnailLink = createThumbnail(
        website.thumbnail,
        website.title,
        website.kind,
        website.summary,
        website.liveUrl,
        false,
        false,
        false,
        false
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

function loadClientWebsites() {
    if (!clientWebsitesSection || !clientWebsitesContainer) return;

    fetchText("../Config/client-websites.txt")
        .then(parseClientWebsites)
        .then(websites => {
            if (!websites.length) return;

            const fragment = document.createDocumentFragment();
            websites.forEach(website => fragment.appendChild(createClientWebsiteThumbnail(website)));
            clientWebsitesContainer.replaceChildren(fragment);
            clientWebsitesSection.hidden = false;
            document.dispatchEvent(new Event("portfolio:list-rendered"));
        })
        .catch(error => console.error("Error loading client websites:", error));
}

function inferProjectLabel(categories) {
    if (categories.includes("uiux")) return "Case Study";
    if (categories.includes("branding")) return "Brand Study";
    if (categories.includes("web")) return "Web Experiment";
    if (categories.includes("visual-design")) return "Visual Study";
    return "Project";
}

function createContextFallback(description) {
    const clean = description
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/View the full case study here:?/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    const firstSentence = clean.match(/^.*?[.!?](?:\s|$)/);
    const context = (firstSentence ? firstSentence[0] : clean).trim();
    return context.length > 140 ? `${context.slice(0, 137).trimEnd()}...` : context;
}

function parseProjectCard(cardText, description, categories) {
    const lines = parseLines(cardText);
    return {
        label: lines[0] || inferProjectLabel(categories),
        context: lines.slice(1).join(" ") || createContextFallback(description)
    };
}

function orderProjects(projectNames, selectedNames) {
    const configured = new Set(projectNames);
    const selected = selectedNames.filter((name, index) => configured.has(name) && selectedNames.indexOf(name) === index);
    const selectedSet = new Set(selected);
    return [...selected, ...projectNames.filter(name => !selectedSet.has(name))];
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
    const cardPath = `../Projects/${projectName}/card.txt`;
    const categoriesPath = `../Projects/${projectName}/categories.txt`;

    return Promise.all([
        fetchText(descriptionPath),
        fetchText(mediaPath),
        fetchOptionalText(cardPath),
        fetchOptionalText(categoriesPath)
    ])
    .then(([descriptionText, mediaText, cardText, categoriesText]) => {
        const [title, description, tags, thumbnailUrl, htmlFileName] = descriptionText.split("---").map(line => line.trim());
        const galleryPageUrl = descriptionPath.replace("description.txt", htmlFileName);
        const card = parseProjectCard(cardText, description, parseLines(categoriesText));

        const mediaLines = parseLines(mediaText);
        const hasMultipleImages = mediaLines.filter(line => line.match(/\.(?:avif|gif|jpe?g|png|webp)\*?$/i)).length > 1;
        const hasVideo = mediaLines.some(line => line.match(/\.(mp4)$/i));
        const hasYouTube = mediaLines.some(line => line.includes("youtube.com"));
        const hasSketchfab = mediaLines.some(line => line.includes("sketchfab.com"));

        // Find the banner image
        const bannerImageLine = mediaLines.find(line => line.endsWith("*"));
        const bannerImageUrl = bannerImageLine ? bannerImageLine.replace("*", "").trim() : null;

        return {
            projectName,
            src: thumbnailUrl,
            alt: title,
            label: card.label,
            context: card.context,
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

function fetchSelectedWork() {
    return fetchText("../Config/selected-work.txt")
        .then(parseLines)
        .catch(() => []);
}

loadClientWebsites();

Promise.all([fetchProjects(), fetchSelectedWork()]).then(([projectNames, selectedNames]) => {
    if (projectNames.length === 0) {
        thumbnailContainer.appendChild(createPortfolioEmptyState());
        return;
    }

    const fragment = document.createDocumentFragment();
    const selectedProjects = selectedNames.filter((name, index) => projectNames.includes(name) && selectedNames.indexOf(name) === index);
    const orderedProjectNames = orderProjects(projectNames, selectedProjects);
    const selectedSet = new Set(selectedProjects);

    Promise.all(orderedProjectNames.map(fetchProjectData)).then(projectResults => {
        projectResults.filter(Boolean).forEach((project, index) => {
            const thumbnail = createThumbnail(
                project.src,
                project.alt,
                project.label,
                project.context,
                project.galleryPageUrl,
                project.hasMultipleImages,
                project.hasVideo,
                project.hasYouTube,
                project.hasSketchfab,
                selectedSet.size ? selectedSet.has(project.projectName) : index < 3
            );
            fragment.appendChild(thumbnail);
        });

        thumbnailContainer.appendChild(fragment);
    });
});
