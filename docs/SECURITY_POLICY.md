# Security Policy

## Supported Versions
| Version | Supported |
|---------|----------|
| 1.x     | ✅ Yes   |

## Reporting Vulnerabilities
Email: sayanbhatt2005@gmail.com

## Security Practices
- Google OAuth via Emergent Auth — no passwords stored
- WebAuthn passkeys supported for passwordless login
- Session tokens stored in HttpOnly, Secure cookies
- All API routes validate session before responding
- Audit logs written for every sensitive action
- MongoDB uses TLS and IP allowlist
- NEXTAUTH_SECRET rotated per deployment
