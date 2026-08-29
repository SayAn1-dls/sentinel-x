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

---

## Alerts

### GET /alerts

List alerts with filtering and pagination.

**Query Parameters:**
| Parameter    | Type   | Description                           |
|--------------|--------|---------------------------------------|
| priority     | string | Filter: p1, p2, p3, p4               |
| status       | string | Filter: active, acknowledged, resolved|
| since        | string | ISO 8601 datetime lower bound         |
| until        | string | ISO 8601 datetime upper bound         |
| source       | string | Filter by source sensor ID            |

**Response (200):**
```json
{
  "alerts": [
    {
      "id": "alt_789",
      "title": "Temperature threshold breach",
      "priority": "p2",
      "source": "sen_001",
      "status": "active",
      "triggered_at": "2026-08-28T10:35:00Z",
      "message": "Temperature reading 45.2°C exceeds upper bound of 40°C"
    }
  ],
  "total": 15,
  "unacknowledged": 3
}
```

### POST /alerts/{alert_id}/acknowledge

Acknowledge an active alert.

**Request:**
```json
{
  "acknowledged_by": "usr_abc123",
  "notes": "Investigating the temperature spike in server room"
}
```

**Response (200):**
```json
{
  "alert_id": "alt_789",
  "status": "acknowledged",
  "acknowledged_at": "2026-08-28T10:40:00Z"
}
```

### POST /alerts/{alert_id}/resolve

Resolve an alert with resolution details.

**Request:**
```json
{
  "resolved_by": "usr_abc123",
  "resolution": "HVAC system restarted, temperature normalized",
  "root_cause": "HVAC compressor failure"
}
```

**Response (200):**
```json
{
  "alert_id": "alt_789",
  "status": "resolved",
  "resolved_at": "2026-08-28T11:00:00Z",
  "time_to_resolve_minutes": 25
}
```

---

## Detection Rules

### GET /detection/rules

List all configured detection rules.

**Response (200):**
```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "High Temperature Alert",
      "type": "threshold",
      "config": {
        "sensor_type": "temperature",
        "lower_bound": -10,
        "upper_bound": 40
      },
      "channels": ["email", "slack"],
      "priority": "p2",
      "enabled": true
    }
  ]
}
```

### POST /detection/rules

Create a new detection rule.

**Request:**
```json
{
  "name": "Motion After Hours",
  "type": "threshold",
  "config": {
    "sensor_type": "motion",
    "lower_bound": 0,
    "upper_bound": 0,
    "time_window": {"start": "22:00", "end": "06:00"}
  },
  "channels": ["email", "webhook", "sms"],
  "priority": "p1"
}
```

**Response (201):**
```json
{
  "rule_id": "rule_015",
  "status": "created",
  "enabled": true
}
```

---

## Health & Monitoring

### GET /health

System health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "version": "2.0.0-alpha",
  "timestamp": "2026-08-29T05:30:00Z",
  "components": {
    "database": {"status": "healthy", "latency_ms": 12.3},
    "redis": {"status": "healthy", "latency_ms": 1.5},
    "detection_engine": {"status": "healthy", "latency_ms": 0.8},
    "alert_router": {"status": "healthy", "latency_ms": 0.3}
  }
}
```

### GET /health/ready

Readiness probe for load balancer.

**Response (200):**
```json
{"ready": true}
```

**Response (503):**
```json
{"ready": false, "reason": "database connection unavailable"}
```

### GET /metrics

Prometheus-compatible metrics endpoint.

**Response (200 text/plain):**
```
# HELP sentinel_telemetry_total Total telemetry points processed
# TYPE sentinel_telemetry_total counter
sentinel_telemetry_total 1234567

# HELP sentinel_anomalies_total Total anomalies detected
# TYPE sentinel_anomalies_total counter
sentinel_anomalies_total{severity="low"} 450
sentinel_anomalies_total{severity="medium"} 120
sentinel_anomalies_total{severity="high"} 35
sentinel_anomalies_total{severity="critical"} 8

# HELP sentinel_active_sensors Current active sensor count
# TYPE sentinel_active_sensors gauge
sentinel_active_sensors 42
```

---

## Audit Trail

### GET /audit/logs

Query audit trail entries.

**Query Parameters:**
| Parameter | Type   | Description                     |
|-----------|--------|---------------------------------|
| action    | string | Filter by action type           |
| actor     | string | Filter by user ID               |
| since     | string | ISO 8601 lower time bound       |
| until     | string | ISO 8601 upper time bound       |
| limit     | int    | Max results (default: 100)      |

**Response (200):**
```json
{
  "entries": [
    {
      "id": "aud_001",
      "action": "auth.login",
      "actor": "usr_abc123",
      "timestamp": "2026-08-29T10:00:00Z",
      "resource_type": "session",
      "resource_id": "sess_xyz",
      "ip_address": "203.0.113.42",
      "success": true
    }
  ],
  "total": 2847
}
```
