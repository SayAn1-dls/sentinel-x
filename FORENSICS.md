# Sentinel-X Forensic Intelligence Protocol

This document outlines the forensic analysis models and kernel-level integrity checks implemented in the Sentinel-X system.

## Forensic Data Models

### IP Geolocation Correlation
We correlate transaction origins with known IP reputation databases and perform distance-time calculations to detect 'Impossible Travel'.

### Behavioral Biometric Signatures
Signatures are generated based on mouse entropy, keystroke cadence, and cognitive load indices.

### Temporal Anomaly Detection
Detects transactions occurring outside of established business hours or historical usage patterns.
- **Signal**: Local hour analysis against expected range.
- **Risk Impact**: Medium (adds weight to risk score if detected).

## Risk Scoring Engine
The risk scoring engine incorporates:
- **Velocity Metrics**: Z-score analysis of transaction frequency.
- **Fingerprint Entropy**: Measuring the uniqueness of the device signature.
- **Kernel Integrity**: Attestation of memory pages and secure boot state.

## Implementation Status
- [x] IP Geolocation Data Models
- [x] Impossible Travel Detection Logic
- [x] Advanced Risk Scoring Improvements
- [x] Mock Data Enrichment
- [x] Temporal Anomaly Detection

### Device Fingerprint Entropy Analysis (Added 2026-07-28)
Calculates Shannon Entropy across multiple device attributes (Canvas, WebGL, Hardware) to identify highly unique or synthetic device profiles.

### Transaction Velocity Analysis (Added 2026-07-28)
Implements Z-Score based deviation analysis to detect rapid laundering patterns or bot-driven transaction bursts within sliding time windows.

### Behavioral Biometric Verification (Added 2026-07-28)
Enhanced logic to differentiate between human jitter and bot-generated event sequences using trajectory entropy models.

## Updated Implementation Status
- [x] IP Geolocation Data Models
- [x] Impossible Travel Detection Logic
- [x] Advanced Risk Scoring Improvements
- [x] Mock Data Enrichment
- [x] Temporal Anomaly Detection
- [x] Device Fingerprint Entropy Models (New)
- [x] Transaction Velocity Z-Score Analysis (New)
- [x] Behavioral Biometric Bot Detection (New)

## Update: 2026-07-29 - Advanced Forensic Signal Expansion

### Session Replay Detection
Introduced heuristic-based detection of session replay tools. The engine now analyzes event stream variance to identify robotic or pre-recorded mouse movements.
- **Signal**: `sessionReplay`
- **Metric**: `replayLikelihood` (0.0 to 1.0)
- **Detection**: Flags variance < 5ms as high-confidence replay.

### ASN Reputation Analysis
The risk scoring engine now incorporates ASN (Autonomous System Number) reputation data.
- **Signal**: `asnReputation`
- **Scoring**: Differentiates between Tier 1 ISPs and high-risk hosting/proxy providers.
- **Abuse Score**: Integrated into the `calculateAdvancedRiskScore` v2.

### Risk Engine v2
Updated the `calculateAdvancedRiskScore` function to include new weightings for session replay and ASN abuse scores, providing a more comprehensive security posture.

## Update: 2026-07-30 - Kernel-Level & Network Proximity Analysis (v3)

### Kernel Forensic Attestation
Implemented mock kernel integrity verification to detect virtualized environments, debuggers, and system call hooks.
- **Signal**: `kernelForensics`
- **Check**: Detects `0xDEAD` memory page hashes and identifies OS build integrity.
- **Risk Impact**: High (Critical weighting for syscall hooking).

### Peer-to-Peer Network Proximity
Added analysis for peer network positioning and exit node detection.
- **Signal**: `peerAnalysis`
- **Metric**: `proximityScore` and `peerCount` correlation.
- **Detection**: Flags nodes identified as high-risk exit points in P2P networks.

### Risk Engine v3
Upgraded the `calculateAdvancedRiskScore` function to integrate kernel-level signals and network proximity metrics.
- **Version**: 3.0.0
- **Weighting**: Syscall hooking (+45), Exit nodes (+30), VM detection (+15).

### Functional Restoration & Logic Enrichment
Fixed critical compilation issues in the mock data pipeline by implementing missing `analyzeBehavioralBiometrics` and `analyzeTransactionVelocity` utility functions.

## Secure Enclave & Hardware Security Module (HSM) Analysis (Added 2026-07-31)
The Sentinel-X engine now includes kernel-level verification for Secure Enclaves (Apple SEP, Intel SGX, ARM TrustZone). 
- **Attestation Token Verification**: Checks for valid hardware attestation tokens.
- **Memory Encryption Detection**: Analyzes if TME (Total Memory Encryption) or similar technologies are active.
- **Tamper Resistance Scoring**: Evaluates the physical and logical tamper-resistance of the underlying hardware.
- **Risk Scoring Integration**: Transactions originating from devices without active enclaves or failed attestation are automatically flagged for higher risk.

## Browser Integrity & Automation Detection (Added 2026-08-01)
The Sentinel-X engine now incorporates advanced browser environment integrity checks to detect headless browsers and automation frameworks (Puppeteer, Selenium, Playwright).

- **Automation Detection Signal**: `browserIntegrity`
- **Webdriver Verification**: Detects the presence of `navigator.webdriver` even when obfuscated.
- **Chrome Object Validation**: Checks for missing or inconsistent `window.chrome` properties common in headless environments.
- **Automation Scoring**: Aggregates environmental inconsistencies into a confidence score (0.0 to 1.0).
- **Risk Scoring Integration (v5)**: Automated environments now trigger a significant risk weight (+70 for explicit detection).

### Risk Engine v5
Upgraded the `calculateAdvancedRiskScore` function to integrate Browser Integrity signals.
- **Version**: 5.0.0
- **Weighting**: Automation Detection (+70), Webdriver Presence (+40), Automation Score (+30).
