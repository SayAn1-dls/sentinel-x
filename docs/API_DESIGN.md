# API Design — Sentinel-X

## Base URL
`/api`

## Auth Endpoints
- `GET /api/auth/session` — Get current session (NextAuth)
- `POST /api/auth/signin` — Initiate Google OAuth
- `POST /api/auth/signout` — End session
- `POST /api/auth/passkey/register` — Begin passkey registration
- `POST /api/auth/passkey/verify` — Verify passkey assertion

## Forensic Endpoints
- `GET /api/forensics` — List all forensic events
- `POST /api/forensics` — Log a new forensic event
- `GET /api/forensics/:id` — Get event by ID

## Threat Endpoints
- `GET /api/threats` — List all active threats
- `POST /api/threats/:id/resolve` — Mark threat as resolved

## Audit Endpoints
- `GET /api/audit` — Fetch audit log (admin only)

## Response Format
```json
{
  "success": true,
  "data": {},
  "error": null
}
```
