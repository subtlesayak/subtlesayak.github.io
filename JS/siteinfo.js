(function () {
    const SITE_INFO_PATH = "Config/site.txt?v=1.1";
    const UPDATED_PAGE_NAMES = new Set(["index.html", "photography.html", "articles.html", "projects.html"]);

    function firstContentLine(text) {
        return text
            .split(/\r?\n/)
            .map(line => line.trim())
            .find(Boolean) || "";
    }

    function currentPageName() {
        return window.location.pathname.split("/").pop() || "index.html";
    }

    function createSectionUpdatedLine(line) {
        const updated = document.createElement("p");
        updated.className = "section-updated";
        updated.textContent = line;
        return updated;
    }

    function sectionMetaTarget() {
        const pageName = currentPageName();
        if (!UPDATED_PAGE_NAMES.has(pageName)) return null;
        if (pageName === "photography.html") return document.querySelector(".photography-shell");
        if (pageName === "articles.html") return document.querySelector(".articles-panel");
        if (pageName === "projects.html") return document.querySelector(".code-projects-panel");
        return document.querySelector(".bottom-container");
    }

    function renderSectionUpdated(text) {
        const line = firstContentLine(text);
        const target = line ? sectionMetaTarget() : null;
        if (!target || target.querySelector(".section-updated")) return;
        target.prepend(createSectionUpdatedLine(line));
    }

    function renderSiteMeta() {
        if (document.querySelector(".site-meta")) return;

        const meta = document.createElement("div");
        meta.className = "site-meta";

        const sitemap = document.createElement("a");
        sitemap.href = "sitemap.html";
        sitemap.textContent = "Sitemap";
        meta.appendChild(sitemap);

        const container = document.querySelector(".main-container") || document.body;
        container.appendChild(meta);
    }

    async function loadSiteInfo() {
        try {
            const response = await fetch(SITE_INFO_PATH);
            if (!response.ok) return;
            renderSectionUpdated(await response.text());
            renderSiteMeta();
        } catch (error) {
            console.error("Error loading site info:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", loadSiteInfo);
}());