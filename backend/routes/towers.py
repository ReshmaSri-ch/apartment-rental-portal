from flask import Blueprint, request, jsonify
from db import get_db_connection

towers_bp = Blueprint('towers', __name__)

# GET all towers
@towers_bp.route('/towers', methods=['GET'])
def get_towers():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, total_floors, flats_per_floor, address, created_at
        FROM towers
        ORDER BY name
    """)
    
    towers = []
    for row in cursor.fetchall():
        towers.append({
            'id': row[0],
            'name': row[1],
            'total_floors': row[2],
            'flats_per_floor': row[3],
            'address': row[4],
            'created_at': row[5].isoformat() if row[5] else None
        })
    
    cursor.close()
    return jsonify(towers)

# GET single tower
@towers_bp.route('/towers/<int:tower_id>', methods=['GET'])
def get_tower(tower_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, total_floors, flats_per_floor, address, created_at
        FROM towers
        WHERE id = %s
    """, (tower_id,))
    
    row = cursor.fetchone()
    cursor.close()
    
    if not row:
        return jsonify({'error': 'Tower not found'}), 404
    
    tower = {
        'id': row[0],
        'name': row[1],
        'total_floors': row[2],
        'flats_per_floor': row[3],
        'address': row[4],
        'created_at': row[5].isoformat() if row[5] else None
    }
    
    return jsonify(tower)

# POST create new tower
@towers_bp.route('/towers', methods=['POST'])
def create_tower():
    data = request.json
    
    if not data.get('name') or not data.get('total_floors') or not data.get('flats_per_floor'):
        return jsonify({'error': 'Name, total_floors, and flats_per_floor are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO towers (name, total_floors, flats_per_floor, address)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (
            data['name'],
            data['total_floors'],
            data['flats_per_floor'],
            data.get('address', '')
        ))
        
        tower_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        return jsonify({'id': tower_id, 'message': 'Tower created successfully'}), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        return jsonify({'error': str(e)}), 500

# PUT update tower
@towers_bp.route('/towers/<int:tower_id>', methods=['PUT'])
def update_tower(tower_id):
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE towers
            SET name = %s, total_floors = %s, flats_per_floor = %s, address = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('total_floors'),
            data.get('flats_per_floor'),
            data.get('address', ''),
            tower_id
        ))
        
        conn.commit()
        cursor.close()
        
        return jsonify({'message': 'Tower updated successfully'})
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        return jsonify({'error': str(e)}), 500

# DELETE tower
@towers_bp.route('/towers/<int:tower_id>', methods=['DELETE'])
def delete_tower(tower_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM towers WHERE id = %s", (tower_id,))
        conn.commit()
        cursor.close()
        
        return jsonify({'message': 'Tower deleted successfully'})
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        return jsonify({'error': str(e)}), 500
