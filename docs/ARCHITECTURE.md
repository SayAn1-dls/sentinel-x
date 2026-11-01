# Sentinel-X Architecture Overview

## System Design
Sentinel-X is a real-time transaction risk monitoring platform built on Next.js 16.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), TailwindCSS, Phosphor Icons
- **Backend**: Next.js API Routes (server-side)
- **Database**: MongoDB Atlas (sentinel_x database)
- **Auth**: Google OAuth via Emergent Auth + WebAuthn passkeys
- **Deployment**: Vercel (auto-deploys from `main`); `render.yaml` defines a Render web service configuration for deployments that use Render
- **Standalone mock**: `backend/server.py` (FastAPI) serves a mock-data subset of the API for development

## Pages
- `/` - landing page
- `/auth` - OAuth and passkey login
- `/dashboard` - main monitoring console
- `/analysis` - AI scan analysis
- `/audit` - audit log explorer
- `/network` - gateway/network status
- `/security` - passkey and session management
- `/admin` - user administration

## Key Modules
- `RiskScoringEngine` - risk scoring and alert visualization
- `ThreatLandscapeMap` - geographic threat landscape map
- `ai-scanner` (`frontend/src/lib/ai-scanner.ts`) - AI-assisted entity scanning over transactions
- `audit-trace` (`frontend/src/lib/audit-trace.ts`) - audit trail utilities
- `frontend/src/lib/server/` - server-side auth, audit, MongoDB access, seeding, and transaction generation

## Data Flow
```
User → Auth (Google OAuth / passkey) → Session cookie (MongoDB)
     → Dashboard → API Routes → MongoDB → UI Components
```

## Security
- Data routes enforce session auth per route handler (`getSessionUser`); auth and passkey-login routes are public by design
- WebAuthn passkey support for passwordless login
- Audit logs written on every sensitive action
