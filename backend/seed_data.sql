-- Towers
INSERT INTO towers (name, total_floors, flats_per_floor, address) VALUES
('Tower A', 5, 10, '123 Main Street'),
('Tower B', 5, 10, '456 Oak Avenue'),
('Tower C', 5, 10, '789 Pine Road')
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

-- Amenities
INSERT INTO amenities (name, description, icon, is_active) VALUES
('Swimming Pool', 'Olympic-sized pool', '🏊', TRUE),
('Gymnasium', '24/7 fitness center', '🏋️', TRUE),
('Covered Parking', 'Secure parking', '🅿️', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Bookings (Mock Data for Dashboard)
INSERT INTO bookings (user_email, flat_id, status) 
SELECT 'user1@test.com', id, 'Requested' 
FROM flats 
WHERE flat_no IN ('101', '102')
ON CONFLICT DO NOTHING;
