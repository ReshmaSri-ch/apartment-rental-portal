from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.bookings import bookings_bp
from routes.flats import flats_bp
from routes.admin_bookings import admin_bookings_bp
from routes.towers import towers_bp
from routes.amenities import amenities_bp
from routes.dashboard import dashboard_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")

CORS(app)
JWTManager(app)

# Health check endpoint
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(bookings_bp, url_prefix="/api")
app.register_blueprint(flats_bp, url_prefix="/api")
app.register_blueprint(admin_bookings_bp, url_prefix="/api")
app.register_blueprint(towers_bp, url_prefix="/api")
app.register_blueprint(amenities_bp, url_prefix="/api")
app.register_blueprint(dashboard_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "True") == "True"
    )

