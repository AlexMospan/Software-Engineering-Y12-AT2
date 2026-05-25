// Keep track of the active reviews globally
let currentReviews = []; 

async function loadReviews(gameId) {
    if (!document.getElementById('debug-container')) return;
    
    const container = document.getElementById('debug-container');
    container.innerHTML = `<div style="color: white; padding: 5px;">Loading...</div>`;

    try {
        const response = await fetch(`/api/reviews/${gameId}`);
        currentReviews = await response.json(); 
        renderReviews(); 
    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = "Error loading reviews.";
    }
}

function renderReviews() {
    const container = document.getElementById('debug-container');
    const sortSelector = document.getElementById('sort-selector');
    
    if (!container || !sortSelector) return;

    const sortType = sortSelector.value;

    if (sortType === "highest") {
        currentReviews.sort((a, b) => b.rating - a.rating);
    } else if (sortType === "lowest") {
        currentReviews.sort((a, b) => a.rating - b.rating);
    } else {
        currentReviews.sort((a, b) => b.id - a.id);
    }

    let htmlContent = "";
    currentReviews.forEach(rev => {
        const goldStars = '★'.repeat(rev.rating);
        const emptyStars = '☆'.repeat(5 - rev.rating);
        
        htmlContent += `
            <div class="steam-review-card">
                <div class="author-column">
                    <div class="author-name">${rev.username}</div>
                    <div class="hours-played">${rev.total_hours_played} hrs on record</div>
                </div>
                <div class="content-column">
                    <div class="rating-header">
                        <div class="star-container">
                            <span class="gold-stars">${goldStars}</span><span class="empty-stars">${emptyStars}</span>
                        </div>
                        <div class="status">${rev.rating} / 5 SCORE</div>
                    </div>
                    <div class="posted-date">Posted: ${rev.date}</div>
                    <div class="review-text">${rev.review_text}</div>
                </div>
            </div>`;
    });
    container.innerHTML = htmlContent || `<div style="color: white; padding: 5px;">No reviews yet</div>`;
}

async function updateHeader(gameId) {
    if (!document.getElementById('game-title')) return;

    try {
        const response = await fetch(`/api/game_info/${gameId}`);
        const data = await response.json();
        
        const titleElem = document.getElementById('game-title');
        const countElem = document.getElementById('review-count');
        const ratingElem = document.getElementById('overall-rating');

        if (titleElem && data.title) titleElem.innerText = data.title;
        
        if (document.getElementById('game-search') && data.title) {
            document.getElementById('game-search').value = data.title;
        }
        // --------------------------

        if (countElem && data.count !== undefined) {
            countElem.innerText = `${data.count} Reviews`;
            countElem.style.color = "#66c0f4";
        }
        
        if (ratingElem) {
            if (data.average > 0) {
                ratingElem.innerText = `| Average Rating: ${data.average} / 5`;
                ratingElem.style.color = "#66c0f4";
            } else {
                ratingElem.innerText = "| No Ratings Yet";
                ratingElem.style.color = "#8091a2";
            }
        }
    } catch (error) {
        console.error("Error updating header:", error);
    }
}

async function switchToGame(gameId) {
    await updateHeader(gameId);
    await loadReviews(gameId);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('game-search');
    const dropdown = document.getElementById('search-results-dropdown');
    const sortSelector = document.getElementById('sort-selector');
    const hiddenIdField = document.getElementById('selected-game-id');

    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('game_id');

    // TRACKING STATE
    let activeGameTitle = "Select a Game"; 

    if (!hiddenIdField) {
        if (gameIdFromUrl) {
            // If the URL has an ID, load that game
            switchToGame(gameIdFromUrl);
        } else {
            // No ID in URL, load the default Elden Ring
            activeGameTitle = "Elden Ring"; 
            switchToGame(1); 
        }
    } else {
        if (searchInput) searchInput.value = "";
    }

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (searchInput.value === activeGameTitle) {
                searchInput.value = "";
            }
            fetchSearchResults(searchInput.value);
        });

        searchInput.addEventListener('input', () => {
            fetchSearchResults(searchInput.value);
        });
    }

    async function fetchSearchResults(query) {
        try {
            const response = await fetch(`/api/search-games?q=${encodeURIComponent(query)}`);
            const games = await response.json();
            renderDropdown(games);
        } catch (error) {
            console.error("Error retrieving game data:", error);
        }
    }

    function renderDropdown(games) {
        dropdown.innerHTML = ""; 
        if (games.length === 0) {
            hideDropdown();
            return;
        }

        games.forEach(game => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = game.title;

            item.addEventListener("click", () => {
                searchInput.value = game.title;
                hideDropdown();
                
                // If this field exists, we are on the POST REVIEW page
                if (hiddenIdField) {
                    hiddenIdField.value = game.id;
                    searchInput.style.border = "1px solid #66c0f4"; 
                } else {
                    activeGameTitle = game.title; 
                    switchToGame(game.id); 
                }
            });
            dropdown.appendChild(item);
        });
        // Using !important to override the CSS display
        dropdown.style.setProperty('display', 'block', 'important');
    }

    function hideDropdown() {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
    }

    document.addEventListener("click", (event) => {
        if (searchInput && !event.target.closest(".search-container")) {
            if (searchInput.value.trim() === "" && !hiddenIdField) {
                searchInput.value = activeGameTitle;
            }
            hideDropdown();
        }
    });

    if (sortSelector) {
        sortSelector.addEventListener('change', () => {
            renderReviews(); 
        });
    }
});