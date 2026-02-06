from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from db import get_db_connection

bookings_bp = Blueprint("bookings", __name__)

# ---------------- CREATE BOOKING (USER) ----------------
@bookings_bp.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    email = get_jwt_identity()          # STRING (email)
    role = get_jwt().get("role")

    if role != "user":
        return jsonify({"error": "Users only"}), 403

    flat_id = request.json.get("flatId")
    if not flat_id:
        return jsonify({"error": "flatId required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Prevent duplicate requests for same flat
    cur.execute("""
        SELECT id FROM bookings
        WHERE flat_id=%s AND status='Requested'
    """, (flat_id,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"msg": "Already requested"}), 409

    # Insert booking
    cur.execute("""
        INSERT INTO bookings (user_email, flat_id, status)
        VALUES (%s, %s, 'Requested')
        RETURNING id
    """, (email, flat_id))

    booking_id = cur.fetchone()[0]
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "id": booking_id,
        "status": "Requested"
    }), 201


# ---------------- USER BOOKING STATUS ----------------
@bookings_bp.route("/bookings", methods=["GET"])
@jwt_required()
def get_user_bookings():
    email = get_jwt_identity()

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT b.id, f.flat_no, f.floor, b.status
        FROM bookings b
        JOIN flats f ON b.flat_id = f.id
        WHERE b.user_email = %s
        ORDER BY b.id DESC
    """, (email,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "flat": r[1],
            "floor": r[2],
            "status": r[3]
        }
        for r in rows
    ]), 200
