/* ====================
   SEARCH FUNCTIONALITY
   ==================== */
const searchIcon = document.querySelector('.search-icon');
const searchContainer = document.createElement('div');
searchContainer.classList.add('search-container');
searchContainer.innerHTML = `
    <input type="text" class="search-input" placeholder="Search for a page...">
    <button class="search-close">&times;</button>
    <div class="search-results"></div>
`;
document.body.appendChild(searchContainer);

// Initially hide search bar on page load
searchContainer.style.display = 'none';

const searchInput = searchContainer.querySelector('.search-input');
const searchClose = searchContainer.querySelector('.search-close');
const searchResults = searchContainer.querySelector('.search-results');

let selectedIndex = -1; // Track which result is highlighted

// List of pages for search
const pages = [
    {
        name: 'Home',
        url: 'homepage.html'
    },
    {
        name: 'Consultation Scheduling',
        url: 'scheduling.html'
    },
    {
        name: 'Consultation Portal',
        url: 'consultation.html'
    },
    {
        name: 'Symptoms Checker',
        url: 'symptoms-checker.html'
    },
    {
        name: 'Medical Records',
        url: 'medical-records.html'
    }
];

// Get the current page URL
const currentPage = window.location.pathname.split('/').pop();

function positionSearchContainer() {
    const iconRect = searchIcon.getBoundingClientRect();
    const containerWidth = searchContainer.offsetWidth || 290;
    const margin = 12;
    const centeredLeft = (window.innerWidth - containerWidth) / 2;
    let left = iconRect.right - containerWidth;

    // Keep right-side anchoring for desktop/tablet; center only on small screens.
    if (window.innerWidth < 640) {
        left = centeredLeft;
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - containerWidth - margin));
    const top = iconRect.bottom + 10;

    searchContainer.style.position = 'fixed';
    searchContainer.style.left = `${left}px`;
    searchContainer.style.top = `${top}px`;
    searchContainer.style.right = 'auto';
}

function focusSearchInputWithoutJump() {
    try {
        searchInput.focus({
            preventScroll: true
        });
    } catch (_error) {
        searchInput.focus();
    }
}

// ✅ Toggle search bar visibility when clicking the search icon
searchIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    const isVisible = searchContainer.style.display === 'flex';

    searchContainer.style.display = isVisible ? 'none' : 'flex';
    searchContainer.style.opacity = isVisible ? '0' : '1';
    searchContainer.style.transform = isVisible ? 'translateY(-10px)' : 'translateY(0)';

    if (!isVisible) {
        positionSearchContainer();
        // Avoid iOS/Android auto-scroll side effects when opening search mid-page.
        if (!window.matchMedia('(pointer: coarse)').matches) {
            focusSearchInputWithoutJump();
        }
    }
});

// ✅ Close search bar when clicking the close button
searchClose.addEventListener('click', () => {
    searchContainer.style.display = 'none';
});

// ✅ Search functionality with Arrow Key Navigation & Enter Key Selection
searchInput.addEventListener('input', () => {
    updateSearchResults();
});

// ✅ Handle Arrow Keys and Enter Key for Navigation
searchInput.addEventListener('keydown', (event) => {
    const resultItems = document.querySelectorAll('.search-result-item');

    if (resultItems.length > 0) {
        if (event.key === 'ArrowDown') {
            event.preventDefault(); // Prevent scrolling
            selectedIndex = (selectedIndex + 1) % resultItems.length;
        } else if (event.key === 'ArrowUp') {
            event.preventDefault(); // Prevent scrolling
            selectedIndex = (selectedIndex - 1 + resultItems.length) % resultItems.length;
        } else if (event.key === 'Enter') {
            if (selectedIndex >= 0) {
                window.location.href = resultItems[selectedIndex].dataset.url;
            }
            return;
        }

        // ✅ Highlight selected item
        clearSelection();
        if (selectedIndex >= 0) {
            resultItems[selectedIndex].classList.add('selected');
        }
    }

    // ✅ Allow Backspace and Delete Key to Work
    if (event.key === 'Backspace' || event.key === 'Delete') {
        setTimeout(updateSearchResults, 10); // Wait a bit to update the filtered results
    }
});

// ✅ Function to Update Search Results
function updateSearchResults() {
    const query = searchInput.value.toLowerCase();
    searchResults.innerHTML = '';
    selectedIndex = -1; // Reset selection on input

    if (query) {
        const filteredPages = pages.filter(page =>
            page.name.toLowerCase().includes(query) && page.url !== currentPage
        );

        filteredPages.forEach((page, index) => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('search-result-item');
            resultItem.textContent = page.name;
            resultItem.dataset.url = page.url;

            // ✅ Mouse hover effect
            resultItem.addEventListener('mouseover', () => {
                clearSelection();
                resultItem.classList.add('selected');
                selectedIndex = index;
            });

            // ✅ Click to navigate
            resultItem.addEventListener('click', () => {
                window.location.href = page.url;
            });

            searchResults.appendChild(resultItem);
        });
    }
}

// ✅ Ensure the search bar does NOT persist across page reloads
window.addEventListener('DOMContentLoaded', () => {
    searchContainer.style.display = 'none';
});

window.addEventListener('scroll', () => {
    if (searchContainer.style.display === 'flex') {
        positionSearchContainer();
    }
});

window.addEventListener('resize', () => {
    if (searchContainer.style.display === 'flex') {
        positionSearchContainer();
    }
});

// ✅ Hide search bar automatically when a modal opens
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (searchContainer.style.display === 'flex') {
            searchContainer.style.display = 'none';
        }
    }
}

// ✅ Ensure search bar stays hidden after closing a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ✅ Function to Clear Previous Selections
function clearSelection() {
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.classList.remove('selected');
    });
}
