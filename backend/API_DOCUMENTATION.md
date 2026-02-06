# Backend API Endpoints

## Base URL
`http://127.0.0.1:5000/api`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🏢 Towers API

### GET /towers
Get all towers
```json
Response: [
  {
    "id": 1,
    "name": "Tower A",
    "total_floors": 5,
    "flats_per_floor": 10,
    "address": "123 Main Street",
    "created_at": "2026-02-03T..."
  }
]
```

### GET /towers/:id
Get single tower

### POST /towers
Create new tower
```json
Request: {
  "name": "Tower D",
  "total_floors": 5,
  "flats_per_floor": 10,
  "address": "Optional address"
}
```

### PUT /towers/:id
Update tower

### DELETE /towers/:id
Delete tower

---

## ⭐ Amenities API

### GET /amenities
Get all amenities
- Query param: `?active=true` to filter active only

### GET /amenities/:id
Get single amenity

### POST /amenities
Create new amenity
```json
Request: {
  "name": "Swimming Pool",
  "description": "Olympic-sized pool",
  "icon": "🏊",
  "is_active": true
}
```

### PUT /amenities/:id
Update amenity

### DELETE /amenities/:id
Delete amenity

---

## 🏠 Flats API (Enhanced)

### GET /flats/:floor
Get flats by floor (with amenities)
```json
Response: [
  {
    "id": 1,
    "flatNo": "101",
    "floor": 1,
    "tower": "A",
    "rent": 10500,
    "isAvailable": true,
    "requestStatus": null,
    "amenities": [
      {"name": "Security", "icon": "🔒"},
      {"name": "Parking", "icon": "🅿️"}
    ]
  }
]
```

### GET /flats
Get all flats with amenities (Admin use)

### PUT /flats/:id/availability
Update flat availability
```json
Request: {
  "available": false
}
```

---

## 📊 Dashboard & Reports API

### GET /dashboard/stats
Get dashboard statistics
```json
Response: {
  "total_towers": 3,
  "total_flats": 150,
  "pending_bookings": 5,
  "occupied_flats": 45,
  "available_flats": 105,
  "total_amenities": 12,
  "total_leases": 42,
  "monthly_revenue": 462000.00,
  "occupancy_rate": 30.0
}
```

### GET /dashboard/occupancy
Get occupancy report by tower
```json
Response: [
  {
    "tower": "A",
    "total_flats": 50,
    "available": 35,
    "occupied": 15,
    "occupancy_percentage": 30.0
  }
]
```

### GET /dashboard/payments
Get payment status report
```json
Response: {
  "payment_summary": [
    {
      "status": "paid",
      "count": 15,
      "total_rent": 165000,
      "percentage": 35.71
    }
  ],
  "recent_leases": [...]
}
```

### GET /dashboard/revenue
Get revenue report by tower
```json
Response: {
  "revenue_by_tower": [
    {
      "tower": "A",
      "active_leases": 14,
      "monthly_revenue": 154000,
      "total_deposits": 308000
    }
  ],
  "totals": {
    "total_leases": 42,
    "total_monthly_revenue": 462000,
    "total_deposits": 924000,
    "average_rent": 11000
  }
}
```

---

## 📝 Existing APIs (Already Working)

### POST /register
User registration

### POST /login
User login

### GET /bookings
Get user's bookings

### POST /bookings
Create booking

### GET /admin/bookings
Get all booking requests (Admin)

### PUT /admin/bookings/:id/approve
Approve booking

### PUT /admin/bookings/:id/reject
Reject booking
