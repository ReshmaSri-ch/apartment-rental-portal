from flask import Blueprint, request, jsonify
from db import get_db_connection

amenities_bp = Blueprint('amenities', __name__)

# GET all amenities
@amenities_bp.route('/amenities', methods=['GET'])
def get_amenities():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Optional filter by is_active
    is_active = request.args.get('active')
    
    if is_active is not None:
        cursor.execute("""
            SELECT id, name, description, icon, is_active, created_at
            FROM amenities
            WHERE is_active = %s
            ORDER BY name
        """, (is_active.lower() == 'true',))
    else:
        cursor.execute("""
            SELECT id, name, description, icon, is_active, created_at
            FROM amenities
            ORDER BY name
        """)
    
    amenities = []
    for row in cursor.fetchall():
        amenities.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'icon': row[3],
            'is_active': row[4],
            'created_at': row[5].isoformat() if row[5] else None
        })
    
    cursor.close()
    return jsonify(amenities)

# GET single amenity
@amenities_bp.route('/amenities/<int:amenity_id>', methods=['GET'])
def get_amenity(amenity_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, description, icon, is_active, created_at
        FROM amenities
        WHERE id = %s
    """, (amenity_id,))
    
    row = cursor.fetchone()
    cursor.close()
    
    if not row:
        return jsonify({'error': 'Amenity not found'}), 404
    
    amenity = {
        'id': row[0],
        'name': row[1],
        'description': row[2],
        'icon': row[3],
        'is_active': row[4],
        'created_at': row[5].isoformat() if row[5] else None
    }
    
    return jsonify(amenity)

# POST create new amenity
@amenities_bp.route('/amenities', methods=['POST'])
def create_amenity():
    data = request.json
    
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO amenities (name, description, icon, is_active)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (
            data['name'],
            data.get('description', ''),
            data.get('icon', ''),
            data.get('is_active', True)
        ))
        
        amenity_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        return jsonify({'id': amenity_id, 'message': 'Amenity created successfully'}), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        return jsonify({'error': str(e)}), 500

# PUT update amenity
@amenities_bp.route('/amenities/<int:amenity_id>', methods=['PUT'])
def update_amenity(amenity_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE amenities
            SET name = %s, description = %s, icon = %s, is_active = %s
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('description', ''),
            data.get('icon', ''),
            data.get('is_active', True),
            amenity_id
        ))
        
        conn.commit()
        cursor.close()
        
        return jsonify({'message': 'Amenity updated successfully'})
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        return jsonify({'error': str(e)}), 500

# DELETE amenity
@amenities_bp.route('/amenities/<int:amenity_id>', methods=['DELETE'])
def delete_amenity(amenity_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM amenities WHERE id = %s", (amenity_id,))
        conn.commit()
        cursor.close()
        
        return jsonify({'message': 'Amenity deleted successfully'})
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        return jsonify({'error': str(e)}), 500
