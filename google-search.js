/* ===============================================
   SYMPTOMS CHECKER PAGE AND GOOGLE SEARCH SCRIPTS
   =============================================== */
document.addEventListener("DOMContentLoaded", function () {
    const searchOverlay = document.getElementById("searchOverlay");
    let resultsVisible = false;

    // Function to check if Google Search Results are visible
    function toggleSearchOverlay() {
        const searchResults = document.querySelector(".gsc-results-wrapper-visible");

        if (searchResults && searchResults.offsetHeight > 0) {
            searchOverlay.style.display = "block"; // Show overlay
            resultsVisible = true;
        } else {
            hideSearchOverlay(); // Hide overlay when search results disappear
        }
    }

    // Function to hide the overlay properly
    function hideSearchOverlay() {
        searchOverlay.style.display = "none";
        resultsVisible = false;
    }

    // Monitor DOM changes to detect when Google Search results appear
    const observer = new MutationObserver(toggleSearchOverlay);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Close overlay when clicking outside the search results
    searchOverlay.addEventListener("click", function () {
        if (resultsVisible) {
            hideSearchOverlay();
            const closeButton = document.querySelector(".gsc-results-close-btn");
            if (closeButton) closeButton.click(); // Close Google Search Results
        }
    });

    // Hide overlay when search results disappear
    document.addEventListener("click", function (event) {
        if (!document.querySelector(".gsc-results-wrapper-visible")) {
            hideSearchOverlay();
        }
    });

    // Ensure overlay disappears on page load
    window.addEventListener("load", hideSearchOverlay);
});

document.addEventListener("DOMContentLoaded", function () {
    const searchOverlay = document.getElementById("searchOverlay");
    let resultsVisible = false;

    // Function to check if Google Search Results are visible
    function toggleSearchOverlay() {
        const searchResults = document.querySelector(".gsc-results-wrapper-visible");

        if (searchResults && searchResults.offsetHeight > 0) {
            searchOverlay.classList.add("active"); // Show overlay
            searchOverlay.classList.remove("hidden");
            resultsVisible = true;
        } else {
            hideSearchOverlay(); // Hide overlay when search results disappear
        }
    }

    // Function to hide the overlay properly
    function hideSearchOverlay() {
        searchOverlay.classList.remove("active");
        searchOverlay.classList.add("hidden");
        resultsVisible = false;
    }

    // Monitor DOM changes to detect when Google Search results appear
    const observer = new MutationObserver(toggleSearchOverlay);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Close overlay when clicking outside the search results
    searchOverlay.addEventListener("click", function () {
        if (resultsVisible) {
            hideSearchOverlay();
            const closeButton = document.querySelector(".gsc-results-close-btn");
            if (closeButton) closeButton.click(); // Close Google Search Results
        }
    });

    // Hide overlay when search results disappear
    document.addEventListener("click", function (event) {
        if (!document.querySelector(".gsc-results-wrapper-visible")) {
            hideSearchOverlay();
        }
    });

    // Ensure "X" Button (gsc-clear-button) Also Hides the Overlay
    document.addEventListener("click", function (event) {
        const clearButton = document.querySelector(".gsc-clear-button");
        if (clearButton && event.target === clearButton) {
            hideSearchOverlay();
        }
    });

    // Ensure overlay reappears after refresh if search results exist
    restoreOverlayOnLoad();
});

// Function to apply the custom search overlay
function applySearchOverlay() {
    const searchOverlay = document.querySelector('.search-overlay');
    const searchResults = document.querySelector('.gsc-results-wrapper-visible');

    if (searchResults && searchResults.offsetHeight > 0) {
        searchOverlay.classList.add("active");
        searchOverlay.classList.remove("hidden");
    } else {
        searchOverlay.classList.remove("active");
        searchOverlay.classList.add("hidden");
    }
}

// Function to close search results when clicking outside
function closeSearchResults() {
    const searchOverlay = document.querySelector('.search-overlay');
    const searchBox = document.querySelector('.gsc-input-box input');
    const closeButton = document.querySelector('.gsc-clear-button'); // Google Search Clear "X" Button

    if (searchOverlay) {
        searchOverlay.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevents duplicate clicks
            document.querySelector('.gsc-clear-button')?.click();
            searchOverlay.classList.remove("active");
            searchOverlay.classList.add("hidden");
            searchBox.blur();
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            hideSearchOverlay(); // Hides overlay when clicking "X"**
        });
    }
}

// Observe the search results container for changes
function observeSearchResults() {
    const resultsContainer = document.querySelector('.gsc-results-wrapper-overlay');

    if (resultsContainer) {
        const observer = new MutationObserver(() => {
            applySearchOverlay();
        });

        observer.observe(resultsContainer, { childList: true, subtree: true });
    }
}

// Ensure overlay reappears after refresh if search results exist
function restoreOverlayOnLoad() {
    const searchResults = document.querySelector('.gsc-results-wrapper-visible');
    if (searchResults && searchResults.offsetHeight > 0) {
        applySearchOverlay(); // Reapply overlay if results are visible
    }
}

// Prevent duplicate overlays when refreshing
window.addEventListener('load', function() {
    document.querySelectorAll('.gsc-modal-background-image').forEach(el => el.remove());
    restoreOverlayOnLoad(); // Reapply overlay instantly
});