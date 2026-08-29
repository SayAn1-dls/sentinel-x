# 🛡️ Sentinel-X

[![Build Status](https://img.shields.io/github/actions/workflow/status/SayAn1-dls/sentinel-x/ci.yml?branch=main)](https://github.com/SayAn1-dls/sentinel-x/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0--alpha-orange)](CHANGELOG.md)
[![Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)](test_reports/)

**Real-time security surveillance and threat detection platform** with anomaly detection, automated alerting, and forensic analysis capabilities.

## 🏗️ Architecture

```
Sensors → Ingestion Gateway → Detection Engine → Threat Classifier → Alert Router
                                    ↓                                      ↓
                              Anomaly Events                    Email / Webhook / Slack
                                    ↓
                              Audit Trail → Dashboard
```

## ✨ Features

- **Multi-sensor Telemetry** — Ingest data from cameras, motion sensors, temperature probes, and custom IoT devices
- **Anomaly Detection Pipeline** — Threshold, statistical (Z-score), and rate-of-change detectors running in parallel
- **Smart Alert Routing** — Priority-based routing with deduplication, cooldowns, and escalation workflows
- **Forensic Analysis** — Quantum-ready forensic modules for deep incident investigation
- **Real-time Dashboard** — Live monitoring with WebSocket-driven updates
- **Audit Trail** — Complete compliance logging of all security-relevant actions
- **Health Monitoring** — Built-in readiness probes and Prometheus metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- Python 3.11+
- MongoDB 7.x
- Redis 7.x

### Installation

```bash
git clone https://github.com/SayAn1-dls/sentinel-x.git
cd sentinel-x
npm install
cp .env.example .env  # Configure your environment
```

### Running

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

### Running Tests

```bash
# All tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=src --cov-report=html
```

## 📚 Documentation

- [System Architecture](docs/architecture.md) — Component design, threat model, deployment topology
- [API Reference](docs/api-reference.md) — Complete endpoint documentation with examples
- [Contributing Guide](CONTRIBUTING.md) — How to contribute to Sentinel-X
- [Changelog](CHANGELOG.md) — Release history and notable changes
- [Security Policy](SECURITY.md) — Responsible disclosure and security practices

## 🔧 Project Structure

```
sentinel-x/
├── src/
│   ├── config/          # Configuration management
│   │   └── settings.py  # Environment-based config
│   ├── modules/         # Core business logic
│   │   ├── detection.py # Anomaly detection engine
│   │   ├── alert.py     # Alert routing system
│   │   ├── audit.py     # Audit trail logging
│   │   ├── health.py    # Health monitoring
│   │   ├── metrics.py   # Prometheus metrics
│   │   └── event_bus.py # Internal pub/sub
│   └── utils/           # Shared utilities
│       ├── logger.py    # Structured logging
│       ├── validator.py # Input validation
│       ├── crypto.py    # Cryptographic helpers
│       └── retry.py     # Retry & circuit breaker
├── tests/               # Test suites
├── docs/                # Documentation
├── backend/             # Backend API server
└── frontend/            # Dashboard UI
```

## 📄 License

This project is licensed under the MIT License.
