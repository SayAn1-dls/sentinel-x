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
