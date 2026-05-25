import sqlite3
from flask import g
from werkzeug.security import generate_password_hash, check_password_hash

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
        db.row_factory = sqlite3.Row  # Access columns by name
    return db

def CheckLogin(username, password): 
 
    db = get_db() 
  
    user = db.execute("SELECT * FROM Users WHERE username=? COLLATE NOCASE", (username,)).fetchone() 
 
    if user is not None: 
        if check_password_hash(user['password'], password): 
 
            return user 
         
    return None 

def RegisterUser(username, password): 
 
    if username is None or password is None: 
        return False 
    
    db = get_db() 
    hash = generate_password_hash(password) 
    db.execute("INSERT INTO Users(username, password) VALUES(?, ?)", (username, hash,)) 
    db.commit()  

    return True