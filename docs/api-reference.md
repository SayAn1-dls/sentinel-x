# Sentinel-X API Reference

## Base URL

```
Production: https://sentinel-x.onrender.com/api/v2
Development: http://localhost:8000/api/v2
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### POST /auth/login

Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "admin@sentinel-x.io",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400,
  "user": {
    "id": "usr_abc123",
    "email": "admin@sentinel-x.io",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "error": "invalid_credentials",
  "message": "Email or password is incorrect"
}
```

### POST /auth/refresh

Refresh an expiring JWT token.

**Request:**
```json
{
  "refresh_token": "rt_xyz789..."
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400
}
```

---

## Sensors

### GET /sensors

List all registered sensors with status.

**Query Parameters:**
| Parameter | Type   | Description                      |
|-----------|--------|----------------------------------|
| status    | string | Filter by status: active/offline |
| type      | string | Filter by sensor type            |
| page      | int    | Page number (default: 1)         |
| limit     | int    | Items per page (default: 20)     |

**Response (200):**
```json
{
  "sensors": [
    {
      "id": "sen_001",
      "name": "Main Entrance Camera",
      "type": "video",
      "status": "active",
      "last_ping": "2026-08-28T10:30:00Z",
      "location": {"lat": 12.9716, "lng": 77.5946}
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

### POST /sensors/{sensor_id}/telemetry

Submit sensor telemetry data.

**Request:**
```json
{
  "sensor_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-08-28T10:30:00Z",
  "readings": [
    {"type": "temperature", "value": 28.5},
    {"type": "motion", "value": 1}
  ],
  "metadata": {
    "location": "building_a_floor_2",
    "firmware_version": "3.2.1"
  }
}
```

**Response (202):**
```json
{
  "status": "accepted",
  "telemetry_id": "tel_abc123",
  "processed_at": "2026-08-28T10:30:01Z"
}
```
