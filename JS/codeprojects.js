(function () {
    const container = document.getElementById("code-projects-container");
    const configPath = "Config/codeprojects.txt?v=1.3";

    function parseProjects(rawText) {
        return rawText
            .replace(/\r\n/g, "\n")
            .split(/\n---\n/)
            .map(part => part.trim())
            .reduce((projects, _part, index, parts) => {
                if (index % 6 !== 0) return projects;
                projects.push({
                    title: parts[index] || "Untitled Project",
                    kind: parts[index + 1] || "Project",
                    summary: parts[index + 2] || "",
                    liveUrl: parts[index + 3] || "",
                    sourceUrl: parts[index + 4] || "",
                    tags: parts[index + 5] || ""
                });
                return projects;
            }, []);
    }

    function appendAction(parent, href, label, iconClass) {
        if (!href) return;

        const link = document.createElement("a");
        link.className = "code-project-action";
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const icon = document.createElement("i");
        icon.className = iconClass;
        icon.setAttribute("aria-hidden", "true");
        link.appendChild(icon);

        const text = document.createElement("span");
        text.textContent = label;
        link.appendChild(text);

        parent.appendChild(link);
    }

    function createProjectCard(project) {
        const card = document.createElement("article");
        card.className = "code-project-card";

        const kind = document.createElement("span");
        kind.className = "code-project-kind content-label";
        kind.textContent = project.kind;
        card.appendChild(kind);

        const title = document.createElement("h2");
        title.textContent = project.title;
        card.appendChild(title);

        if (project.summary) {
            const summary = document.createElement("p");
            summary.textContent = project.summary;
            card.appendChild(summary);
        }

        if (project.tags) {
            const tags = document.createElement("span");
            tags.className = "code-project-tags";
            tags.textContent = project.tags;
            card.appendChild(tags);
        }

        const actions = document.createElement("div");
        actions.className = "code-project-actions";
        appendAction(actions, project.liveUrl, "Open", "fa-solid fa-arrow-up-right-from-square");
        if (project.sourceUrl !== project.liveUrl) appendAction(actions, project.sourceUrl, "GitHub", "fa-brands fa-github");
        card.appendChild(actions);

        return card;
    }

    function renderProjects(projects) {
        const fragment = document.createDocumentFragment();
        const grid = document.createElement("div");
        grid.className = "code-projects-grid";
        projects.forEach(project => grid.appendChild(createProjectCard(project)));
        fragment.appendChild(grid);

        container.replaceChildren(fragment);
    }

    function renderProjectsEmptyState() {
        const emptyState = document.createElement("div");
        emptyState.className = "portfolio-empty";

        const heading = document.createElement("h1");
        heading.textContent = "Projects coming soon";

        const body = document.createElement("p");
        body.textContent = "Add public links in Config/codeprojects.txt to show tools, experiments, repositories, and live demos here.";

        emptyState.appendChild(heading);
        emptyState.appendChild(body);
        container.replaceChildren(emptyState);
    }

    async function loadProjects() {
        if (!container) return;

        try {
            const response = await fetch(configPath);
            if (!response.ok) throw new Error("Could not load Config/codeprojects.txt");
            const projects = parseProjects(await response.text());
            if (!projects.length) throw new Error("No code projects configured");
            renderProjects(projects);
        } catch (error) {
            console.error("Error loading code projects:", error);
            renderProjectsEmptyState();
        }
    }

    document.addEventListener("DOMContentLoaded", loadProjects);
}());
