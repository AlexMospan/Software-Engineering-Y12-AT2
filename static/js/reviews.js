async function loadReviews(gameId) {
    console.log("1. Function triggered for Game ID:", gameId);
    
    const container = document.getElementById('debug-container');
    if (!container) {
        console.error("ERROR: Could not find 'debug-container' in the HTML!");
        return;
    }

    try {
        const response = await fetch(`/api/reviews/${gameId}`);
        console.log("2. Response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("3. Data received from Python:");
        console.table(data); 

        if (data.length === 0) {
            container.innerHTML = "Connected to DB, but 0 reviews were found for this ID.";
            return;
        }

        let htmlContent = "";
        data.forEach(rev => {
            htmlContent += `
                <div class="steam-review-card">
                    <div class="author-column">
                        <div class="author-name">${rev.username}</div>
                        <div class="hours-played">${rev.total_hours_played} hrs on record</div>
                    </div>
                    
                    <div class="content-column">
                        <div class="rating-header">
                            <div class="thumb">${rev.is_recommended == 1 ? '👍' : '👎'}</div>
                            <div class="rating-details">
                                <div class="status">${rev.is_recommended == 1 ? 'Recommended' : 'Not Recommended'}</div>
                                <div class="playtime-at-review">${rev.hours_at_review} hrs at time of review</div>
                            </div>
                        </div>
                        
                        <div class="posted-date">Posted: ${rev.date}</div>
                        <div class="review-text">${rev.review_text}</div>
                        
                        <div class="review-footer">
                            ${rev.helpful_count} people found this review helpful. 
                            ${rev.funny_count > 0 ? rev.funny_count + ' people found this funny' : ''}
                        </div>
                    </div>
                </div>`;
        });
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error("4. Fetch Error:", error);
        container.innerHTML = "Fetch failed. Check Python terminal for errors.";
    }
}

console.log("JS file loaded. Calling loadReviews now...");
loadReviews(1);