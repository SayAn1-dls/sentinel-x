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
- **Detection engine**: pure-Python, stdlib-only modules under `src/`, exercised by the pytest suite in `tests/` (see [Testing Strategy](TESTING_STRATEGY.md))

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

## Python Detection Engine (`src/`)
A self-contained detection and correlation toolkit written in stdlib-only Python, importable as a package (`from src.modules import ...`). It has no web framework or service dependencies, is not imported by the Next.js app or the mock backend, and is verified per-module by the pytest suite (see [Testing Strategy](TESTING_STRATEGY.md)).

- **Detectors**: `credential_stuffing_detector`, `c2_beacon_detector`, `dns_anomaly`, `session_analyzer` (hijacking, off-hours, burst, device-shift signals), `behavioral_baseline`, plus generic `detection` primitives (threshold/statistical) and `threat_scorer` signal fusion
- **Correlation**: `correlation` (multi-event rules over a time window), `threat_graph` (entity graph: attack chains, pivot detection, blast radius, subgraph extraction), `session_risk` (EWMA per-session risk tracking)
- **Pipeline infrastructure**: `data_pipeline` (normalize/enrich/route), `event_bus` (typed pub/sub), `scheduler`, `rate_limiter`, `sensor_registry`, `health`, `metrics`
- **Alerting**: `alert` (deduplication + channel routing), `alert_pipeline` (incident lifecycle), `notification` (multi-channel delivery), `audit`

## Data Flow
```
User → Auth (Google OAuth / passkey) → Session cookie (MongoDB)
     → Dashboard → API Routes → MongoDB → UI Components
```

## Security
- Data routes enforce session auth per route handler (`getSessionUser`); auth and passkey-login routes are public by design
- WebAuthn passkey support for passwordless login
- Audit logs written on every sensitive action
