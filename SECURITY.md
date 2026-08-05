# SECURITY POLICY — SENTINEL-X

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Active Support   |
| < 1.0   | ❌ Unsupported      |

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Send reports to: `security@sentinel-x.internal`

Include:
1. Description of the vulnerability
2. Steps to reproduce
3. Affected component (`ForensicEngine`, `ThreatAnalyzer`, API routes, etc.)
4. Proposed fix (optional but appreciated)

Expected response time: **48 hours**.

## Security Principles

- All user inputs are sanitized before processing
- No plaintext secrets in the codebase — use environment variables
- API routes validate request structure before executing
- Forensic logs are append-only (immutable audit trail)
- Network scan results are never cached server-side

## Dependency Auditing

```bash
npm audit
npm audit fix
```

Run audits before every production release.

---

*SENTINEL-X FORENSIC GUARD · SECURITY CLASSIFIED*
