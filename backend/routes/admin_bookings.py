from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from db import get_db_connection

admin_bookings_bp = Blueprint("admin_bookings", __name__)

# ---------------- GET ALL BOOKINGS ----------------
@admin_bookings_bp.route("/admin/bookings", methods=["GET"])
@jwt_required()
def get_bookings():
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admins only"}), 403

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT b.id, u.email, f.flat_no, f.floor, b.status, f.tower
        FROM bookings b
        JOIN users u ON b.user_email = u.email
        JOIN flats f ON b.flat_id = f.id
        ORDER BY b.id DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([
        {
            "id": r[0],
            "user": r[1],
            "flatNo": r[2],
            "floor": r[3],
            "status": r[4].capitalize(),
            "tower": r[5]
        } for r in rows
    ])

@admin_bookings_bp.route("/admin/bookings/<int:id>/approve", methods=["POST"])
@jwt_required()
def approve(id):
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admins only"}), 403

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get booking details first
        # Get booking details and user_id from email
        cur.execute("""
            SELECT u.id, b.flat_id, f.rent
            FROM bookings b
            JOIN flats f ON b.flat_id = f.id
            JOIN users u ON b.user_email = u.email
            WHERE b.id = %s
        """, (id,))
        
        booking_data = cur.fetchone()
        if not booking_data:
            return jsonify({"error": "Booking or User not found"}), 404
            
        user_id, flat_id, rent = booking_data

        # Approve booking
        cur.execute("""
            UPDATE bookings SET status='Approved'
            WHERE id=%s
        """, (id,))

        # Lock flat
        cur.execute("""
            UPDATE flats SET available=false WHERE id=%s
        """, (flat_id,))

        # Create lease automatically
        cur.execute("""
            INSERT INTO leases (
                booking_id, user_id, flat_id, 
                start_date, end_date, 
                monthly_rent, deposit_amount, payment_status
            ) VALUES (
                %s, %s, %s,
                CURRENT_DATE, 
                CURRENT_DATE + INTERVAL '1 year',
                %s, %s, 'pending'
            )
            ON CONFLICT (booking_id) DO NOTHING
        """, (id, user_id, flat_id, rent, rent * 2))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"msg": "Approved and lease created"})
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": str(e)}), 500


# ---------------- REJECT ----------------
@admin_bookings_bp.route("/admin/bookings/<int:id>/reject", methods=["POST"])
@jwt_required()
def reject(id):
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admins only"}), 403

    conn = get_db_connection()
    cur = conn.cursor()

    # reject booking
    cur.execute("""
        UPDATE bookings SET status='Rejected'
        WHERE id=%s RETURNING flat_id
    """, (id,))
    flat_id = cur.fetchone()[0]

    # unlock flat
    cur.execute("""
        UPDATE flats SET available=true WHERE id=%s
    """, (flat_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"msg": "Rejected"})
