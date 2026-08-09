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

## What's Been Implemented (2026-06-08, session 2)
- Quick Actions wired (dashboard): FULL SCAN (POST /api/scan target FULL-LEDGER, shows level/findings/confidence), LOCK/UNLOCK GATEWAYS (POST /api/network/lock toggle, locked gateways pinned OFFLINE in heartbeat), CLEAR ALERTS (POST /api/alerts/clear resolves non-critical), EXPORT REPORT (client-side jsPDF + autotable at src/lib/report-pdf.ts: summary, active alerts, top-20 risk txs, audit trail; logged via POST /api/audit EXPORT_REPORT whitelist)
- All actions audit-logged; verified via curl + live UI clicks (PDF download confirmed)

## What's Been Implemented (2026-06-08, session 3 — deployment fix)
- Production `next build` failure resolved (was killing Docker build step): deleted corrupted orphan dead code (TransactionRow.tsx, Dashboard.tsx, pdf-generator.ts, ForensicReportPanel.tsx — none reachable from any route), fixed old-schema files graph-engine.ts/velocity-engine.ts (from/to → sender/receiver), fixed debounce generics, typed gateway docs in /api/network, excluded jest configs + __tests__ from tsconfig type-check
- Deployment hygiene: OAuth backend URL moved to OAUTH_BACKEND_URL env (/app/.env), removed `.env` from .gitignore (was blocking deploy secret management), frontend shim gained build script, root start binds 0.0.0.0
- deployment_agent: no blockers remaining (only WARN on readonly preview supervisor + intentional REACT_APP_BACKEND_URL tooling var); testing iteration_2: 100% regression pass, yarn build exit 0

## What's Been Implemented (2026-06-08, session 4 — deployment root cause)
- TRUE root cause of repeated Docker build failures: plain `yarn install` (as run in the build image) exited 1 on Yarn engine check — @testing-library/jest-dom@6.10.0 requires Node >=22, build image runs Node 20
- Fixes: downgraded @testing-library/jest-dom to 6.6.3 (plain install now exits 0 with NO flags — proven by testing agent with .yarnrc disabled), added /app/.yarnrc `--ignore-engines true` as armor, frontend shim build = `yarn --cwd /app install && yarn --cwd /app build`, memory/test_credentials.md added to .gitignore
- deployment_agent final status: pass/warn (no blockers); testing iteration_3: 100% (install + clean build + backend/frontend smoke)
- Note: preview URL alias https://identity-pro.internal.stage-preview.emergentagent.com == dfda38da-... URL; frontend/.env now uses the alias

## What's Been Implemented (2026-06-08, session 5 — deployment restructure, FINAL fix)
- Platform guidance (support_agent) revealed the true blocker: deployer detects /app/frontend + /app/backend pattern and builds /app/frontend in an ISOLATED Docker stage — the old shim (`yarn --cwd /app ...`) failed there because the repo root doesn't exist in that stage
- RESTRUCTURED: the complete Next.js 16 app now lives self-contained in /app/frontend (package.json, yarn.lock, .yarnrc, node_modules, src/, next/tailwind/ts configs, .env with MONGO_URL/DB_NAME/OAUTH_BACKEND_URL/REACT_APP_BACKEND_URL). Root app files and /app/.env removed. /app/backend proxy unchanged
- New runtime launcher /app/frontend/start.js ("start": "node start.js"): NODE_ENV=production → `next start`, else `next dev` (preview hot reload preserved). Verified both modes serve pages+API
- deployment_agent: PASS (no blockers). testing iteration_4: 100% — self-contained install+build exit 0, 24/24 pytest, full frontend E2E, WebAuthn register+login still works post-restructure
- IMPORTANT for future sessions: all app code is now under /app/frontend/src (NOT /app/src)

## What's Been Implemented (2026-06-08, session 6 — Render deploy support)
- User tried deploying on Render pointing a Node service at backend/ (Python — no package.json) → npm ENOENT. Fix: /app/render.yaml blueprint (single web service, runtime node, rootDir frontend, build `yarn install && yarn build`, start `yarn start`, envVars NODE_ENV/MONGO_URL/DB_NAME/OAUTH_BACKEND_URL) + /app/RENDER_DEPLOY.md guide
- Key insight documented: backend/ FastAPI proxy is ONLY for Emergent preview ingress; on Render (or any single-port host) the Next.js service serves UI + all /api routes alone
- testing iteration_5: 100% — simulated Render exactly (prod build + start on arbitrary PORT, no proxy): pages, authed API, WebAuthn options with host-derived rpID all working; preview stack unaffected

## What's Been Implemented (2026-06-08, session 7 — LIVE deployments via CLI/API)
- Deployed BOTH platforms using user's credentials:
  - Vercel: https://sentinel-x-alpha-puce.vercel.app (project sentinel-x, account sayan1-dls; env vars MONGO_URL/DB_NAME/OAUTH_BACKEND_URL set for production; deployed from local workspace via CLI)
  - Render: https://sentinel-x-4ga7.onrender.com (service srv-d9rob3m7bikc738qs06g, node runtime, rootDir frontend, free plan, autoDeploy on push; old broken python service deleted via API)
- Fixed during rollout: NODE_ENV=production made Render's yarn install skip devDeps → 'Cannot find module tailwindcss'. Fixed Render buildCommand to `yarn install --production=false && yarn build` (also in render.yaml) AND moved build-critical packages (tailwindcss, postcss, autoprefixer, typescript, @types/*) into dependencies permanently
- ⚠️ OUTSTANDING (user action): MongoDB Atlas Network Access still blocks all external IPs — both live apps serve pages but API/DB calls 500 after ~30s timeout. User must add 0.0.0.0/0 in Atlas → Network Access. Atlas: cluster0.bwurlbb.mongodb.net, db sentinel_x
- User should push to GitHub again (Save to GitHub) so Render picks up yarn.lock + package.json dependency moves on next auto-deploy
- Session 7 addendum: mongo.ts now uses serverSelectionTimeoutMS 6s / connectTimeoutMS 8s (fail fast in serverless); Vercel redeployed with all fixes. Atlas STILL blocked as of last check — user has not completed Network Access step (declined API-key route too). Everything else verified live.

## Prioritized Backlog
- P2: SystemHealth / PacketMonitor panels are client-side visualizations (not DB-backed)
- P2: Orphan components (LandingPage.tsx, Dashboard.tsx, TransactionRow.tsx, ThreatLandscapeMap, RiskScoringEngine, SignalPulseWidget, pdf-generator.ts) unused by pages; jest suite untouched
- P2: Session management UI (list/revoke active sessions)
- P3: Real-time push (websockets) instead of polling; email alerts for CRITICAL threats

## Test Credentials
See /app/memory/test_credentials.md and /app/auth_testing.md
