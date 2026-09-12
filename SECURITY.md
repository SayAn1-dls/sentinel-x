# Security Policy

## Supported Versions

Sentinel-X is currently in active development. Security fixes are applied to the latest version on `main`.

| Version | Supported |
|---------|----------|
| `main` (latest) | ✅ Yes |
| Older snapshots | ❌ No |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Public disclosure of a vulnerability before a patch is available puts all users at risk. Please follow the responsible disclosure process below.

### How to Report

Send a detailed report to:

**Email:** sayanbhatt2005@gmail.com  
**Subject line:** `[SECURITY] Sentinel-X — <brief description>`

Include in your report:

1. **Description** — A clear explanation of the vulnerability
2. **Impact** — What an attacker could achieve by exploiting it
3. **Reproduction steps** — Detailed steps to reproduce the issue
4. **Affected component** — Which module, endpoint, or layer is affected
5. **Suggested fix** (optional) — If you have a proposed mitigation
6. **CVE reference** (if applicable)

### What to Expect

| Timeline | Action |
|----------|--------|
| Within 48 hours | Acknowledgement of your report |
| Within 7 days | Initial assessment and severity classification |
| Within 30 days | Patch developed and tested |
| After patch is live | Public disclosure coordinated with reporter |

We follow a **90-day disclosure deadline** aligned with industry-standard responsible disclosure norms. If a patch cannot be delivered within 90 days, we will notify you and coordinate an extended timeline.

---

## Scope

### In Scope

- Authentication and passkey (WebAuthn / FIDO2) bypass
- Authorization flaws — accessing data belonging to other users
- Injection vulnerabilities (SQL, NoSQL, command, etc.)
- Sensitive data exposure (tokens, keys, PII)
- Business logic flaws in the fraud detection pipeline
- Remote code execution
- Server-side request forgery (SSRF)
- Cryptographic weaknesses

### Out of Scope

- Denial-of-service attacks
- Social engineering or phishing of project maintainers
- Vulnerabilities in third-party dependencies (report these directly to the dependency maintainer)
- Issues requiring physical access to a device
- Reports generated solely by automated scanners without manual verification

---

## Security Architecture Overview

Sentinel-X is designed with security-first principles:

- **Zero-password authentication** via WebAuthn FIDO2 passkeys
- **JWT-based session tokens** with short expiry and rotation
- **MongoDB Atlas** with role-based access control and encryption at rest
- **Isolation Forest + GNN** anomaly detection for behavioral analysis
- **Immutable audit trail** — every action is logged with actor identity and timestamp
- **Sanctions & PEP screening** against global watchlists
- **Rate limiting** on all public API endpoints
- **Input validation** via Pydantic models on all FastAPI routes

---

## Acknowledgements

We are grateful to security researchers who help keep Sentinel-X secure. Responsible disclosures will be credited in our release notes (with your permission).

---

Built with 🔴 by Sayan Bhattacharya | B.Tech CS | 2026
