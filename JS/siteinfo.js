(function () {
    const SITE_INFO_PATH = "Config/site.txt?v=1.0";

    function firstContentLine(text) {
        return text
            .split(/\r?\n/)
            .map(line => line.trim())
            .find(Boolean) || "";
    }

    function createSeparator() {
        const separator = document.createElement("span");
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = " | ";
        return separator;
    }

    function renderSiteMeta(text) {
        const line = firstContentLine(text);
        if (!line || document.querySelector(".site-meta")) return;

        const meta = document.createElement("div");
        meta.className = "site-meta";

        const updated = document.createElement("span");
        updated.textContent = line;
        meta.appendChild(updated);
        meta.appendChild(createSeparator());

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
            renderSiteMeta(await response.text());
        } catch (error) {
            console.error("Error loading site info:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", loadSiteInfo);
}());
