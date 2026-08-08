# SENTINEL-X — Forensic Guard Platform (PRD)

## Original Problem Statement
"Act as a professional developer with 10+ yrs experience — this is my project, make everything functional from login to password to biometrics, all things should be real and functional, backend should be strong, all things should be perfect."

## User Choices
- Auth: Google social login (Emergent-managed Google Auth) + WebAuthn biometrics
- DB: MongoDB (real persistence)
- Backend: Next.js API routes (single codebase) — FastAPI proxy on 8001 forwards /api/* to Next.js:3000 (ingress requirement)
- Data: all real from DB (seeded + live-updating via forensic engine)
- RBAC: ADMIN / ANALYST; first user to sign in = ADMIN

## Architecture
- Next.js 16 (App Router, TypeScript) at /app — pages on :3000, API routes under src/app/api/*
- /app/backend/server.py — FastAPI reverse proxy :8001 → :3000 (preserves host via x-forwarded-host for WebAuthn rpID)
- /app/frontend/package.json — supervisor shim (`yarn start` → `next dev` at /app)
- MongoDB collections: users, user_sessions, passkeys, webauthn_challenges, transactions, alerts, audit_logs, gateways, scans
- Env: /app/.env (MONGO_URL, DB_NAME)

## User Personas
- ADMIN: full access + operatives console (role management) at /security
- ANALYST: monitoring, scanning, blocking; 403 on /api/users

## What's Been Implemented (2026-06-08)
- Fixed broken existing codebase (syntax error in forensic-engine.ts, broken tsconfig paths, missing deps framer-motion/phosphor/zustand, Tailwind v4→v3 mismatch, dual next.config)
- Google OAuth login (Emergent Auth): /api/auth/session (session_id exchange), /api/auth/me, /api/auth/logout; httpOnly session_token cookie + Bearer fallback, 7-day sessions
- WebAuthn biometrics (@simplewebauthn v11): register passkey (/security), usernameless quick login (/auth); challenge TTL collection; counters updated; audit-logged
- RBAC: first user = ADMIN; admin console at /security (list users, promote/demote, self-change blocked)
- Real data layer: idempotent seeding (140 txs/48h, 4 gateways, alerts, audit logs); live tx generation with rule-based risk scoring (structuring, high-risk entities, offshore, velocity); AI scan persisted to DB; block/resolve/dismiss mutations persist + audit trail
- Frontend: /auth login page, AuthGate protection on all app pages, HUD user chip + logout, security console, rewired all hooks (useForensic/useThreat/useNetwork/useAudit/useAI) from mocks to API polling
- Testing: iteration_1 — 24/24 backend, 100% frontend incl. full WebAuthn cycle via CDP virtual authenticator

## Prioritized Backlog
- P1: Quick Actions buttons on dashboard are decorative (FULL SCAN / LOCK GATEWAYS / EXPORT REPORT / CLEAR ALERTS not wired)
- P1: PDF forensic report export (jspdf already installed, pdf-generator.ts exists unused)
- P2: SystemHealth / PacketMonitor panels are client-side visualizations (not DB-backed)
- P2: Orphan components (LandingPage.tsx, Dashboard.tsx, TransactionRow.tsx, ThreatLandscapeMap, RiskScoringEngine, SignalPulseWidget) unused by pages; jest suite untouched
- P2: Session management UI (list/revoke active sessions)
- P3: Real-time push (websockets) instead of polling; email alerts for CRITICAL threats

## Test Credentials
See /app/memory/test_credentials.md and /app/auth_testing.md
