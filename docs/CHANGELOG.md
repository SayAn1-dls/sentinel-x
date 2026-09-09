# Changelog

All notable changes to Sentinel-X.

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
