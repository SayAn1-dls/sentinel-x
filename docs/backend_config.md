# Backend Config Reference

## Environment Variables

- APP_ENV: development|production
- APP_PORT: default 8000
- DATABASE_URL: PostgreSQL connection string
- MODEL_PATH: path to GNN model checkpoint
- MODEL_THRESHOLD: risk score cutoff (default 0.75)
- SECRET_KEY: JWT signing secret
- ALERT_WEBHOOK_URL: optional webhook for alert forwarding
- LOG_LEVEL: INFO|DEBUG|WARNING|ERROR
