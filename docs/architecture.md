# Sentinel-X System Architecture

## Overview

Sentinel-X is a comprehensive security and surveillance platform designed
for real-time threat detection, anomaly analysis, and automated incident
response. The system processes data from multiple sensor types, applies
machine learning models for threat classification, and routes alerts
through configurable delivery channels.

## High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Sensors   │────▶│  Ingestion   │────▶│   Detection    │
│  & Sources  │     │   Gateway    │     │    Engine      │
└─────────────┘     └──────────────┘     └───────┬────────┘
                                                  │
                    ┌──────────────┐     ┌────────▼────────┐
                    │   Alert      │◀────│   Threat        │
                    │   Router     │     │   Classifier    │
                    └──────┬───────┘     └─────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Email   │ │ Webhook  │ │  Slack   │
        └──────────┘ └──────────┘ └──────────┘
```

## Core Components

### 1. Ingestion Gateway
- Receives sensor telemetry via REST API and WebSocket streams
- Validates payload structure and authenticates sensor connections
- Normalizes data formats before forwarding to detection pipeline
- Rate-limited to prevent sensor flooding attacks

### 2. Detection Engine
- **Threshold Detector**: Monitors readings against configured bounds
- **Statistical Detector**: Z-score and IQR-based outlier detection
- **Pattern Detector**: Sequence-aware anomaly identification
- **ML Classifier**: Neural network threat scoring (planned)

### 3. Threat Classifier
- Assigns severity scores to detected anomalies
- Correlates events across multiple sensors for context
- Maintains historical threat patterns for trend analysis
- Feeds into the alert routing decision engine

### 4. Alert Router
- Priority-based routing with configurable rules
- Deduplication with fingerprint-based suppression
- Escalation workflows for unacknowledged alerts
- Multi-channel delivery (email, webhook, Slack, SMS)

## Threat Model

### Attack Surfaces
1. **API Gateway**: Exposed to internet; requires authentication
2. **Sensor Connections**: IoT devices with varying security levels
3. **Dashboard**: Web interface with role-based access control
4. **Database**: MongoDB with encrypted connections
5. **Cache Layer**: Redis with authentication enabled

### Mitigations
- All API endpoints require JWT authentication
- Sensor connections use mTLS where supported
- Input validation on all ingestion endpoints
- Rate limiting at gateway and per-sensor level
- Audit logging for all administrative actions

## Data Flow

### Sensor Telemetry Pipeline

1. **Ingestion**: Sensor sends telemetry via POST `/api/v2/sensors/{id}/telemetry`
2. **Validation**: Payload structure validated by `validator.validate_sensor_payload()`
3. **Normalization**: Raw readings converted to standard units
4. **Detection**: Each reading passes through configured detectors:
   - ThresholdDetector checks against configured bounds
   - StatisticalDetector computes z-score against sliding window
5. **Classification**: Detected anomalies scored by severity
6. **Alerting**: Alert routed through rules engine to configured channels
7. **Storage**: All telemetry and events persisted to MongoDB

### Alert Lifecycle

```
Triggered → Active → Acknowledged → Resolved
                  └→ Escalated (if not acknowledged within SLA)
```

## Deployment Architecture

### Production Stack
- **Runtime**: Node.js 20 LTS + Python 3.11 (ML services)
- **Database**: MongoDB Atlas (M10 cluster)
- **Cache**: Redis 7.x (Render managed)
- **Hosting**: Render Web Service (auto-scaling)
- **CDN**: Cloudflare (static assets)
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions

### Environment Separation
| Component     | Development      | Staging           | Production       |
|---------------|------------------|-------------------|------------------|
| Database      | Local MongoDB    | Atlas M0 (free)   | Atlas M10        |
| Cache         | Local Redis      | Render Redis      | Render Redis HA  |
| Log Level     | DEBUG            | INFO              | WARNING          |
| Rate Limit    | Disabled         | 1000 req/min      | 100 req/min      |
| Auth          | Mock JWT         | Real JWT          | Real JWT + MFA   |

## Security Controls

### Authentication & Authorization
- JWT-based authentication with configurable expiry
- Role-based access control (RBAC): admin, operator, viewer
- API key authentication for machine-to-machine communication
- Session tokens with secure generation and rotation

### Input Validation
- All API inputs validated through the validator module
- Sensor payloads checked for structure, types, and bounds
- String sanitization removes control characters and null bytes
- Request body size limits enforced at gateway level

### Audit & Compliance
- All security-relevant actions logged to immutable audit trail
- Failed login attempts tracked for brute-force detection
- Configuration changes require admin role and are logged
- Data export events tracked for compliance reporting

### Network Security
- TLS 1.3 for all external connections
- mTLS support for sensor connections
- Rate limiting at API gateway (token bucket algorithm)
- Circuit breaker pattern for external service calls
- CORS configured per environment

## Monitoring Stack

### Metrics (Prometheus)
- `sentinel_telemetry_total` — Total telemetry points processed
- `sentinel_anomalies_total{severity}` — Anomalies by severity
- `sentinel_active_sensors` — Current active sensor count
- `sentinel_alert_latency_seconds` — Alert delivery latency
- `sentinel_api_request_duration_seconds` — API response times

### Alerting (Grafana)
- Sensor offline > 5 minutes
- Anomaly rate > 10/minute
- API error rate > 5%
- Database connection pool exhaustion
- Memory usage > 85%

### Logging (Structured JSON)
- Correlation IDs for request tracing
- Rotating file handlers with size and time-based policies
- Log levels configurable per module
- Exception stack traces captured in structured format
