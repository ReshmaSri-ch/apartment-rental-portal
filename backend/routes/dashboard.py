from flask import Blueprint, jsonify
from db import get_db_connection

dashboard_bp = Blueprint('dashboard', __name__)

# GET dashboard statistics
@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total Towers
    cursor.execute("SELECT COUNT(*) FROM towers")
    total_towers = cursor.fetchone()[0]
    
    # Total Flats
    cursor.execute("SELECT COUNT(*) FROM flats")
    total_flats = cursor.fetchone()[0]
    
    # Pending Bookings
    cursor.execute("SELECT COUNT(*) FROM bookings WHERE status = 'Requested'")
    pending_bookings = cursor.fetchone()[0]
    
    # Occupied Flats
    cursor.execute("SELECT COUNT(*) FROM flats WHERE available = FALSE")
    occupied_flats = cursor.fetchone()[0]
    
    # Available Flats
    cursor.execute("SELECT COUNT(*) FROM flats WHERE available = TRUE")
    available_flats = cursor.fetchone()[0]
    
    # Total Amenities
    cursor.execute("SELECT COUNT(*) FROM amenities WHERE is_active = TRUE")
    total_amenities = cursor.fetchone()[0]
    
    # Total Leases
    cursor.execute("SELECT COUNT(*) FROM leases")
    total_leases = cursor.fetchone()[0]
    
    # Revenue (sum of monthly rents from active leases)
    cursor.execute("SELECT COALESCE(SUM(monthly_rent), 0) FROM leases")
    monthly_revenue = float(cursor.fetchone()[0])
    
    cursor.close()
    
    stats = {
        'total_towers': total_towers,
        'total_flats': total_flats,
        'pending_bookings': pending_bookings,
        'occupied_flats': occupied_flats,
        'available_flats': available_flats,
        'total_amenities': total_amenities,
        'total_leases': total_leases,
        'monthly_revenue': monthly_revenue,
        'occupancy_rate': round((occupied_flats / total_flats * 100), 2) if total_flats > 0 else 0
    }
    
    return jsonify(stats)

# GET occupancy report by tower
@dashboard_bp.route('/dashboard/occupancy', methods=['GET'])
def get_occupancy_report():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            tower,
            COUNT(*) as total_flats,
            SUM(CASE WHEN available THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN NOT available THEN 1 ELSE 0 END) as occupied,
            ROUND(SUM(CASE WHEN NOT available THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as occupancy_pct
        FROM flats
        GROUP BY tower
        ORDER BY tower
    """)
    
    report = []
    for row in cursor.fetchall():
        report.append({
            'tower': row[0],
            'total_flats': row[1],
            'available': row[2],
            'occupied': row[3],
            'occupancy_percentage': float(row[4]) if row[4] else 0
        })
    
    cursor.close()
    return jsonify(report)

# GET payment report
@dashboard_bp.route('/dashboard/payments', methods=['GET'])
def get_payment_report():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Payment status summary
    cursor.execute("""
        SELECT 
            payment_status,
            COUNT(*) as count,
            SUM(monthly_rent) as total_rent,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM leases), 2) as percentage
        FROM leases
        GROUP BY payment_status
        ORDER BY count DESC
    """)
    
    payment_summary = []
    for row in cursor.fetchall():
        payment_summary.append({
            'status': row[0],
            'count': row[1],
            'total_rent': float(row[2]) if row[2] else 0,
            'percentage': float(row[3]) if row[3] else 0
        })
    
    # Recent leases
    cursor.execute("""
        SELECT 
            l.id,
            u.email as user_email,
            f.flat_no,
            f.tower,
            l.monthly_rent,
            l.payment_status,
            l.start_date,
            l.end_date
        FROM leases l
        JOIN users u ON l.user_id = u.id
        JOIN flats f ON l.flat_id = f.id
        ORDER BY l.created_at DESC
        LIMIT 10
    """)
    
    recent_leases = []
    for row in cursor.fetchall():
        recent_leases.append({
            'id': row[0],
            'user_email': row[1],
            'flat_no': row[2],
            'tower': row[3],
            'monthly_rent': float(row[4]),
            'payment_status': row[5],
            'start_date': row[6].isoformat() if row[6] else None,
            'end_date': row[7].isoformat() if row[7] else None
        })
    
    cursor.close()
    
    return jsonify({
        'payment_summary': payment_summary,
        'recent_leases': recent_leases
    })

# GET revenue report
@dashboard_bp.route('/dashboard/revenue', methods=['GET'])
def get_revenue_report():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total revenue by tower
    cursor.execute("""
        SELECT 
            f.tower,
            COUNT(l.id) as active_leases,
            SUM(l.monthly_rent) as monthly_revenue,
            SUM(l.deposit_amount) as total_deposits
        FROM leases l
        JOIN flats f ON l.flat_id = f.id
        GROUP BY f.tower
        ORDER BY f.tower
    """)
    
    revenue_by_tower = []
    for row in cursor.fetchall():
        revenue_by_tower.append({
            'tower': row[0],
            'active_leases': row[1],
            'monthly_revenue': float(row[2]) if row[2] else 0,
            'total_deposits': float(row[3]) if row[3] else 0
        })
    
    # Overall totals
    cursor.execute("""
        SELECT 
            COUNT(*) as total_leases,
            SUM(monthly_rent) as total_monthly_revenue,
            SUM(deposit_amount) as total_deposits,
            AVG(monthly_rent) as average_rent
        FROM leases
    """)
    
    row = cursor.fetchone()
    totals = {
        'total_leases': row[0],
        'total_monthly_revenue': float(row[1]) if row[1] else 0,
        'total_deposits': float(row[2]) if row[2] else 0,
        'average_rent': float(row[3]) if row[3] else 0
    }
    
    cursor.close()
    
    return jsonify({
        'revenue_by_tower': revenue_by_tower,
        'totals': totals
    })
