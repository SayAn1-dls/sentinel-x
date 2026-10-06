# Sentinel-X Architecture Overview

## System Design
Sentinel-X is a real-time forensic transaction monitoring platform built on Next.js 16.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), TailwindCSS, Phosphor Icons
- **Backend**: Next.js API Routes (server-side)
- **Database**: MongoDB Atlas (sentinel_x database)
- **Auth**: Google OAuth via Emergent Auth + WebAuthn passkeys
- **Deployment**: Render (Web Service)

## Key Modules
- `ForensicHUD` — real-time threat visualization
- `BiometricEngine` — behavioural anomaly detection
- `AuditFeed` — live audit log stream
- `ThreatMatrix` — risk scoring engine

## Data Flow
```
User → Auth (Google OAuth) → Session Token (MongoDB)
     → Dashboard → API Routes → MongoDB → UI Components
```

## Security
- All routes protected by session middleware
- WebAuthn passkey support for passwordless login
- Audit logs written on every sensitive action
