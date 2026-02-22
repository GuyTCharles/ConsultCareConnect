/* ===============================================
   SYMPTOMS CHECKER PAGE AND GOOGLE SEARCH SCRIPTS
   =============================================== */
document.addEventListener("DOMContentLoaded", () => {
    const searchOverlay = document.getElementById("searchOverlay");
    const cseModalRoot = document.getElementById("cseModalRoot");
    if (!searchOverlay) return;

    let rafId = null;
    const LAYERS = {
        backdrop: "1000",
        resultsOverlay: "1001",
        resultsPanel: "1002"
    };

    function getResultsPanel() {
        const panel = document.querySelector(".gsc-results-wrapper-visible");
        if (!panel) return null;
        // For fixed-position Google modal, offsetParent can be null even when visible.
        const style = window.getComputedStyle(panel);
        const rect = panel.getBoundingClientRect();
        const isVisible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            parseFloat(style.opacity || "1") > 0 &&
            rect.width > 0 &&
            rect.height > 0;
        if (!isVisible) return null;
        return panel;
    }

    function showOverlay() {
        // Backdrop layer: below Google modal panel.
        searchOverlay.style.zIndex = LAYERS.backdrop;
        searchOverlay.style.display = "block";
        searchOverlay.classList.add("active");
        searchOverlay.classList.remove("hidden");
        if (cseModalRoot) {
            cseModalRoot.style.visibility = "visible";
            cseModalRoot.style.pointerEvents = "auto";
        }
    }

    function hideOverlay() {
        searchOverlay.style.display = "none";
        searchOverlay.classList.remove("active");
        searchOverlay.classList.add("hidden");
        if (cseModalRoot) {
            cseModalRoot.style.visibility = "hidden";
            cseModalRoot.style.pointerEvents = "none";
        }
    }

    function closeGoogleResults() {
        const closeBtn = document.querySelector(".gsc-results-close-btn");
        const clearBtn = document.querySelector(".gsc-clear-button");
        if (closeBtn) closeBtn.click();
        if (clearBtn) clearBtn.click();
    }

    function enforceModalOnTop(panel) {
        const overlayContainer =
            document.querySelector(".gsc-results-wrapper-overlay") ||
            panel.closest(".gsc-results-wrapper-overlay");
        const googleBackdrop = document.querySelector(".gsc-modal-background-image");

        if (overlayContainer) {
            overlayContainer.style.position = "fixed";
            overlayContainer.style.zIndex = LAYERS.resultsOverlay;
        }

        panel.style.position = "fixed";
        panel.style.zIndex = LAYERS.resultsPanel;

        // Neutralize Google's own dim layer so custom backdrop is the only one.
        if (googleBackdrop) {
            googleBackdrop.style.display = "none";
            googleBackdrop.style.pointerEvents = "none";
        }
    }

    function syncOverlayState() {
        rafId = null;
        const panel = getResultsPanel();
        if (panel) {
            enforceModalOnTop(panel);
            showOverlay();
        } else {
            hideOverlay();
        }
    }

    function scheduleSync() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(syncOverlayState);
    }

    // Clicking the page backdrop should close Google results modal.
    searchOverlay.addEventListener("click", () => {
        closeGoogleResults();
        hideOverlay();
    });

    // Google CSE mutates DOM aggressively; observe once and coalesce updates.
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"]
    });

    // Keep state aligned across clicks and initial page load.
    document.addEventListener("click", scheduleSync, true);
    window.addEventListener("load", scheduleSync);
    scheduleSync();
});
