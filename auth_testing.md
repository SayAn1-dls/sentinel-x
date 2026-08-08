# Auth-Gated App Testing Playbook (SENTINEL-X)

NOTE - Do not be satisfied until you've tested the app completely, especially the auth-gated pages.

App specifics:
- Next.js app serves BOTH frontend (port 3000) and API routes (/api/*). A FastAPI proxy on port 8001 forwards /api/* to Next.js (ingress requirement).
- Session cookie name: `session_token` (httpOnly, secure, SameSite=None, path=/)
- Auth also accepts `Authorization: Bearer <token>` header.
- Roles: first user ever created = ADMIN, others = ANALYST.
- Collections: users, user_sessions, passkeys, webauthn_challenges, transactions, alerts, audit_logs, gateways, scans (DB: test_database)

## Step 1: Create Test User & Session
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  role: 'ADMIN',
  created_at: new Date(),
  last_login: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

## Step 2: Test Backend API
curl -X GET "https://<app-domain>/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "https://<app-domain>/api/transactions?limit=5" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "https://<app-domain>/api/stats" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X POST "https://<app-domain>/api/scan" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_SESSION_TOKEN" -d '{"target": "DARK-POOL-7"}'

## Step 3: Browser Testing
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "<app-domain>",
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto("https://<app-domain>/dashboard");

## WebAuthn testing (biometrics)
Use Chromium CDP virtual authenticator:
- WebAuthn.enable, then WebAuthn.addVirtualAuthenticator with
  {protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true}
- Register: login first (cookie), go to /security, click data-testid="register-passkey-btn"
- Quick login: logout, go to /auth, click data-testid="biometric-login-btn"

## Quick Debug
mongosh --eval "use('test_database'); db.users.find().limit(2); db.user_sessions.find().limit(2);"

## Clean test data
mongosh --eval "use('test_database'); db.users.deleteMany({email: /test\.user\./}); db.user_sessions.deleteMany({session_token: /test_session/});"

## Success Indicators
- /api/auth/me returns user data with user_id field
- Dashboard loads without redirect to /auth
- Transactions/alerts/audit/network/scan endpoints return 200 with data
- 401 without token; 403 for ANALYST on /api/users
