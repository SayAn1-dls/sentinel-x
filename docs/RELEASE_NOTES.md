# Release Notes

## v1.0.0 — Initial Release

### Features
- Google OAuth login via NextAuth.js
- Passkey / WebAuthn passwordless authentication
- Forensic analysis HUD dashboard
- Threat alert monitoring system
- Audit log for all sensitive actions
- Session exchange with backend proxy
- MongoDB Atlas for data persistence
- Deployed on Render (Next.js frontend + Python proxy backend)

### Known Issues
- Cold start delay on Render free tier (~30-60s)
- Dashboard requires seeded data to display alerts

## v1.1.0 — Planned
- Real-time threat alerts via WebSocket
- Mobile-responsive HUD
- Custom detection rules builder
- Role-based access control (RBAC)
