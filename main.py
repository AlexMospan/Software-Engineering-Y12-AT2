from flask import Flask, render_template, request, jsonify
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
 
app.run(debug=True, port=5000)