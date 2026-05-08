from flask import Flask, render_template, request, jsonify
import sqlite3
import db 
 
app = Flask(__name__) 

app.secret_key = "tgr" 
 
@app.route("/") 
def Home(): 
    return render_template("index.html")

@app.route('/api/reviews/<int:game_id>')
def api_get_reviews(game_id):
    # Use the name of the file followed by the function name
    # Example: db.your_function_name()
    data = db.get_reviews_from_db(game_id) 
    
    return jsonify(data)
 
@app.route('/api/game_info/<int:game_id>')
def get_game_info(game_id):
    conn = sqlite3.connect('.database/GameReviews.db')
    cursor = conn.cursor()
    
    # Get Game Title
    cursor.execute("SELECT title FROM GAMES WHERE id = ?", (game_id,))
    game = cursor.fetchone()
    
    # Get Review Count
    cursor.execute("SELECT COUNT(*) FROM REVIEWS WHERE game_id = ?", (game_id,))
    count = cursor.fetchone()[0]
    avg_row = conn.execute('SELECT AVG(rating) FROM REVIEWS WHERE game_id = ?', (game_id,)).fetchone()
    avg_rating = round(avg_row[0], 1) if avg_row[0] is not None else 0
    conn.close()
    
    if game:
        return jsonify({
            "title": game[0],
            "count": count,
            "average": avg_rating
        })
    return jsonify({"error": "Game not found"}), 404
 
app.run(debug=True, port=5000)