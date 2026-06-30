const CACHE_VERSION = "1.6";
const CATEGORY_FALLBACK = {
    slug: "other",
    label: "Other Work",
    description: "Projects without a category yet."
};

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

function fetchText(path, options = {}) {
    return fetch(`${path}?v=${CACHE_VERSION}`).then(response => {
        if (!response.ok) {
            throw new Error(`Unable to load ${path}`);
        }

        return response.text();
    }).catch(error => {
        if (options.optional) {
            return "";
        }

        throw error;
    });
}

function parseLines(text) {
    return text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
}

function parseCategories(text) {
    const parsedCategories = parseLines(text).map(line => {
        const [slug, label, description] = line.split("|").map(part => part.trim());
        if (!slug || !label) {
            return null;
        }

        return {
            slug,
            label,
            description: description || ""
        };
    }).filter(Boolean);

    const hasAll = parsedCategories.some(category => category.slug === "all");
    const hasFallback = parsedCategories.some(category => category.slug === CATEGORY_FALLBACK.slug);

    if (!hasAll) {
        parsedCategories.unshift({
            slug: "all",
            label: "All Work",
            description: "Complete project overview."
        });
    }

    if (!hasFallback) {
        parsedCategories.push(CATEGORY_FALLBACK);
    }

    return parsedCategories;
}

function parseProjectCategories(text) {
    return parseLines(text)
        .flatMap(line => line.split(","))
        .map(slug => slug.trim())
        .filter(Boolean);
}

function projectCountText(count) {
    return `${count} ${count === 1 ? "project" : "projects"}`;
}

function createSectionHeader(category, count) {
    const header = document.createElement("div");
    header.className = "category-header";

    const textWrap = document.createElement("div");
    textWrap.className = "category-heading";

    const eyebrow = document.createElement("span");
    eyebrow.className = "category-count";
    eyebrow.textContent = projectCountText(count);

    const title = document.createElement("h1");
    title.textContent = category.label;

    textWrap.appendChild(eyebrow);
    textWrap.appendChild(title);

    if (category.description) {
        const description = document.createElement("p");
        description.textContent = category.description;
        textWrap.appendChild(description);
    }

    header.appendChild(textWrap);
    return header;
}

function createEmptyCategoryState() {
    const emptyState = document.createElement("div");
    emptyState.className = "category-empty";

    const heading = document.createElement("h2");
    heading.textContent = "No projects here yet";

    const body = document.createElement("p");
    body.textContent = "Add a project to this category in the project text files.";

    emptyState.appendChild(heading);
    emptyState.appendChild(body);
    return emptyState;
}

function createCategorySection(category, projects) {
    const section = document.createElement("section");
    section.className = "category-section";
    section.id = `category-${category.slug}`;

    section.appendChild(createSectionHeader(category, projects.length));

    if (projects.length === 0) {
        section.appendChild(createEmptyCategoryState());
        return section;
    }

    const grid = document.createElement("div");
    grid.className = "category-grid";

    const fragment = document.createDocumentFragment();
    projects.forEach(project => {
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

    grid.appendChild(fragment);
    section.appendChild(grid);
    return section;
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

function createCategoryErrorState() {
    const errorState = document.createElement("div");
    errorState.className = "category-error";
    errorState.textContent = "Some project categories could not be loaded. Showing all projects instead.";
    return errorState;
}

// Function to fetch and parse the description.txt file
function fetchProjectData(projectName) {
    const descriptionPath = `../Projects/${projectName}/description.txt`;
    const mediaPath = `../Projects/${projectName}/media.txt`;
    const categoriesPath = `../Projects/${projectName}/categories.txt`;

    return Promise.all([
        fetchText(descriptionPath),
        fetchText(mediaPath),
        fetchText(categoriesPath, { optional: true })
    ])
    .then(([descriptionText, mediaText, categoriesText]) => {
        const [title, description, tags, thumbnailUrl, htmlFileName] = descriptionText.split("---").map(line => line.trim());
        const galleryPageUrl = descriptionPath.replace("description.txt", htmlFileName);

        const mediaLines = parseLines(mediaText);
        const hasMultipleImages = mediaLines.filter(line => line.match(/\.(jpeg|jpg|gif|png)$/i)).length > 1;
        const hasVideo = mediaLines.some(line => line.match(/\.(mp4)$/i));
        const hasYouTube = mediaLines.some(line => line.includes("youtube.com"));
        const hasSketchfab = mediaLines.some(line => line.includes("sketchfab.com"));
        const projectCategories = parseProjectCategories(categoriesText);

        // Find the banner image
        const bannerImageLine = mediaLines.find(line => line.endsWith("*"));
        const bannerImageUrl = bannerImageLine ? bannerImageLine.replace("*", "").trim() : null;

        return {
            projectName,
            src: thumbnailUrl,
            alt: title,
            galleryPageUrl,
            hasMultipleImages,
            hasVideo,
            hasYouTube,
            hasSketchfab,
            bannerImageUrl,
            categories: projectCategories
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

function fetchCategoryConfig() {
    return fetchText("../Config/categories.txt")
        .then(parseCategories)
        .catch(error => {
            console.error("Error loading categories:", error);
            return parseCategories("");
        });
}

function renderCategorySections(categories, projects) {
    thumbnailContainer.textContent = "";

    if (projects.length === 0) {
        thumbnailContainer.appendChild(createPortfolioEmptyState());
        return;
    }

    const configuredSlugs = new Set(categories.map(category => category.slug));
    const allCategory = categories.find(category => category.slug === "all") || {
        slug: "all",
        label: "All Work",
        description: "Complete project overview."
    };
    const fallbackCategory = categories.find(category => category.slug === CATEGORY_FALLBACK.slug) || CATEGORY_FALLBACK;
    const projectsByCategory = new Map();

    categories.forEach(category => {
        projectsByCategory.set(category.slug, []);
    });

    projects.forEach(project => {
        const knownProjectSlugs = project.categories.filter(slug => configuredSlugs.has(slug) && slug !== "all");
        const targetSlugs = knownProjectSlugs.length ? knownProjectSlugs : [fallbackCategory.slug];

        targetSlugs.forEach(slug => {
            if (!projectsByCategory.has(slug)) {
                projectsByCategory.set(slug, []);
            }

            projectsByCategory.get(slug).push(project);
        });
    });

    const fragment = document.createDocumentFragment();
    fragment.appendChild(createCategorySection(allCategory, projects));

    categories
        .filter(category => category.slug !== "all")
        .forEach(category => {
            const categoryProjects = projectsByCategory.get(category.slug) || [];
            fragment.appendChild(createCategorySection(category, categoryProjects));
        });

    thumbnailContainer.appendChild(fragment);
}

Promise.all([fetchProjects(), fetchCategoryConfig()])
    .then(([projectNames, categories]) => {
        return Promise.all(projectNames.map(fetchProjectData)).then(projectResults => {
            const projects = projectResults.filter(Boolean);
            renderCategorySections(categories, projects);
        });
    })
    .catch(error => {
        console.error("Error rendering portfolio categories:", error);
        thumbnailContainer.textContent = "";
        thumbnailContainer.appendChild(createCategoryErrorState());
    });
