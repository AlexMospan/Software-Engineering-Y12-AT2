async function loadReviews(gameId) {
    const container = document.getElementById('debug-container');
    if (!container) return;

    container.innerHTML = '<div style="color: #66c0f4; padding: 20px;">Loading reviews...</div>';

    try {
        const response = await fetch(`/api/reviews/${gameId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = "Connected to DB, but 0 reviews were found for this game.";
            return;
        }

        let htmlContent = "";
        data.forEach(rev => {
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
                            <div class="rating-details">
                                <div class="status">${rev.rating} / 5 SCORE</div>
                                <div class="playtime-at-review">${rev.hours_at_review} hrs at review</div>
                            </div>
                        </div>
                        
                        <div class="posted-date">Posted: ${rev.date}</div>
                        <div class="review-text">${rev.review_text}</div>
                        
                        </div>
                </div>`;
        });
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error("Fetch Error:", error);
        container.innerHTML = "Error loading reviews.";
    }
}

async function updateHeader(gameId) {
    try {
        const response = await fetch(`/api/game_info/${gameId}`);
        const data = await response.json();
        
        const titleElem = document.getElementById('game-title');
        const countElem = document.getElementById('review-count');
        const ratingElem = document.getElementById('overall-rating'); // Make sure this ID exists in HTML

        if (titleElem && data.title) titleElem.innerText = data.title;
        if (countElem && data.count !== undefined) countElem.innerText = `${data.count} Reviews`
            countElem.style.color = "#66c0f4"; // Steam Blue;
        
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

window.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('game-selector');
    
    if (selector) {
        // 1. Initial Load: Load whatever is currently selected
        switchToGame(selector.value);

        // 2. The Fix: Add the event listener here instead of in the HTML
        selector.addEventListener('change', (event) => {
            // event.target.value is the ID (1, 2, 3, etc.)
            switchToGame(event.target.value);
        });
    } else {
        // Fallback if selector isn't found
        switchToGame(1);
    }
});