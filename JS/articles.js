(function () {
    const articlesContainer = document.getElementById("articles-container");
    const articlesConfigPath = "Config/articles.txt?v=1.1";

    function splitArticleSections(rawText) {
        const lines = rawText.replace(/\r\n/g, "\n").split("\n");
        const delimiters = [];

        lines.forEach((line, index) => {
            if (line.trim() === "---" && delimiters.length < 3) {
                delimiters.push(index);
            }
        });

        if (delimiters.length < 3) {
            const fallback = rawText.split("---").map(part => part.trim());
            return {
                title: fallback[0] || "Untitled Article",
                date: fallback[1] || "",
                summary: fallback[2] || "",
                body: fallback.slice(3).join("\n\n").trim()
            };
        }

        return {
            title: lines.slice(0, delimiters[0]).join("\n").trim() || "Untitled Article",
            date: lines.slice(delimiters[0] + 1, delimiters[1]).join("\n").trim(),
            summary: lines.slice(delimiters[1] + 1, delimiters[2]).join("\n").trim(),
            body: lines.slice(delimiters[2] + 1).join("\n").trim()
        };
    }

    function parseArticle(rawText) {
        return splitArticleSections(rawText);
    }

    function appendInlineText(element, text) {
        const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let cursor = 0;
        let match = pattern.exec(text);

        while (match) {
            if (match.index > cursor) {
                element.appendChild(document.createTextNode(text.slice(cursor, match.index)));
            }

            const token = match[0];
            const child = document.createElement(token.startsWith("**") ? "strong" : "em");
            child.textContent = token.startsWith("**") ? token.slice(2, -2) : token.slice(1, -1);
            element.appendChild(child);
            cursor = match.index + token.length;
            match = pattern.exec(text);
        }

        if (cursor < text.length) {
            element.appendChild(document.createTextNode(text.slice(cursor)));
        }
    }

    function createTextElement(tagName, text) {
        const element = document.createElement(tagName);
        appendInlineText(element, text.replace(/\s*\n\s*/g, " "));
        return element;
    }

    function createArticleBlocks(text) {
        return text
            .split(/\n\s*\n/)
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => {
                if (part === "---") return document.createElement("hr");
                if (part.startsWith("### ")) return createTextElement("h3", part.slice(4));
                if (part.startsWith("## ")) return createTextElement("h2", part.slice(3));
                if (part.startsWith("# ")) return createTextElement("h2", part.slice(2));
                return createTextElement("p", part);
            });
    }

    function slugFromFolder(folder) {
        return encodeURIComponent(folder);
    }

    function getActiveFolder(articles) {
        const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
        return articles.some(article => article.folder === hash) ? hash : "";
    }

    async function fetchOptionalText(path) {
        try {
            const response = await fetch(path);
            return response.ok ? (await response.text()).trim() : "";
        } catch (_error) {
            return "";
        }
    }

    function renderArticleList(articles) {
        const fragment = document.createDocumentFragment();
        const grid = document.createElement("div");
        grid.className = "articles-grid";

        articles.forEach(article => {
            const link = document.createElement("a");
            link.className = "article-card";
            link.href = `#${slugFromFolder(article.folder)}`;

            const label = document.createElement("span");
            label.className = "content-label article-label";
            label.textContent = "Article";
            link.appendChild(label);

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
        document.dispatchEvent(new Event("portfolio:list-rendered"));
    }

    function getArticleAuthor() {
        const author = document.querySelector('meta[name="author"]');
        return author ? author.content.trim() : "";
    }

    function renderArticleDetail(article) {
        const detail = document.createElement("article");
        detail.className = "article-detail";

        const title = document.createElement("h1");
        title.textContent = article.title;
        detail.appendChild(title);

        const meta = document.createElement("div");
        meta.className = "article-meta";

        if (article.date) {
            const date = document.createElement("span");
            date.className = "article-date";
            date.textContent = article.date;
            meta.appendChild(date);
        }

        const authorName = getArticleAuthor();
        if (authorName) {
            const author = document.createElement("span");
            author.className = "article-author";
            author.textContent = authorName;
            meta.appendChild(author);
        }

        if (meta.children.length) detail.appendChild(meta);


        const body = document.createElement("div");
        body.className = "article-body";
        const blocks = createArticleBlocks(article.body || "Add the article body in Articles/First Article/article.txt.");
        blocks.forEach(block => body.appendChild(block));
        detail.appendChild(body);

        if (article.authorNote) {
            const note = document.createElement("aside");
            note.className = "article-author-note";

            const noteTitle = document.createElement("h2");
            noteTitle.textContent = "Author note";
            note.appendChild(noteTitle);
            note.appendChild(createTextElement("p", article.authorNote));
            detail.appendChild(note);
        }

        const back = document.createElement("a");
        back.className = "article-back";
        back.href = "articles.html";
        back.textContent = "<- Back to all posts";
        detail.appendChild(back);

        articlesContainer.replaceChildren(detail);
    }

    function renderArticlesEmptyState() {
        const emptyState = document.createElement("div");
        emptyState.className = "portfolio-empty";

        const heading = document.createElement("h1");
        heading.textContent = "Writing coming soon";

        const body = document.createElement("p");
        body.textContent = "Draft article folders can live in Articles/ and be listed in Config/articles.txt when they are ready to publish.";

        emptyState.appendChild(heading);
        emptyState.appendChild(body);
        articlesContainer.replaceChildren(emptyState);
        document.dispatchEvent(new Event("portfolio:list-rendered"));
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
                const basePath = `Articles/${encodeURIComponent(folder)}`;
                const response = await fetch(`${basePath}/article.txt?v=1.2`);
                if (!response.ok) throw new Error(`Could not load article: ${folder}`);
                const authorNote = await fetchOptionalText(`${basePath}/author-note.txt?v=1.0`);
                return { folder, ...parseArticle(await response.text()), authorNote };
            }));

            renderArticles(articles);
            window.addEventListener("hashchange", () => renderArticles(articles));
        } catch (error) {
            console.error("Error loading articles:", error);
            renderArticlesEmptyState();
        }
    }

    document.addEventListener("DOMContentLoaded", loadArticles);
}());
