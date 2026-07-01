(function () {
    const articlesContainer = document.getElementById("articles-container");
    const articlesConfigPath = "Config/articles.txt?v=1.0";

    function parseArticle(rawText) {
        const parts = rawText.split("---").map(part => part.trim());
        return {
            title: parts[0] || "Untitled Article",
            date: parts[1] || "",
            summary: parts[2] || "",
            body: parts.slice(3).join("\n\n").trim()
        };
    }

    function createParagraphs(text) {
        return text
            .split(/\n\s*\n/)
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => {
                const paragraph = document.createElement("p");
                paragraph.textContent = part.replace(/\s*\n\s*/g, " ");
                return paragraph;
            });
    }

    function slugFromFolder(folder) {
        return encodeURIComponent(folder);
    }

    function getActiveFolder(articles) {
        const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
        return articles.some(article => article.folder === hash) ? hash : "";
    }

    function renderArticleList(articles) {
        const fragment = document.createDocumentFragment();
        const header = document.createElement("div");
        header.className = "articles-heading";

        const title = document.createElement("h1");
        title.textContent = "Articles";
        header.appendChild(title);
        fragment.appendChild(header);

        const grid = document.createElement("div");
        grid.className = "articles-grid";

        articles.forEach(article => {
            const link = document.createElement("a");
            link.className = "article-card";
            link.href = `#${slugFromFolder(article.folder)}`;

            const meta = document.createElement("span");
            meta.className = "article-date";
            meta.textContent = article.date || "Article";
            link.appendChild(meta);

            const heading = document.createElement("h2");
            heading.textContent = article.title;
            link.appendChild(heading);

            if (article.summary) {
                const summary = document.createElement("p");
                summary.textContent = article.summary;
                link.appendChild(summary);
            }

            grid.appendChild(link);
        });

        fragment.appendChild(grid);
        articlesContainer.replaceChildren(fragment);
    }

    function renderArticleDetail(article) {
        const detail = document.createElement("article");
        detail.className = "article-detail";

        const back = document.createElement("a");
        back.className = "article-back";
        back.href = "articles.html";
        back.textContent = "Back to articles";
        detail.appendChild(back);

        const meta = document.createElement("span");
        meta.className = "article-date";
        meta.textContent = article.date || "Article";
        detail.appendChild(meta);

        const title = document.createElement("h1");
        title.textContent = article.title;
        detail.appendChild(title);

        if (article.summary) {
            const summary = document.createElement("p");
            summary.className = "article-summary";
            summary.textContent = article.summary;
            detail.appendChild(summary);
        }

        const body = document.createElement("div");
        body.className = "article-body";
        const paragraphs = createParagraphs(article.body || "Add the article body in Articles/First Article/article.txt.");
        paragraphs.forEach(paragraph => body.appendChild(paragraph));
        detail.appendChild(body);

        articlesContainer.replaceChildren(detail);
    }

    function renderArticles(articles) {
        const activeFolder = getActiveFolder(articles);
        const activeArticle = articles.find(article => article.folder === activeFolder);
        if (activeArticle) {
            renderArticleDetail(activeArticle);
        } else {
            renderArticleList(articles);
        }
    }

    async function loadArticles() {
        if (!articlesContainer) return;

        try {
            const configResponse = await fetch(articlesConfigPath);
            if (!configResponse.ok) throw new Error("Could not load Config/articles.txt");

            const folders = (await configResponse.text())
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean);

            if (!folders.length) throw new Error("No articles configured");

            const articles = await Promise.all(folders.map(async folder => {
                const response = await fetch(`Articles/${encodeURIComponent(folder)}/article.txt?v=1.0`);
                if (!response.ok) throw new Error(`Could not load article: ${folder}`);
                return { folder, ...parseArticle(await response.text()) };
            }));

            renderArticles(articles);
            window.addEventListener("hashchange", () => renderArticles(articles));
        } catch (error) {
            console.error("Error loading articles:", error);
            articlesContainer.innerHTML = '<div class="portfolio-empty"><h1>Articles</h1><p>Add article folders in Articles/ and list them in Config/articles.txt.</p></div>';
        }
    }

    document.addEventListener("DOMContentLoaded", loadArticles);
}());