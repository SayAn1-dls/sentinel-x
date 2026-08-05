# SENTINEL-X FORENSIC GUARD — CHANGELOG

## [4.0.0] — FORENSIC GUARD RELEASE

### Added
- **Forensic Dashboard** — Real-time transaction HUD with live threat feed and blocking controls
- **AI Analysis Engine** — Neural scanner for smurfing, layering, and round-tripping detection
- **Deep-Trace Audit Log** — Immutable event ledger with CSV/JSON export and session tracking
- **Network Security Monitor** — TLS 1.3 gateway health, latency monitoring, PacketMonitor
- **Silicon UI System** — 60px backdrop-blur frosted glass HUD components throughout
- **ThreatMatrix** — Real-time severity distribution heatmap
- **RiskMeter** — Radial gauge for risk score visualization
- **AnomalyChart** — 24-hour hourly transaction anomaly detection bar chart
- **PatternDetector** — Known AML signature matching panel
- **SystemHealth** — Infrastructure health bar for all forensic modules
- **RiskHeatmap** — Entity-level risk distribution grid
- **ActivityTimeline** — Chronological forensic event trace

### Architecture
- `ForensicEngine` — Rule-based transaction analysis with velocity and layering detection
- `AIScanner` — SX-FORENSIC-AI-V4.0 pattern detection model
- `AuditTrace` — Persistent audit logging with localStorage fallback
- `ThreatAnalyzer` — Global threat index computation
- `NetworkSecurityMonitor` — Gateway health and encryption verification
- Full REST API routes: `/api/transactions`, `/api/audit`, `/api/scan`, `/api/network`, `/api/alerts`
- Complete test suite covering all core engines

### Design System
- Pitch Black (`#050505`) base
- Neon Orange (`#FF6B00`) primary accent
- Danger Red (`#FF0033`) critical alerts
- Cyber Cyan (`#00CFFF`) data highlights
- Safe Green (`#00FF88`) success states
- Silicon Transparency — `backdrop-filter: blur(60px)` on all panels

---

*SENTINEL-X is an institutional-grade forensic platform — CLASSIFIED*
