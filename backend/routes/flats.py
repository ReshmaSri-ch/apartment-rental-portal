from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import get_db_connection

flats_bp = Blueprint("flats", __name__)

# GET all flats (for admin)
@flats_bp.route("/flats", methods=["GET"])
@jwt_required()
def get_all_flats():
    conn = get_db_connection()
    cur = conn.cursor()

    # Get all flats with amenities
    cur.execute("""
        SELECT 
            f.id, f.flat_no, f.floor, f.tower, f.rent, f.available,
            json_agg(
                json_build_object('id', a.id, 'name', a.name, 'icon', a.icon)
            ) FILTER (WHERE a.id IS NOT NULL) as amenities
        FROM flats f
        LEFT JOIN flat_amenities fa ON f.id = fa.flat_id
        LEFT JOIN amenities a ON fa.amenity_id = a.id AND a.is_active = true
        GROUP BY f.id, f.flat_no, f.floor, f.tower, f.rent, f.available
        ORDER BY f.tower, f.floor, f.flat_no
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for r in rows:
        flat_data = {
            "id": r[0],
            "flat_no": r[1],
            "floor": r[2],
            "tower": r[3],
            "rent": r[4],
            "available": r[5],
            "amenities": r[6] if r[6] else []
        }
        result.append(flat_data)

    return jsonify(result), 200

# GET flats by floor (existing route, enhanced with amenities)
@flats_bp.route("/flats/<int:floor>", methods=["GET"])
@jwt_required()
def get_flats_by_floor(floor):
    conn = get_db_connection()
    cur = conn.cursor()

    # Get flats with amenities
    cur.execute("""
        SELECT 
            f.id, f.flat_no, f.floor, f.tower, f.rent, f.available,
            EXISTS (
                SELECT 1 FROM bookings b
                WHERE b.flat_id = f.id AND b.status = 'Requested'
            ) AS requested,
            ARRAY_AGG(a.name) FILTER (WHERE a.id IS NOT NULL) as amenities,
            ARRAY_AGG(a.icon) FILTER (WHERE a.id IS NOT NULL) as amenity_icons
        FROM flats f
        LEFT JOIN flat_amenities fa ON f.id = fa.flat_id
        LEFT JOIN amenities a ON fa.amenity_id = a.id
        WHERE f.floor = %s
        GROUP BY f.id, f.flat_no, f.floor, f.tower, f.rent, f.available
        ORDER BY f.flat_no
    """, (floor,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for r in rows:
        flat_data = {
            "id": r[0],
            "flatNo": r[1],
            "floor": r[2],
            "tower": r[3],
            "rent": r[4],  # ✅ FIXED: Use actual rent value, not floor
            "isAvailable": r[5],
            "requestStatus": "requested" if r[6] else None,
            "amenities": []
        }
        
        # Add amenities if they exist
        if r[7] and r[8]:
            for name, icon in zip(r[7], r[8]):
                if name:  # Filter out None values
                    flat_data["amenities"].append({
                        "name": name,
                        "icon": icon
                    })
        
        result.append(flat_data)

    return jsonify(result)


# UPDATE flat availability
@flats_bp.route("/flats/<int:flat_id>/availability", methods=["PUT"])
@jwt_required()
def update_flat_availability(flat_id):
    from flask import request
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            UPDATE flats
            SET available = %s
            WHERE id = %s
        """, (data.get('available', True), flat_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Flat availability updated successfully'})
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

# POST create new flat
@flats_bp.route("/flats", methods=["POST"])
@jwt_required()
def create_flat():
    data = request.json
    
    if not all(key in data for key in ['flat_no', 'floor', 'tower', 'rent']):
        return jsonify({'error': 'flat_no, floor, tower, and rent are required'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Insert flat
        cur.execute("""
            INSERT INTO flats (flat_no, floor, tower, rent, available)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data['flat_no'],
            data['floor'],
            data['tower'],
            data['rent'],
            data.get('available', True)
        ))
        
        flat_id = cur.fetchone()[0]
        
        # Insert amenity associations if provided
        if 'amenity_ids' in data and data['amenity_ids']:
            for amenity_id in data['amenity_ids']:
                cur.execute("""
                    INSERT INTO flat_amenities (flat_id, amenity_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (flat_id, amenity_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'id': flat_id, 'message': 'Flat created successfully'}), 201
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

# PUT update flat
@flats_bp.route("/flats/<int:flat_id>", methods=["PUT"])
@jwt_required()
def update_flat(flat_id):
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Update flat details
        cur.execute("""
            UPDATE flats
            SET flat_no = %s, floor = %s, tower = %s, rent = %s, available = %s
            WHERE id = %s
        """, (
            data.get('flat_no'),
            data.get('floor'),
            data.get('tower'),
            data.get('rent'),
            data.get('available', True),
            flat_id
        ))
        
        # Update amenities if provided
        if 'amenity_ids' in data:
            # Remove existing amenities
            cur.execute("DELETE FROM flat_amenities WHERE flat_id = %s", (flat_id,))
            
            # Add new amenities
            if data['amenity_ids']:
                for amenity_id in data['amenity_ids']:
                    cur.execute("""
                        INSERT INTO flat_amenities (flat_id, amenity_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, (flat_id, amenity_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Flat updated successfully'})
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

# DELETE flat
@flats_bp.route("/flats/<int:flat_id>", methods=["DELETE"])
@jwt_required()
def delete_flat(flat_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("DELETE FROM flats WHERE id = %s", (flat_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Flat deleted successfully'})
    
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': str(e)}), 500

