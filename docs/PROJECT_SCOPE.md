# Sentinel-X — Project Scope

## Problem Statement
Organizations lack a unified platform to monitor, detect, and respond to authentication-layer threats and suspicious digital forensic events in real-time.

## Solution
Sentinel-X provides a security-focused dashboard for:
- Real-time threat monitoring and alert management
- Forensic event logging and analysis
- Passwordless authentication via Passkey/WebAuthn
- Audit logging for compliance

## Tech Stack
- *Frontend*: Next.js 14 (App Router), Tailwind CSS
- *Backend*: Next.js API Routes + Python proxy (FastAPI)
- *Database*: MongoDB Atlas
- *Auth*: NextAuth.js (Google OAuth) + WebAuthn
- *Hosting*: Render (frontend + backend)

## Out of Scope (v1)
- Mobile app
- Real-time WebSocket alerts
- Custom SIEM integrations
- Multi-tenant support
