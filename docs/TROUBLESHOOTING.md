# Troubleshooting Guide

## Dashboard Shows Blank / Redirects to /auth
- Not logged in — go to `/auth` and login with Google
- Session cookie expired — re-login

## Session Exchange Fails (401 after Google login)
- Check `OAUTH_BACKEND_URL` env var is set to `https://demobackend.emergentagent.com`
- Confirm the request reaches `/api/auth/session` and the backend at that URL is up

## Build Fails on Render
- TypeScript errors fail the build (`next.config.mjs` does not set `ignoreBuildErrors`). Run `npm run build` locally to reproduce
- If `npm ci` fails: check `package-lock.json` is in sync with `package.json`, then clear build cache on Render dashboard

## MongoDB Not Connecting
- Check `MONGO_URL` env var on Render
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify cluster URL uses `r1wrl6i.mongodb.net`

## API Returns 500
- Check Render runtime logs
- Most common cause: missing env var or MongoDB connection timeout
