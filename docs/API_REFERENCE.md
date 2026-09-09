# API Reference

## Authentication
All endpoints require a valid session token passed via cookie.

## Endpoints

### GET /api/auth/me
Returns current authenticated user.

### POST /api/auth/session
Exchanges OAuth session_id for a session cookie.

### POST /api/auth/logout
Invalidates the current session.

### GET /api/stats
Returns dashboard statistics.

### GET /api/alerts
Returns active threat alerts.

### GET /api/audit
Returns audit log entries.
