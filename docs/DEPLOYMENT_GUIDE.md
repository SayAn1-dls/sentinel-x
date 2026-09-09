# Deployment Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas (sentinel_x database)
- Render account

## Environment Variables
- `MONGO_URL` — MongoDB connection string
- `NEXTAUTH_URL` — public URL of the app
- `NEXTAUTH_SECRET` — random 32-char secret
- `OAUTH_BACKEND_URL` — https://demobackend.emergentagent.com
- `DB_NAME` — sentinel_x
- `NODE_ENV` — production

## Steps
1. Push to `main` → Render auto-deploys
2. Verify at `/auth` page
3. Login with Google to test session exchange
