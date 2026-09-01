# Deployment Guide

This document covers deploying Sentinel-X to a production environment.

## Prerequisites

- Node.js 20 LTS
- Python 3.11+
- MongoDB 7.x (Atlas M10+ recommended for production)
- Redis 7.x
- A process manager (PM2 or systemd)

## Environment Variables

Copy `.env.example` to `.env` and populate all required values:

```bash
# Core
NODE_ENV=production
PORT=8000
SECRET_KEY=<strong-random-32-char-secret>

# Database
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sentinel_x?retryWrites=true&w=majority
REDIS_URL=redis://:<password>@<host>:6379

# Alerting
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=alerts@yourdomain.com
SMTP_PASS=<smtp-password>
ALERT_EMAIL_TO=soc@yourdomain.com

# Webhooks (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## Docker (Recommended)

```bash
# Build
docker build -t sentinel-x:latest .

# Run
docker run -d \
  --name sentinel-x \
  --env-file .env \
  -p 8000:8000 \
  sentinel-x:latest
```

## Manual Deploy

```bash
# Install dependencies
npm install --production
pip install -r requirements.txt

# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## MongoDB Atlas Setup

1. Create an M10+ cluster (M0 free tier has no dedicated RAM — not suitable for production telemetry ingest)
2. Create a database user with `readWrite` on the `sentinel_x` database only
3. Add your server IP to the Atlas IP whitelist (or use VPC peering for private networking)
4. Enable Atlas Alerts for cluster health and disk utilisation

## Health Checks

After deployment, verify all systems are up:

```bash
# API health
curl https://your-domain.com/health
# Expected: {"status": "ok", "db": "connected", "redis": "connected"}

# Metrics endpoint (Prometheus-compatible)
curl https://your-domain.com/metrics
```

## Scaling Notes

- The detection engine is stateless; run multiple instances behind a load balancer
- Redis is required for alert deduplication state when running multiple instances
- MongoDB TTL indexes auto-expire raw telemetry after 90 days (configurable in `src/config/settings.py`)

## Monitoring

Recommended stack:
- **Prometheus** — scrape `/metrics` every 15s
- **Grafana** — dashboards for ingest rate, anomaly rate, alert latency
- **Uptime Kuma** — lightweight external ping monitoring for the health endpoint
