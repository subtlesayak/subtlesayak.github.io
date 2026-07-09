(function () {
    const container = document.getElementById("sitemap-container");
    const cacheVersion = "1.0";

    function parseLines(text) {
        return text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith("#"));
    }

    function parseProjectDescription(text) {
        const parts = text.split("---").map(part => part.trim());
        return {
            title: parts[0] || "Untitled Project",
            page: parts[4] || ""
        };
    }

    function parseEntry(text) {
        const parts = text.split("---").map(part => part.trim());
        return {
            title: parts[0] || "Untitled",
            date: parts[1] || ""
        };
    }

    async function fetchText(path, fallback) {
        const response = await fetch(`${path}?v=${cacheVersion}`);
        if (!response.ok) {
            if (fallback !== undefined) return fallback;
            throw new Error(`Unable to load ${path}`);
        }
        return response.text();
    }

    function createSection(title, description) {
        const section = document.createElement("section");
        section.className = "sitemap-section";

        const heading = document.createElement("h2");
        heading.textContent = title;
        section.appendChild(heading);

        if (description) {
            const body = document.createElement("p");
            body.textContent = description;
            section.appendChild(body);
        }

        const list = document.createElement("ul");
        list.className = "sitemap-list";
        section.appendChild(list);
        return { section, list };
    }

    function appendLink(list, href, label, metaText) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        item.appendChild(link);

        if (metaText) {
            const meta = document.createElement("span");
            meta.className = "sitemap-muted";
            meta.textContent = ` ${metaText}`;
            item.appendChild(meta);
        }

        list.appendChild(item);
    }

    async function getProjectLinks() {
        const folders = parseLines(await fetchText("Config/projects.txt", ""));
        return Promise.all(folders.map(async folder => {
            const description = parseProjectDescription(await fetchText(`Projects/${encodeURIComponent(folder)}/description.txt`, ""));
            return {
                title: description.title,
                href: description.page ? `Projects/${encodeURIComponent(folder)}/${description.page}` : `Projects/${encodeURIComponent(folder)}/`
            };
        }));
    }

    async function getArticleLinks() {
        const folders = parseLines(await fetchText("Config/articles.txt", ""));
        return Promise.all(folders.map(async folder => {
            const entry = parseEntry(await fetchText(`Articles/${encodeURIComponent(folder)}/article.txt`, ""));
            return {
                title: entry.title,
                meta: entry.date,
                href: `articles.html#${encodeURIComponent(folder)}`
            };
        }));
    }

    function collectionBase(collectionId) {
        return collectionId === "."
            ? "Projects/Photography"
            : `Projects/Photography/Collections/${encodeURIComponent(collectionId)}`;
    }

    async function getPhotographyLinks() {
        const collections = parseLines(await fetchText("Projects/Photography/collections.txt", "."));
        return Promise.all(collections.map(async collectionId => {
            const entry = parseEntry(await fetchText(`${collectionBase(collectionId)}/entry.txt`, ""));
            return {
                title: entry.title,
                meta: entry.date,
                href: `photography.html?collection=${encodeURIComponent(collectionId)}`
            };
        }));
    }

    async function renderSitemap() {
        if (!container) return;

        const panel = document.createElement("div");
        panel.className = "sitemap-panel";

        const intro = document.createElement("section");
        intro.className = "sitemap-section";
        const title = document.createElement("h1");
        title.textContent = "Sitemap";
        const description = document.createElement("p");
        description.textContent = "A simple index of the main pages, projects, photography collections, and articles.";
        intro.appendChild(title);
        intro.appendChild(description);
        panel.appendChild(intro);

        const mainPages = createSection("Pages", "");
        [
            ["index.html", "Portfolio"],
            ["photography.html", "Photography"],
            ["articles.html", "Articles"],
            ["about.html", "About"]
        ].forEach(([href, label]) => appendLink(mainPages.list, href, label));
        panel.appendChild(mainPages.section);

        const projectSection = createSection("Projects", "Loaded from Config/projects.txt.");
        (await getProjectLinks()).forEach(project => appendLink(projectSection.list, project.href, project.title));
        panel.appendChild(projectSection.section);

        const photographySection = createSection("Photography Collections", "Loaded from Projects/Photography/collections.txt.");
        (await getPhotographyLinks()).forEach(collection => appendLink(photographySection.list, collection.href, collection.title, collection.meta));
        panel.appendChild(photographySection.section);

        const articleSection = createSection("Articles", "Loaded from Config/articles.txt.");
        (await getArticleLinks()).forEach(article => appendLink(articleSection.list, article.href, article.title, article.meta));
        panel.appendChild(articleSection.section);

        container.replaceChildren(panel);
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderSitemap().catch(error => {
            console.error("Error loading sitemap:", error);
            container.textContent = "Sitemap could not be loaded.";
        });
    });
}());
