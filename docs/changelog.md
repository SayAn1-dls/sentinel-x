# Sentinel-X Changelog

## [2.0.0-alpha] — 2026-09-02

### Added
- Multi-sensor telemetry ingestion via HTTP POST and MQTT
- Three-layer anomaly detection: threshold, Z-score, rate-of-change
- Rule-based threat classifier with CRITICAL/HIGH/MEDIUM/LOW/INFO severity levels
- Smart alert routing with deduplication and configurable cooldown windows
- Auto-escalation workflow for unacknowledged alerts
- Real-time dashboard with WebSocket-driven updates
- Forensic analysis module for incident investigation
- Complete audit trail for all security-relevant actions
- Prometheus-compatible `/metrics` endpoint
- Built-in health probe at `/health`
- Email (SMTP) and Slack webhook alert channels
- Alert acknowledgement via dashboard UI and REST API
- Sensor maintenance window scheduling (suppresses alerts during planned downtime)
- Docker support with example `docker-compose.yml`
- Full documentation: threat model, sensor integration, alert routing, deployment guide

### Technical
- FastAPI async backend with Motor (MongoDB) driver
- Redis for alert deduplication state across multiple instances
- React frontend with recharts for live telemetry visualisation
- MQTT broker integration via Paho
- Structured JSON logging throughout

## [1.0.0] — 2026-07-15

### Added
- Initial prototype: single-sensor threshold detection, basic email alerts
