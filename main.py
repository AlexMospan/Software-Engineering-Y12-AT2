from flask import Flask, render_template, request, jsonify, session, redirect, send_from_directory
import sqlite3
import db
import traceback

app = Flask(__name__) 
app.secret_key = "tgr" 

@app.route("/") 
def Home(): 
    return render_template("index.html")

@app.route('/api/reviews/<int:game_id>')
def api_get_reviews(game_id):
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

@app.route('/api/search-games')
def search_games():
    query = request.args.get('q', '').strip()
    
    try:
        database_connection = db.get_db() 
        cursor = database_connection.cursor()

        if not query:
            cursor.execute("SELECT id, title FROM games LIMIT 10")
        else:
            cursor.execute(
                "SELECT id, title FROM games WHERE title LIKE ? LIMIT 10", 
                (f"%{query}%",)
            )

        rows = cursor.fetchall()
        output = [{"id": row["id"], "title": row["title"]} for row in rows]
        return jsonify(output)

    except Exception as e:
        print("DATABASE ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["GET", "POST"]) 
def Login(): 
    user_id = session.get('id')

    if user_id:
        return redirect("/")
    if request.method == "POST": 
        username = request.form['username'] 
        password = request.form['password'] 

        user = db.CheckLogin(username, password) 
        if user: 

            session['id'] = user['id'] 
            session['username'] = user['username'] 
            
            return redirect("/")
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"]) 
def Register(): 
    user_id = session.get('id')

    if user_id:
        return redirect("/")
    if request.method == "POST": 
        username = request.form['username'] 
        password = request.form['password'] 

        if db.RegisterUser(username, password): 
            return redirect("/") 

    return render_template("register.html")

@app.route("/logout") 
def Logout(): 
    session.clear() 
    return redirect("/")

@app.route('/postreview')
def add_review_page():
    return render_template('postreview.html')

@app.route("/add", methods=["POST"])
def add_review():
    user_id = session.get('id')

    if not user_id:
        return redirect("/login")

    game_id = request.form.get('game_id')
    review_text = request.form.get('review_text')
    rating = request.form.get('score')
    date_posted = request.form.get('date')
    hours_played = request.form.get('hours_played')

    try:
        conn = db.get_db()
        conn.execute('''
            INSERT INTO reviews (game_id, user_id, review_text, rating, date, total_hours_played)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (game_id, user_id, review_text, rating, date_posted, hours_played))
        conn.commit()
        conn.close()
    except Exception as e:
        print("DATABASE ERROR:", e)
        return "Error saving review", 500

    return redirect(f"/?game_id={game_id}")

@app.route('/gamelist')
def gamelist():
    conn = db.get_db()
    # Fetch all games sorted alphabetically
    games = conn.execute('SELECT * FROM games ORDER BY title ASC').fetchall()
    conn.close()
    return render_template('gamelist.html', games=games)

@app.route('/manifest.json')
def serve_manifest():
    return send_from_directory('static/js', 'manifest.json')

@app.route('/serviceworker.js')
def serve_sw():
    response = app.make_response(send_from_directory('static/js', 'serviceworker.js'))
    response.headers['Content-Type'] = 'application/javascript'
    return response

app.run(debug=True, port=5000)