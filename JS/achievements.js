(function () {
    const achievementsSection = document.querySelector(".achievements-section");
    const achievementsList = document.querySelector(".achievements-list");

    if (!achievementsSection || !achievementsList) return;

    function parseAchievements(text) {
        return text
            .replace(/\r\n/g, "\n")
            .split(/\n---\n/)
            .map(block => block.split("\n").map(line => line.trim()).filter(Boolean))
            .filter(lines => lines.length >= 2)
            .map(lines => ({
                title: lines[0],
                description: lines.slice(1).join(" ")
            }));
    }

    function createAchievementItem(achievement) {
        const item = document.createElement("li");
        item.className = "achievement-item";

        const title = document.createElement("h2");
        title.textContent = achievement.title;

        const description = document.createElement("p");
        description.textContent = achievement.description;

        item.appendChild(title);
        item.appendChild(description);
        return item;
    }

    async function loadAchievements() {
        try {
            const response = await fetch("../Config/achievements.txt?v=1.0");
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const achievements = parseAchievements(await response.text());
            if (!achievements.length) {
                achievementsSection.hidden = true;
                return;
            }

            const fragment = document.createDocumentFragment();
            achievements.forEach(achievement => fragment.appendChild(createAchievementItem(achievement)));
            achievementsList.replaceChildren(fragment);
            achievementsSection.hidden = false;
        } catch (error) {
            achievementsSection.hidden = true;
            console.error("Failed to load achievements:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", loadAchievements);
}());
