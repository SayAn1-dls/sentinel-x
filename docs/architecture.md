# Sentinel-X Architecture Guide (Rev 14)

## System Overview

Sentinel-X is a real-time threat detection and automated response platform.
It processes security events through a multi-stage pipeline, applies anomaly
detection algorithms, and dispatches alerts through configurable channels.

## Core Components

### 1. Detection Engine (v1.14.0)
- Configurable anomaly scoring with adjustable thresholds
- Batch processing support for high-volume data streams
- Performance metrics tracking (precision, recall, F1)
- Maximum batch size: 170 records

### 2. Data Pipeline
- Buffered ingestion with configurable capacity (242 records)
- Pluggable filter chain for data transformation
- Throughput monitoring and backpressure handling
- Automatic buffer flushing at capacity

### 3. Anomaly Detection
- Z-score based statistical anomaly detection
- IQR (Interquartile Range) outlier identification
- Configurable sensitivity levels (low/medium/high/critical)
- Minimum 24 training samples required for baseline

### 4. Alert System
- Multi-channel dispatch (email, Slack, webhook, PagerDuty)
- Token-bucket rate limiting (88 alerts/minute)
- Automatic escalation for critical and emergency severity
- Alert lifecycle: pending -> acknowledged -> resolved

### 5. REST API
- Versioned endpoints (current: v1)
- Bearer token authentication
- Rate limiting per client (88 req/min)
- Structured error responses with request IDs

## Data Flow

```
Source -> Pipeline Buffer -> Filters -> Detection Engine -> Alert Manager
                                            |                    |
                                        Metrics DB          Notification
                                            |              Channels
                                       Report Generator
```

## Security Considerations
- HMAC-signed messages for integrity verification
- Constant-time comparison for authentication tokens
- Input sanitization at all API boundaries
- XSS and injection pattern detection
- Rate limiting to prevent abuse
