# API Reference

Sentinel-X serves its REST API through Next.js API routes under `frontend/src/app/api/`.

All data endpoints require a valid session cookie and return `401 { "error": "Not authenticated" }` without one. The authentication and passkey login endpoints are public by design.

## Authentication

### GET /api/auth/me
Returns the current authenticated user.

### POST /api/auth/session
Exchanges an OAuth session_id for a session cookie.

### POST /api/auth/logout
Invalidates the current session.

## Passkeys (WebAuthn)

### POST /api/passkeys/register/options
Begins passkey registration; returns WebAuthn creation options.

### POST /api/passkeys/register/verify
Completes passkey registration.

### POST /api/passkeys/login/options
Begins passkey login; returns WebAuthn request options.

### POST /api/passkeys/login/verify
Completes passkey login and creates a session.

### GET /api/passkeys
Lists the current user's registered passkeys.

### DELETE /api/passkeys
Removes one of the current user's passkeys.

## Dashboard

### GET /api/stats
Returns dashboard statistics.

### GET /api/alerts
Returns active threat alerts.

### PATCH /api/alerts/[id]
Updates a single alert (e.g. marks it resolved).

### POST /api/alerts/clear
Bulk-resolves all non-CRITICAL open alerts.

### GET /api/audit
Returns audit log entries. Supports `limit` (max 500) and `severity` query parameters.

### POST /api/audit
Records a new audit log entry.

## Transactions

### GET /api/transactions
Lists monitored transactions.

### POST /api/transactions
Ingests a new transaction; raises an alert when risk rules match.

### PATCH /api/transactions/[id]/block
Blocks a transaction.

## Users and Admin

### GET /api/users
Lists users with their passkey counts.

### PATCH /api/users/[id]
Updates a user's role.

### GET /api/admin/users
Admin view: lists users with passkey details.

### PATCH /api/admin/users
Admin: updates a user.

### DELETE /api/admin/users
Admin: removes users.

### GET /api/admin/users/[id]
Admin: returns one user with their passkeys.

### PATCH /api/admin/users/[id]
Admin: updates one user.

### DELETE /api/admin/users/[id]
Admin: deletes one user.

## Network

### GET /api/network
Returns gateway/network node status.

### POST /api/network/lock
Locks the network (emergency containment).

## AI Scan

### POST /api/scan
Runs the AI scanner against a target entity (matches transactions by sender/receiver) and records the result.

### GET /api/scan
Returns scanner status, model version, and the 8 most recent scans.

## Standalone mock backend

`backend/server.py` is a standalone FastAPI mock for development. It serves a subset of the API (`/health`, `/api/stats`, `/api/transactions`, `/api/alerts`, `/api/audit`, `/api/users`, `/api/network`) with static mock data and no authentication.
