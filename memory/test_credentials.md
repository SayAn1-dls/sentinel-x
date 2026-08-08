# SENTINEL-X Test Credentials

## Auth model
- Google social login via Emergent-managed Google Auth (no app-managed passwords)
- Biometric quick login via WebAuthn passkeys (registered from /security after login)
- Roles: FIRST user ever created in DB = ADMIN; all later users = ANALYST
- Session: `session_token` cookie (httpOnly, secure, SameSite=None) OR `Authorization: Bearer <token>` header

## Seeded test account (created directly in MongoDB for testing)
- user_id: test-admin-001
- email: test.admin@example.com
- name: Test Admin
- role: ADMIN
- session token (Bearer / cookie value): test_session_sentinel_001
  (7-day expiry from 2026-06 seed; re-seed via mongosh if expired — see /app/auth_testing.md)

## How to create a fresh test session
See /app/auth_testing.md (mongosh snippet for users + user_sessions collections, DB: test_database)

## RBAC notes
- /api/users (GET) and /api/users/:id (PATCH role) are ADMIN-only (403 for ANALYST)
- Admin cannot change their own role
