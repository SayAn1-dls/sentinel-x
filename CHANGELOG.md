# Changelog

All notable changes to Sentinel-X will be documented in this file.

## [2.0.0-alpha] - 2026-08-29

### Added
- Structured logging module with JSON formatting and rotation support
- Input validation for emails, IPs, sensor payloads, and alert configs
- Threshold-based and statistical anomaly detection engines
- Rate-of-change detector for sudden sensor value spikes
- Detection pipeline orchestrator for parallel detector execution
- Alert management system with priority-based routing
- Alert deduplication with fingerprint-based suppression
- Email and webhook notification handlers with HMAC signing
- Event correlation engine for compound threat detection
- Internal publish/subscribe event bus for decoupled communication
- Health check module with readiness/liveness probes
- Prometheus-compatible metrics collection (Counter, Gauge)
- Task scheduler for periodic operations
- Token bucket rate limiter for API protection
- Circuit breaker pattern for external service resilience
- Cryptographic utilities (password hashing, HMAC, API key generation)
- Date/time utilities with IST timezone support
- Cursor-based and offset-based pagination
- Standardized API response formatting
- Sensor registry with lifecycle management
- Audit trail logging for compliance tracking
- Comprehensive API reference documentation
- System architecture document with threat model
- Unit tests for all new modules (87%+ coverage target)

### Changed
- Overhauled README with badges, architecture diagram, and project structure
- Updated project structure to support Python modules alongside TypeScript

### Security
- PBKDF2-SHA256 password hashing with 260k iterations
- HMAC-SHA256 webhook payload signing
- Secure API key and session token generation
- Input sanitization with control character removal

## [1.0.0] - 2026-08-24

### Added
- Initial release with forensic analysis modules
- Frontend dashboard
- Backend API server
- MongoDB integration
- Render deployment configuration
