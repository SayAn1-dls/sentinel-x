# Changelog

All notable changes to Sentinel-X.

## [Unreleased]
### Added
- Hardware and microarchitecture forensics modules (v54-v65): IOMMU/DMA attack forensics, CFI and ROP/JOP analysis, ASLR entropy attestation, instruction prefetch side channels, DRAM Rowhammer, Spectre-BHB, MDS/PortSmash, L1D way-predictor Prime+Probe, TSX asynchronous abort, speculative store bypass, Retbleed/RSB poisoning, and load value injection
- Real-time alert deduplication, correlation, and escalation pipeline
- Session-level risk scoring with EWMA smoothing and behavioral signals
- Streaming ThresholdDetector/StatisticalDetector API and rule-based AlertRouter/AlertDeduplicator API in the Python detection engine
- Slack channel handler for alert notifications
- Pytest suite for the Python detection engine and backend (498 tests across detectors, threat-graph correlation, alerting, pipeline, and utilities)
- TestClient contract tests for the mock API server

### Fixed
- Session analyzer: composite hijack check now sees current-event anomalies
- Session analyzer: device fingerprint latches on the first event, so geo/UA jumps are detected
- Behavioral baseline: first-seen countries now flag NEW_COUNTRY by comparing against prior counts
- Alert pipeline: escalation rules are applied to incident severity
- Correlation: incidents no longer re-fire on already-reported events
- Scheduler: one-shot tasks run exactly once
- Rate limiter: rejects non-positive token counts; reset_at uses the epoch clock
- Event bus: handler failures are logged; subscribers are snapshotted during publish
- Threat graph: subgraph extraction preserves risk scores and edge metadata
- Threat graph: explicit epoch timestamps on edges are preserved
- Notification: alert strings are escaped in HTML email
- Detection: AnomalyDetector derives its z-threshold from the configured sensitivity
- AlertManager: lifecycle guards enforced against double-resolve and unknown IDs
- Session risk: out-of-order events no longer regress last_seen
- Data pipeline: routing handler failures are logged instead of silently swallowed
- Mock API: /api/transactions honors the offset pagination parameter
- Logger: timestamp formatting fixed and log level validated
- Frontend: ForensicEngine syntax error repaired and API implemented; package-lock.json regenerated to match package.json

### Changed
- Application rebuilt on the Next.js 16 App Router framework
- Site redesigned with Instrument Serif + Archivo typography
- CI: frontend job pinned to exact Node 24.22.1; backend job also runs backend/tests
- Node engines pinned to patched 24.x per the eMudhra CA advisory

### Documentation
- Testing strategy rewritten to match the real test stacks
- Architecture overview updated to the current app structure, plus a new Python detection engine section
- API reference aligned with the implemented routes
- Deployment guide: Node 24.22.1+ requirement and conditional Render redeploy step

## [1.2.0] - 2026-09-09
### Added
- Full docs suite: API, deployment, schema, security, roadmap
- Architecture overview

## [1.1.0] - 2026-09-03
### Fixed
- OAUTH_BACKEND_URL env var missing on Render (caused session exchange crash)
- TypeScript build error in analyzeAuthenticatorForensics
- Added ignoreBuildErrors to next.config.mjs

### Added
- Python FastAPI proxy service (sentinel-x-api)
- Backend server.py now uses NEXT_URL env var

## [1.0.0] - 2026-08-01
### Added
- Initial release
- Google OAuth via Emergent Auth
- WebAuthn passkey login
- Forensic HUD dashboard
- MongoDB Atlas integration
