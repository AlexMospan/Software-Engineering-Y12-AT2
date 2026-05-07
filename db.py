import sqlite3

def get_reviews_from_db(game_id):
    conn = sqlite3.connect('.database/GameReviews.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = """
        SELECT REVIEWS.*, USERS.username 
        FROM REVIEWS 
        JOIN USERS ON REVIEWS.user_id = USERS.id 
        WHERE REVIEWS.game_id = ?
    """
    
    cursor.execute(query, (game_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]