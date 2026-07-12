function addSkillsAndSoftware() {
    const softwareContainer = document.querySelector('[data-skill-list="software"]');
    const skillsContainer = document.querySelector('[data-skill-list="skills"]');

    if (!softwareContainer || !skillsContainer) return;

    const fetchAndPopulate = async (url, container) => {
        try {
            const response = await fetch(url);
            const text = await response.text();
            const itemsArray = text.split('\n').map(item => item.trim()).filter(item => item);

            // Create a document fragment to batch DOM manipulations
            const fragment = document.createDocumentFragment();

            // Populate the tags
            itemsArray.forEach(item => {
                const span = document.createElement("span");
                span.className = "software-tag";
                span.textContent = item;
                fragment.appendChild(span);
            });

            // Append the fragment to the container
            container.appendChild(fragment);
        } catch (error) {
            console.error(`Failed to load ${url}:`, error);
        }
    };

    // Fetch and populate software and skills data
    fetchAndPopulate('../Config/software.txt?v=1.4', softwareContainer);
    fetchAndPopulate('../Config/skills.txt?v=1.5', skillsContainer);
}

document.addEventListener("DOMContentLoaded", addSkillsAndSoftware);
