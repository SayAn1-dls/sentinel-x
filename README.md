# Sentinel-X

A fraud-watching console: it follows money between accounts, scores every move, locks things down with passkeys and keeps an audit trail of everything.

Built by [Sayan Bhattacharya](https://github.com/SayAn1-dls).

## Layout

```
frontend/   Next.js app — landing page, console pages and API routes (MongoDB, WebAuthn)
src/        Python detection modules (credential stuffing, C2 beacons, DNS anomalies, scoring…)
tests/      Pytest suite for src/
backend/    FastAPI service and its tests
docs/       Architecture, API, deployment and research notes
```

## Run it

```bash
cd frontend
npm ci
cp ../.env.example .env.local   # set MONGO_URL
npm run dev                     # http://localhost:3000
```

```bash
pip install -r backend/requirements.txt pytest
pytest tests/            # Python detectors
cd frontend && npx jest  # frontend libs
```

## Deploy

- **Vercel** — import the repo with `frontend` as the root directory.
- **Render** — `render.yaml` is ready; see `RENDER_DEPLOY.md`.
