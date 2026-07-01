(function () {
    const thumbnailColumns = [24, 21, 18, 15, 12, 10, 8, 6, 5, 4];
    const thumbnailTitleSizes = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20];
    const thumbnailIconSizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18];
    const thumbnailInsets = [3, 3, 4, 4, 5, 6, 7, 8, 9, 10];
    const themeModes = ["auto", "dark", "light"];
    const themeLabels = {
        auto: "Auto",
        dark: "Dark",
        light: "Light"
    };
    const themeIcons = {
        auto: "fa-solid fa-circle-half-stroke",
        dark: "fa-solid fa-moon",
        light: "fa-solid fa-sun"
    };
    let themeButton = null;
    let themeIcon = null;

    function resolveTheme(mode) {
        if (mode === "light" || mode === "dark") return mode;

        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? "light" : "dark";
    }

    function getNextThemeMode(mode) {
        const currentIndex = themeModes.indexOf(mode);
        return themeModes[(currentIndex + 1) % themeModes.length] || "auto";
    }

    function updateThemeButton(mode) {
        if (!themeButton || !themeIcon) return;

        const nextMode = getNextThemeMode(mode);
        const label = themeLabels[mode] || themeLabels.auto;
        const nextLabel = themeLabels[nextMode] || themeLabels.auto;

        themeButton.dataset.themeMode = mode;
        themeButton.setAttribute("aria-label", `${label} theme. Switch to ${nextLabel} theme`);
        themeButton.title = `${label} theme`;
        themeIcon.className = themeIcons[mode] || themeIcons.auto;
    }

    function applyTheme(mode) {
        const selectedMode = themeModes.includes(mode) ? mode : "auto";
        const resolvedTheme = resolveTheme(selectedMode);

        document.body.classList.toggle("theme-light", resolvedTheme === "light");
        document.body.classList.toggle("theme-dark", resolvedTheme === "dark");
        document.body.dataset.themeMode = selectedMode;
        localStorage.setItem("portfolioThemeMode", selectedMode);
        updateThemeButton(selectedMode);
    }

    function createThemeButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-button view-control-button";

        const icon = document.createElement("i");
        icon.setAttribute("aria-hidden", "true");
        button.appendChild(icon);

        button.addEventListener("click", () => {
            applyTheme(getNextThemeMode(document.body.dataset.themeMode || "auto"));
        });

        themeButton = button;
        themeIcon = icon;
        return button;
    }

    function initViewControls(options) {
        const config = options || {};
        const thumbnailContainer = config.thumbnailContainer || null;
        const storageKey = config.storageKey || "portfolioThumbnailColumns";
        const showResize = config.showResize !== false && Boolean(thumbnailContainer);

        const existingControls = document.querySelector(".view-controls");
        if (existingControls) existingControls.remove();
        themeButton = null;
        themeIcon = null;

        const controls = document.createElement("div");
        controls.className = "view-controls";

        const themeGroup = document.createElement("div");
        themeGroup.className = "theme-buttons control-group";
        themeGroup.appendChild(createThemeButton());
        controls.appendChild(themeGroup);

        if (showResize) {
            const savedColumns = Number(localStorage.getItem(storageKey));
            let sizeIndex = thumbnailColumns.includes(savedColumns) ? thumbnailColumns.indexOf(savedColumns) : 4;

            const applyThumbnailColumns = () => {
                thumbnailContainer.style.setProperty("--thumbnail-columns", String(thumbnailColumns[sizeIndex]));
                thumbnailContainer.style.setProperty("--thumbnail-title-size", `${thumbnailTitleSizes[sizeIndex]}px`);
                thumbnailContainer.style.setProperty("--thumbnail-icon-size", `${thumbnailIconSizes[sizeIndex]}px`);
                thumbnailContainer.style.setProperty("--thumbnail-inset", `${thumbnailInsets[sizeIndex]}px`);
                thumbnailContainer.dataset.thumbnailStep = String(sizeIndex);
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
