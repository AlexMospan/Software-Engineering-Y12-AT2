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

def get_game_details(game_id):
    conn = sqlite3.connect('.database/GameReviews.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Assuming your GAMES table has a column named 'title' or 'name'
    cursor.execute("SELECT * FROM GAMES WHERE id = ?", (game_id,))
    game = cursor.fetchone()
    
    conn.close()
    return dict(game) if game else None