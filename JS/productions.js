function createProductionCard(title, company, time, thumbnail, description) {
    const card = document.createElement("div");
    card.classList.add("production-subpanel");

    const img = document.createElement("img");
    img.src = thumbnail;
    img.alt = title;

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("production-details");

    const titleElem = document.createElement("h2");
    titleElem.textContent = title;

    const companyElem = document.createElement("p");
    companyElem.textContent = company;
    companyElem.style.fontWeight = "bold";

    const timeElem = document.createElement("p");
    timeElem.textContent = time;
    timeElem.style.fontStyle = "italic";

    detailsDiv.appendChild(titleElem);
    detailsDiv.appendChild(companyElem);
    detailsDiv.appendChild(timeElem);

    const descDiv = document.createElement("div");
    descDiv.classList.add("production-description");
    const descElem = document.createElement("p");
    descElem.textContent = description;
    descDiv.appendChild(descElem);

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("production-content");
    contentContainer.appendChild(detailsDiv);
    contentContainer.appendChild(descDiv);

    card.appendChild(img);
    card.appendChild(contentContainer);

    return card;
}

function getProductionSection(title) {
    const normalizedTitle = title.toLowerCase();

    if (normalizedTitle.includes("designer") || normalizedTitle.includes("intern")) return "Experience";
    if (normalizedTitle.includes("master") || normalizedTitle.includes("bachelor")) return "Education";
    if (normalizedTitle.includes("project")) return "Projects";
    if (normalizedTitle.includes("certificate") || normalizedTitle.includes("activities")) return "Certificates & Activities";

    return "Experience";
}

function createProductionSection(title) {
    const section = document.createElement("section");
    section.className = "production-section";

    const heading = document.createElement("h1");
    heading.className = "panel-title production-section-title";
    heading.textContent = title;
    section.appendChild(heading);

    return section;
}

document.addEventListener("DOMContentLoaded", async () => {
    const productionsContainer = document.querySelector(".productions-subpanels");
    if (!productionsContainer) {
        console.error('Productions container not found');
        return;
    }

    try {
        const response = await fetch('../Config/productions.txt?v=1.5');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        const productions = text.split('---').map(prod => prod.trim()).filter(prod => prod);

        if (productions.length === 0) {
            const panel = document.querySelector(".productions-panel");
            if (panel) panel.style.display = "none";
            return;
        }

        productionsContainer.textContent = "";
        const fragment = document.createDocumentFragment();
        const sectionOrder = ["Experience", "Education", "Projects", "Certificates & Activities"];
        const sections = new Map(sectionOrder.map(sectionName => [sectionName, createProductionSection(sectionName)]));

        productions.forEach((prod, index) => {
            const lines = prod.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
            if (lines.length >= 5) {
                const description = lines.slice(4).join('\n');
                const card = createProductionCard(lines[0], lines[1], lines[2], lines[3], description);
                const sectionName = getProductionSection(lines[0]);
                sections.get(sectionName).appendChild(card);
            } else {
                console.error(`Invalid production data format at index ${index}:`, lines);
            }
        });

        sectionOrder.forEach(sectionName => {
            const section = sections.get(sectionName);
            if (section.children.length > 1) fragment.appendChild(section);
        });

        productionsContainer.appendChild(fragment);
    } catch (error) {
        console.error('Failed to load productions:', error);
    }
});
