// Keep track of the active reviews globally
let currentReviews = []; 

async function loadReviews(gameId) {
    const container = document.getElementById('debug-container');
    if (!container) return;

    container.innerHTML = "Loading...";

    try {
        const response = await fetch(`/api/reviews/${gameId}`);
        currentReviews = await response.json(); // Save reviews to our variable

        renderReviews(); // Call a new function to actually draw them
    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = "Error loading reviews.";
    }
}

function renderReviews() {
    const container = document.getElementById('debug-container');
    const sortType = document.getElementById('sort-selector').value;

    // Sort the currentReviews array
    if (sortType === "highest") {
        currentReviews.sort((a, b) => b.rating - a.rating);
    } else if (sortType === "lowest") {
        currentReviews.sort((a, b) => a.rating - b.rating);
    } else {
        // Default: Newest (assuming your DB IDs or dates are sequential)
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
    container.innerHTML = htmlContent || "No reviews found.";
}

async function updateHeader(gameId) {
    try {
        const response = await fetch(`/api/game_info/${gameId}`);
        const data = await response.json();
        
        const titleElem = document.getElementById('game-title');
        const countElem = document.getElementById('review-count');
        const ratingElem = document.getElementById('overall-rating');

        if (titleElem && data.title) titleElem.innerText = data.title;
        if (countElem && data.count !== undefined) {
            countElem.innerText = `${data.count} Reviews`;
            countElem.style.color = "#66c0f4"; // Steam Blue
        }
        
        // Update the Rating text
        if (ratingElem) {
            if (data.average > 0) {
                ratingElem.innerText = `| Average Rating: ${data.average} / 5`;
                ratingElem.style.color = "#66c0f4"; // Steam Blue
            } else {
                ratingElem.innerText = "| No Ratings Yet";
                ratingElem.style.color = "#8091a2"; // Faded Grey
            }
        }

    } catch (error) {
        console.error("Error updating header:", error);
    }
}

async function switchToGame(gameId) {
    console.log("Attempting to switch to Game ID:", gameId);
    
    // 1. Update the Header (Title/Count)
    await updateHeader(gameId);
    
    // 2. Load the actual Review Cards
    await loadReviews(gameId);
}

// --- NEW SEARCH BOX & DROPDOWN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('game-search');
    const dropdown = document.getElementById('search-results-dropdown');
    const sortSelector = document.getElementById('sort-selector');

    // TRACKING STATE: Keep track of currently loaded game's title
    let activeGameTitle = "Elden Ring"; 

    // Initial Load: Bootstrapping with default game (Elden Ring is Game ID 1)
    // If your IDs are different, change 1 to your Elden Ring database ID
    switchToGame(1); 

    // Open/search on input focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value === activeGameTitle) {
            searchInput.value = "";
        }
        fetchSearchResults(searchInput.value);
    });

    // Detect typing
    searchInput.addEventListener('input', () => {
        fetchSearchResults(searchInput.value);
    });

    // Fetch matching data from Python backend API
    async function fetchSearchResults(query) {
    try {
        const response = await fetch(`/api/search-games?q=${encodeURIComponent(query)}`);
        const games = await response.json();
        
        // --- ADD THIS TEMPORARY CHECK ---
        if (games.error) {
            console.error("DATABASE ORM ERROR:", games.error);
            return; // Stop execution so we don't call games.forEach()
        }
        // --------------------------------
        
        renderDropdown(games);
    } catch (error) {
        console.error("Error retrieving game data:", error);
    }
}

    // Populate dropdown HTML dynamically
    function renderDropdown(games) {
        dropdown.innerHTML = ""; // Reset dropdown container

        if (games.length === 0) {
            hideDropdown();
            return;
        }

        games.forEach(game => {
            const item = document.createElement("div");
            item.className = "dropdown-item";
            item.textContent = game.title;

            // Trigger action when user clicks a dropdown item
            item.addEventListener("click", () => {
                searchInput.value = game.title;
                activeGameTitle = game.title; // Update active tracker
                hideDropdown();
                
                // INTEGRATION: Swap to the clicked game using your existing function!
                switchToGame(game.id); 
            });

            dropdown.appendChild(item);
        });

        dropdown.style.display = "block";
    }

    function hideDropdown() {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
    }

    // Close the dropdown list if clicking anywhere else
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".search-container")) {
            // Restore input text to current active game if left blank
            if (searchInput.value.trim() === "") {
                searchInput.value = activeGameTitle;
            }
            hideDropdown();
        }
    });

    // Listen for sort changes (remains unchanged)
    if (sortSelector) {
        sortSelector.addEventListener('change', () => {
            renderReviews(); // Re-draw with the new sort
        });
    }
});