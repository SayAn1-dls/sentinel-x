# Dev Notes — Sep 2, 2026

## Session: Morning

### Auth Architecture Decision
Decided on a dual-layer auth system:
1. Google OAuth via NextAuth (primary)
2. WebAuthn/Passkey (secondary, for passwordless)

### Threat Model Draft
Identified key threat vectors:
- Session hijacking → mitigate with short-lived JWTs
- CSRF → NextAuth built-in protection
- Brute force → rate limiting on `/api/auth`
- Forensic data tampering → audit log with hash chaining

### TODO
- [ ] Implement NextAuth Google provider
- [ ] Design forensic event schema
- [ ] Plan dashboard layout
