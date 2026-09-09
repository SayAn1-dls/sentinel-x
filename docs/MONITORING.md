# Monitoring & Observability

## Render Dashboard
- Check build/deploy logs for the `sentinel-x` service
- Monitor `sentinel-x-api` proxy health at `/health`
- Set healthCheckPath to `/auth` for the Next.js service

## Application Metrics
- Alert volume per severity (low/medium/high/critical)
- Session creation rate
- Failed login attempts
- Audit log write rate

## Database Monitoring
- MongoDB Atlas: watch `sentinel_x` collection sizes
- Index: `sessions.token`, `audit_logs.timestamp`, `alerts.status`
- Alert if audit_logs exceeds 100k entries

## Security Monitoring
- Flag > 5 failed logins from same IP in 10 min
- Alert on critical-severity forensic events
- Monitor for unusual session activity patterns
