# Sentinel-X Architecture (Rev 2)

## Overview
Sentinel-X is a real-time threat detection and response platform designed for
scalability, reliability, and extensibility.

## Components
1. **Detection Engine** - Core analysis engine with configurable thresholds
2. **Data Pipeline** - High-throughput data ingestion and processing
3. **Alert System** - Multi-channel notification with throttling
4. **REST API** - External interface for integrations
5. **Reporting** - Automated report generation

## Data Flow
```
Ingestion -> Pipeline -> Detection Engine -> Alert Manager -> Channels
                              |
                          Reporting
```

## Design Principles (v2)
- Separation of concerns across modules
- Configurable detection sensitivity
- Rate-limited alerting to prevent fatigue
- Structured logging for observability
- Input validation at all boundaries
- Batch processing 120 records per cycle

## Security Model
- All inputs sanitized before processing
- HMAC-based message authentication
- Constant-time comparison for tokens
- Rate limiting on API endpoints (110 req/min)
