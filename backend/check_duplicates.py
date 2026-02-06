import psycopg2
from db import get_db_connection

conn = get_db_connection()
cur = conn.cursor()

# Check for duplicate flats
cur.execute("""
    SELECT flat_no, floor, tower, COUNT(*) as count
    FROM flats
    GROUP BY flat_no, floor, tower
    HAVING COUNT(*) > 1
    ORDER BY count DESC
""")

duplicates = cur.fetchall()
print(f"\n🔍 Found {len(duplicates)} duplicate flat combinations:")
for dup in duplicates:
    print(f"  Flat {dup[0]}, Floor {dup[1]}, Tower {dup[2]}: {dup[3]} occurrences")

# Show all flats
cur.execute("""
    SELECT id, flat_no, floor, tower
    FROM flats
    ORDER BY tower, floor, flat_no
""")

all_flats = cur.fetchall()
print(f"\n📋 Total flats in database: {len(all_flats)}")
print("\nFirst 20 flats:")
for flat in all_flats[:20]:
    print(f"  ID: {flat[0]}, Flat: {flat[1]}, Floor: {flat[2]}, Tower: {flat[3]}")

cur.close()
conn.close()
