# Troubleshooting Guide

## Dashboard Shows Blank / Redirects to /auth
- Not logged in — go to `/auth` and login with Google
- Session cookie expired — re-login

## Session Exchange Fails (401 after Google login)
- Check `OAUTH_BACKEND_URL` env var is set to `https://demobackend.emergentagent.com`
- Verify `NEXTAUTH_URL` matches the live Render URL

## Build Fails on Render
- TypeScript errors: `ignoreBuildErrors: true` is set in next.config.mjs
- If yarn install fails: clear build cache on Render dashboard

## MongoDB Not Connecting
- Check `MONGO_URL` env var on Render
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify cluster URL uses `r1wrl6i.mongodb.net`

## API Returns 500
- Check Render runtime logs
- Most common cause: missing env var or MongoDB connection timeout
