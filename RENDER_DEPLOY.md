# Deploying SENTINEL-X to Render

This app is a **single Next.js 16 fullstack service**. The `frontend/` folder contains the
entire application: UI pages AND all `/api/*` routes (auth, passkeys, transactions, etc.).

> ⚠️ Do NOT create a Render service for the `backend/` folder.
> `backend/server.py` is a Python reverse proxy needed only by the Emergent preview
> environment (its ingress routes `/api` to a second port). On Render, the Next.js
> server handles everything on one port — no proxy, no second service.
> The `npm error ENOENT ... backend/package.json` error happens when Render is pointed
> at `backend/` as a Node service — that folder is Python and has no package.json.

## Option A — Blueprint (recommended)
`render.yaml` at the repo root defines the service. In Render: New → Blueprint → select this repo.

## Option B — Manual Web Service
1. New → Web Service → select this repo
2. **Root Directory**: `frontend`
3. **Runtime**: Node (20+)
4. **Build Command**: `yarn install && yarn build`
5. **Start Command**: `yarn start`   (launcher auto-runs `next start` because NODE_ENV=production)

## Required environment variables (Render dashboard)
| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URL` | your MongoDB Atlas connection string (`mongodb+srv://...`) |
| `DB_NAME` | e.g. `sentinel_x` |
| `OAUTH_BACKEND_URL` | `https://demobackend.emergentagent.com` |

Notes:
- Render sets `PORT` automatically; the app honors it.
- Real environment variables override the committed `.env` defaults (which point at localhost Mongo for local dev).
- Google login and biometric passkeys work on any domain automatically (redirect URL and WebAuthn rpID are derived from the request origin at runtime).
- In MongoDB Atlas, allow network access from Render (0.0.0.0/0 or Render static IPs).
