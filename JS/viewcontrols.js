(function () {
    const thumbnailColumns = [24, 21, 18, 15, 12, 10, 8, 6, 5, 4];
    const themeModes = ["auto", "dark", "light"];
    let themeButtons = [];

    function resolveTheme(mode) {
        if (mode === "light" || mode === "dark") return mode;

        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? "light" : "dark";
    }

    function applyTheme(mode) {
        const selectedMode = themeModes.includes(mode) ? mode : "auto";
        const resolvedTheme = resolveTheme(selectedMode);

        document.body.classList.toggle("theme-light", resolvedTheme === "light");
        document.body.classList.toggle("theme-dark", resolvedTheme === "dark");
        document.body.dataset.themeMode = selectedMode;
        localStorage.setItem("portfolioThemeMode", selectedMode);

        themeButtons.forEach(button => {
            const isActive = button.dataset.themeMode === selectedMode;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function createThemeButton(mode, label) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-button view-control-button";
        button.dataset.themeMode = mode;
        button.textContent = label;
        button.setAttribute("aria-label", `${label} theme`);
        button.addEventListener("click", () => applyTheme(mode));
        themeButtons.push(button);
        return button;
    }

    function initViewControls(options) {
        const config = options || {};
        const thumbnailContainer = config.thumbnailContainer || null;
        const storageKey = config.storageKey || "portfolioThumbnailColumns";
        const showResize = config.showResize !== false && Boolean(thumbnailContainer);

        const existingControls = document.querySelector(".view-controls");
        if (existingControls) existingControls.remove();
        themeButtons = [];

        const controls = document.createElement("div");
        controls.className = "view-controls";

        const themeGroup = document.createElement("div");
        themeGroup.className = "theme-buttons control-group";
        themeGroup.appendChild(createThemeButton("auto", "Auto"));
        themeGroup.appendChild(createThemeButton("dark", "Dark"));
        themeGroup.appendChild(createThemeButton("light", "Light"));
        controls.appendChild(themeGroup);

        if (showResize) {
            const savedColumns = Number(localStorage.getItem(storageKey));
            let sizeIndex = thumbnailColumns.includes(savedColumns) ? thumbnailColumns.indexOf(savedColumns) : 4;

            const applyThumbnailColumns = () => {
                thumbnailContainer.style.setProperty("--thumbnail-columns", String(thumbnailColumns[sizeIndex]));
                localStorage.setItem(storageKey, String(thumbnailColumns[sizeIndex]));
            };

            const resizeGroup = document.createElement("div");
            resizeGroup.className = "resize-buttons control-group";

            const increase = document.createElement("button");
            increase.type = "button";
            increase.className = "resize-button view-control-button";
            increase.textContent = "+";
            increase.setAttribute("aria-label", "Increase thumbnail size");
            increase.addEventListener("click", () => {
                sizeIndex = Math.min(thumbnailColumns.length - 1, sizeIndex + 1);
                applyThumbnailColumns();
            });

            const decrease = document.createElement("button");
            decrease.type = "button";
            decrease.className = "resize-button view-control-button";
            decrease.textContent = "-";
            decrease.setAttribute("aria-label", "Decrease thumbnail size");
            decrease.addEventListener("click", () => {
                sizeIndex = Math.max(0, sizeIndex - 1);
                applyThumbnailColumns();
            });

            resizeGroup.appendChild(increase);
            resizeGroup.appendChild(decrease);
            controls.appendChild(resizeGroup);
            applyThumbnailColumns();
        }

        document.body.appendChild(controls);
        applyTheme(localStorage.getItem("portfolioThemeMode") || "auto");
    }

    window.PortfolioControls = {
        initViewControls,
        applyTheme,
        resolveTheme,
        thumbnailColumns
    };

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && document.body.dataset.themeMode === "auto") {
            applyTheme("auto");
        }
    });
}());
