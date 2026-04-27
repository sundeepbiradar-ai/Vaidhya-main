# API Documentation

## Authentication

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/auth/profile
Get user profile (requires authentication).

## Hospitals

### GET /api/hospitals
Get all hospitals with optional filters.

**Query Parameters:**
- `city`: Filter by city
- `limit`: Limit results (default: 10)

### GET /api/hospitals/:id
Get hospital details by ID.

### GET /api/hospitals/search
Search hospitals.

**Query Parameters:**
- `q`: General search query
- `city`: Filter by city

### POST /api/hospitals/compare
Compare multiple hospitals.

**Request Body:**
```json
{
  "hospitalIds": [1, 2, 3]
}
```

## Bookings

### POST /api/bookings
Create a new booking (requires authentication).

**Request Body:**
```json
{
  "hospital_id": 1,
  "procedure": "Consultation",
  "booking_date": "2024-01-15T10:00:00Z"
}
```

### GET /api/bookings/my
Get user's bookings (requires authentication).

### GET /api/bookings/:id
Get booking details (requires authentication, user must own booking).

### PUT /api/bookings/:id
Update booking status (requires authentication).