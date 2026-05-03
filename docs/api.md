# API Documentation

This platform exposes REST endpoints for hospital search, doctor onboarding, appointment booking, and admin workflows.

## Swagger
- Available at `/api/docs`
- Powered by `swagger-jsdoc` and `swagger-ui-express`

## Authentication

### POST /api/auth/register
Register a new user.

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/login
Login user.

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/auth/profile
Get user profile (requires `Authorization: Bearer <token>`).

## Hospitals

### GET /api/hospitals
List hospitals and search by location or specialization.
Query parameters:
- `city`
- `lat`
- `lon`
- `specialization`
- `page`
- `limit`

### GET /api/hospitals/:id
Get hospital details with embedded doctor list.

### POST /api/hospitals/ingest-city
Admin-only endpoint for city ingestion from Google Places.

### POST /api/hospitals
Create a hospital record (hospital_admin or admin role).

## Search

### GET /api/search/hospitals
Elasticsearch-powered search with fuzzy matching, geo ranking, and typo tolerance.

### GET /api/search/suggest
Auto-suggestions for search text.

### GET /api/search/city/:cityName
Get top recommendations for a city.

## Doctors

### GET /api/doctors
List doctors with specialization and expertise filters.

### POST /api/doctors
Create a doctor profile (doctor/hospital_admin/admin roles).

### GET /api/doctors/:id
Get doctor details.

### PUT /api/doctors/:id/availability
Update doctor availability slots.

## Appointments

### POST /api/appointments
Book an appointment with transaction locking to prevent double-booking.

### GET /api/appointments/me
Get current user's upcoming appointments.

### PATCH /api/appointments/:id/status
Update the appointment status.

## Admin

### PUT /api/admin/hospitals/:id
Update hospital information.

### PUT /api/admin/doctors/:id
Update doctor information.

## Deployment Notes

- Use Redis for caching hot search queries.
- Use Elasticsearch for fuzzy and geo-aware search.
- Use AWS S3 for file assets and a CDN for images.
- Protect APIs with JWT and RBAC.
- Use `database/schema_v2.sql` for production database migrations.
