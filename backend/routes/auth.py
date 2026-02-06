from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection

auth_bp = Blueprint("auth", __name__)

# ---------------- REGISTER ----------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        return jsonify({"msg": "User already exists"}), 409

    hashed = generate_password_hash(password)

    cur.execute(
        "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
        (email, hashed, "user")
    )
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"msg": "Registered successfully"}), 201


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT password, role FROM users WHERE email=%s",
        (email,)
    )
    user = cur.fetchone()

    if not user or not check_password_hash(user[0], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # ✅ identity MUST be string
    token = create_access_token(
        identity=email,
        additional_claims={"role": user[1]}
    )

    return jsonify({
        "access_token": token,
        "role": user[1]
    }), 200

