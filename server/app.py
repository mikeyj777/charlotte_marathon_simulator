from flask import Flask, jsonify
from flask_cors import CORS

from controllers.data_controller import check_existing_data

import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


app = Flask(__name__)
CORS(app, resources={
    r"/*": {  # This specifically matches your API routes
        "origins": ["http://localhost:3000", "http://emo.riskspace.net"],
        "methods": ["GET", "POST", "OPTIONS"],  # Explicitly allow methods
        "allow_headers": ["Content-Type"]  # Allow common headers
    }
})

@app.route('/api/users', methods=['POST'])
def user_route():
    return get_user()

@app.route('/api/load-emotions', methods=['GET'])
def load_emotions_route():
    return load_emotions() 


@app.route("/")
def home():
    return jsonify({"message": "This is the Emo Pop API."})

if __name__ == '__main__':
    app.run("0.0.0.0", debug=False)
