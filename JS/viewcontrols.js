(function () {
    const thumbnailColumns = [24, 21, 18, 15, 12, 10, 8, 6, 5, 4];
    const thumbnailTitleSizes = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20];
    const thumbnailIconSizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18];
    const thumbnailInsets = [3, 3, 4, 4, 5, 6, 7, 8, 9, 10];
    const themeModes = ["auto", "dark", "light"];
    const einkRefreshDuration = 1500;
    const einkNavigationDelay = 1120;
    const einkElementSelector = [
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "blockquote", "figcaption", "dt", "dd", "strong", "small", "time",
        ".software-tag", ".nav-button", ".social-icons a", ".article-date", ".article-author", ".content-label", ".stat", ".recommendation", ".production-media",
        ".thumbnail", ".photo-card", ".photo-collection-cover", ".code-project-action", ".photo-action",
        "img", "video", "iframe", "canvas", "svg", "button"
    ].join(",");
    const einkInteractiveSelector = "a[href], button, input, select, textarea, summary, [role=button], [tabindex]:not([tabindex='-1'])";
    const einkMaxTargets = 180;
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
    let einkButton = null;
    let einkIcon = null;
    let einkRefreshTimer = null;

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


    function isEinkRefreshEnabled() {
        return localStorage.getItem("portfolioEinkRefresh") !== "off";
    }

    function updateEinkButton() {
        if (!einkButton || !einkIcon) return;

        const enabled = isEinkRefreshEnabled();
        einkButton.classList.toggle("active", enabled);
        einkButton.setAttribute("aria-pressed", String(enabled));
        einkButton.setAttribute("aria-label", enabled ? "E-ink refresh on. Turn off" : "E-ink refresh off. Turn on");
        einkButton.title = enabled ? "E-ink refresh on" : "E-ink refresh off";
        einkIcon.className = enabled ? "fa-solid fa-book-open-reader" : "fa-regular fa-bookmark";
    }

    function clearEinkElementFlashes() {
        document.querySelectorAll(".eink-flash-target").forEach(element => {
            element.classList.remove("eink-flash-target");
            element.style.removeProperty("--eink-element-delay");
            element.style.removeProperty("--eink-element-duration");
        });
    }

    function prepareEinkElementFlashes() {
        clearEinkElementFlashes();

        const viewportWidth = Math.max(window.innerWidth, 1);
        const viewportHeight = Math.max(window.innerHeight, 1);
        const candidates = Array.from(document.querySelectorAll(einkElementSelector)).filter(element => {
            if (element.closest("[hidden], [aria-hidden='true']")) return false;

            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return rect.width > 0
                && rect.height > 0
                && rect.right >= 0
                && rect.left <= viewportWidth
                && rect.bottom >= 0
                && rect.top <= viewportHeight
                && style.display !== "none"
                && style.visibility !== "hidden"
                && style.opacity !== "0";
        });

        const candidateSet = new Set(candidates);
        const targets = candidates.filter(element => {
            let ancestor = element.parentElement;
            while (ancestor && ancestor !== document.body) {
                if (candidateSet.has(ancestor)) return false;
                ancestor = ancestor.parentElement;
            }
            return true;
        }).sort((first, second) => {
            const firstRect = first.getBoundingClientRect();
            const secondRect = second.getBoundingClientRect();
            return firstRect.top - secondRect.top || firstRect.left - secondRect.left;
        }).slice(0, einkMaxTargets);

        targets.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const centerY = rect.top + (rect.height / 2);
            const verticalProgress = Math.min(1, Math.max(0, centerY / viewportHeight));
            const delay = Math.round((verticalProgress * 480) + (Math.random() * 210) + ((index % 3) * 16));
            const duration = Math.round(560 + (Math.random() * 160));

            element.style.setProperty("--eink-element-delay", `${delay}ms`);
            element.style.setProperty("--eink-element-duration", `${duration}ms`);
            element.classList.add("eink-flash-target");
        });

        return targets.length;
    }

    function triggerEinkRefresh() {
        if (!isEinkRefreshEnabled() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        document.body.classList.remove("eink-refreshing");
        window.clearTimeout(einkRefreshTimer);
        clearEinkElementFlashes();

        window.requestAnimationFrame(() => {
            if (!prepareEinkElementFlashes()) return;

            document.body.classList.add("eink-refreshing");
            einkRefreshTimer = window.setTimeout(() => {
                document.body.classList.remove("eink-refreshing");
                clearEinkElementFlashes();
            }, einkRefreshDuration);
        });
    }

    function createEinkButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "eink-button view-control-button";
        button.setAttribute("aria-pressed", String(isEinkRefreshEnabled()));

        const icon = document.createElement("i");
        icon.setAttribute("aria-hidden", "true");
        button.appendChild(icon);

        button.addEventListener("click", () => {
            const enabled = !isEinkRefreshEnabled();
            localStorage.setItem("portfolioEinkRefresh", enabled ? "on" : "off");
            updateEinkButton();
            if (enabled) triggerEinkRefresh();
        });

        einkButton = button;
        einkIcon = icon;
        updateEinkButton();
        return button;
    }

    function shouldRefreshBeforeNavigation(link) {
        if (!link || link.target === "_blank" || link.hasAttribute("download")) return false;
        if (link.origin !== window.location.origin) return false;
        if (link.pathname === window.location.pathname && link.hash) return false;
        return true;
    }

    function bindEinkNavigationRefresh() {
        if (document.body.dataset.einkNavigationBound === "true") return;
        document.body.dataset.einkNavigationBound = "true";

        document.addEventListener("click", event => {
            const link = event.target.closest("a[href]");
            if (!shouldRefreshBeforeNavigation(link) || !isEinkRefreshEnabled()) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;

            event.preventDefault();
            triggerEinkRefresh();
            window.setTimeout(() => {
                window.location.href = link.href;
            }, einkNavigationDelay);
        }, true);
    }


    function bindEinkInteractionRefresh() {
        if (document.body.dataset.einkInteractionBound === "true") return;
        document.body.dataset.einkInteractionBound = "true";

        document.addEventListener("click", event => {
            if (!(event.target instanceof Element) || !isEinkRefreshEnabled()) return;

            const interactive = event.target.closest(einkInteractiveSelector);
            if (!interactive || interactive.closest(".eink-button")) return;
            if (interactive.matches("a[href]") && shouldRefreshBeforeNavigation(interactive)) return;

            window.setTimeout(triggerEinkRefresh, 0);
        });
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
        einkButton = null;
        einkIcon = null;

        const controls = document.createElement("div");
        controls.className = "view-controls";

        const themeGroup = document.createElement("div");
        themeGroup.className = "theme-buttons control-group";
        themeGroup.appendChild(createThemeButton());
        themeGroup.appendChild(createEinkButton());
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
        updateEinkButton();
        bindEinkNavigationRefresh();
        bindEinkInteractionRefresh();
        window.setTimeout(triggerEinkRefresh, 180);
    }

    window.PortfolioControls = {
        initViewControls,
        applyTheme,
        resolveTheme,
        triggerEinkRefresh,
        thumbnailColumns
    };

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && document.body.dataset.themeMode === "auto") {
            applyTheme("auto");
        }
    });
}());
