-- ============================================================
-- APARTMENT RENTAL PORTAL - DATABASE INITIALIZATION
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TOWERS
CREATE TABLE IF NOT EXISTS towers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    total_floors INTEGER NOT NULL,
    flats_per_floor INTEGER NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. AMENITIES
CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. FLATS
CREATE TABLE IF NOT EXISTS flats (
    id SERIAL PRIMARY KEY,
    flat_no VARCHAR(50) NOT NULL,
    floor INTEGER NOT NULL,
    tower VARCHAR(10) NOT NULL,
    rent DECIMAL(10, 2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(flat_no, tower)
);

-- 5. BOOKINGS (with user_email referenced by code logic)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    flat_id INTEGER REFERENCES flats(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. FLAT_AMENITIES
CREATE TABLE IF NOT EXISTS flat_amenities (
    id SERIAL PRIMARY KEY,
    flat_id INTEGER NOT NULL,
    amenity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    UNIQUE(flat_id, amenity_id)
);

-- 7. LEASES
CREATE TABLE IF NOT EXISTS leases (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    flat_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    monthly_rent DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (flat_id) REFERENCES flats(id) ON DELETE CASCADE
);

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_towers_name ON towers(name);
CREATE INDEX IF NOT EXISTS idx_flats_tower ON flats(tower);
CREATE INDEX IF NOT EXISTS idx_bookings_user_email ON bookings(user_email);

-- 9. SAMPLE DATA

-- Towers
INSERT INTO towers (name, total_floors, flats_per_floor, address) VALUES
('Tower A', 5, 10, '123 Main Street'),
('Tower B', 5, 10, '456 Oak Avenue'),
('Tower C', 5, 10, '789 Pine Road')
ON CONFLICT (name) DO NOTHING;

-- Amenities
INSERT INTO amenities (name, description, icon, is_active) VALUES
('Swimming Pool', 'Olympic-sized pool', '🏊', TRUE),
('Gymnasium', '24/7 fitness center', '🏋️', TRUE),
('Covered Parking', 'Secure parking', '🅿️', TRUE),
('Garden Area', 'Landscaped garden', '🌳', TRUE),
('24/7 Security', 'CCTV surveillance', '🔒', TRUE),
('High-Speed Elevator', 'Modern elevators', '🛗', TRUE),
('Power Backup', 'Full backup', '⚡', TRUE),
('Club House', 'Recreation center', '🏛️', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Flats (Sample for Tower A)
INSERT INTO flats (flat_no, floor, tower, rent, available) 
SELECT 
    CAST((floor_num * 100 + unit_num) AS VARCHAR),
    floor_num,
    'A',
    9000 + (floor_num * 1000),
    TRUE
FROM 
    generate_series(1, 5) as floor_num,
    generate_series(1, 10) as unit_num
ON CONFLICT DO NOTHING;


-- Assign basic amenities
INSERT INTO flat_amenities (flat_id, amenity_id)
SELECT f.id, a.id
FROM flats f
CROSS JOIN amenities a
WHERE a.name IN ('24/7 Security', 'Power Backup')
ON CONFLICT DO NOTHING;

-- 10. DEFAULT ADMIN USER (admin@test.com / admin123)
-- Password hash is for 'admin123' generated with werkzeug security inside container
INSERT INTO users (email, password, role) VALUES 
('admin@test.com', 'scrypt:32768:8:1$Zy9X51YVOXrOJMia$e82d31210afcc7dc9fa59613fd251b56f9c082bfc8aa54d52a595fccf60824493e6f20ab2674995c371ad72ed954bdfa30c1c443ba6ef5b0ca4c0c0ac035552f', 'admin')
ON CONFLICT (email) DO NOTHING;

