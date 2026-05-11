import sqlite3
from flask import g

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

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('.database/GameReviews.db')
        db.row_factory = sqlite3.Row  # This lets us access columns by name (like row['title'])
    return db