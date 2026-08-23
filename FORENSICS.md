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

## AI Agent & Smart Contract Forensic Profiling (Added 2026-08-02)
The Sentinel-X engine now includes advanced detection for AI-agentic behavior and deep-analysis of smart contract interaction history.

### AI Agent Interaction Analysis
Detects LLM-driven interactions by analyzing syntactic entropy, reasoning chain artifacts, and response timing.
- **Signal**: `aiAgentDetection`
- **Metric**: `promptInjectionRisk` and `reasoningChainDetected`.
- **Detection**: Flags inputs containing reasoning markers ("step-by-step", "consequently") or suspiciously fast interaction patterns.

### Smart Contract Forensic Profiling
Analyzes the historical footprint of a wallet's interactions with DeFi protocols and known malicious contracts.
- **Signal**: `smartContractForensics`
- **Checks**: 
  - **Mixer Usage**: Detection of interactions with privacy mixers (e.g., Tornado Cash).
  - **Drainer Contact**: High-risk flag for interactions with known wallet drainers.
  - **Unverified Contracts**: Calculates the ratio of unverified vs. verified smart contract interactions.

### Risk Engine v6
Upgraded the `calculateAdvancedRiskScore` function to integrate AI and Smart Contract signals.
- **Version**: 6.0.0
- **Weighting**: Known Drainer Contact (+100 - Critical), Prompt Injection Risk (+80), AI Agent Detection (+55), Mixer Usage (+65).

## Dark Web Intelligence & Deep Packet Inspection (DPI) (Added 2026-08-03)
The Sentinel-X engine now incorporates Dark Web exposure intelligence and network-level Deep Packet Inspection (DPI) artifacts for enhanced forensic profiling.

### Dark Web Intelligence Exposure
Cross-references identity markers (emails, hashes) against known data breaches and dark web leak repositories.
- **Signal**: `darkWebExposure`
- **Checks**: 
  - **Breach Count**: Total number of unique breaches the identity has been found in.
  - **Risk Rating**: Categorized risk level (Critical to Low) based on the severity and freshness of the exposure.
- **Risk Scoring Integration**: Identities with Critical dark web exposure trigger significant risk weightings (+60).

### Deep Packet Inspection (DPI) Forensic Analysis
Analyzes network-layer artifacts to detect MITM (Man-in-the-Middle) attacks and network scanning activity.
- **Signal**: `networkPacketAnalysis`
- **Metrics**:
  - **TCP Window Size Fingerprinting**: Identifies operating system spoofing or non-standard network stacks.
  - **TTL (Time To Live) Analysis**: Detects unusual routing paths or potential proxying.
  - **Jitter Analysis**: Evaluates packet inter-arrival time jitter to detect network-level anomalies.
- **Detection**: Flags suspected Nmap scans and MITM attempts.

### Risk Engine v7
Upgraded the `calculateAdvancedRiskScore` function to integrate Dark Web and DPI forensic signals.
- **Version**: 7.0.0
- **Weighting**: MITM Likelihood (+90 - Critical), Dark Web Critical Exposure (+60), Nmap Scan Detection (+40).

## Update: 2026-08-04 - Cloud Infrastructure & DNS Integrity Analysis (v8)

The Sentinel-X engine now includes cloud infrastructure correlation and DNS resolution integrity checks to detect advanced proxying and hijacking attempts.

### Cloud Infrastructure Forensic Correlation
Detects if a transaction originates from a major cloud provider (AWS, GCP, Azure, etc.) and evaluates the associated data center risk.
- **Signal**: `cloudInfrastructure`
- **Metric**: `datacenterRiskScore` (0.0 to 1.0).
- **Detection**: Cross-references IP ranges against known cloud provider lists. High-risk for treasury operations if originating from a non-business data center.

### DNS Integrity Analysis
Analyzes the DNS resolution path and latency to identify potential DNS spoofing or hijacking.
- **Signal**: `dnsIntegrity`
- **Checks**:
  - **Public Resolver Detection**: Checks if common public resolvers (8.8.8.8, 1.1.1.1) are being used or bypassed.
  - **Hijack Likelihood**: Heuristic analysis based on resolution consistency and network latency.
- **Risk Impact**: Critical (+100) if hijacking is likely.

### Risk Engine v8
Upgraded the `calculateAdvancedRiskScore` function to integrate Cloud and DNS forensic signals.
- **Version**: 8.0.0
- **Weighting**: DNS Hijacking (+100 - Critical), Cloud Data Center Correlation (up to +40).

## Update: 2026-08-06 - Steganographic Forensic Discovery & Data Leak Prevention (v10)

### Steganographic Forensic Analysis
Implemented detection for steganographic data exfiltration where sensitive information is hidden within innocuous carriers like images or audio files.
- **Signal**: `steganography`
- **Checks**:
  - **Carrier Integrity**: Analyzes LSB (Least Significant Bit) variance in image/audio headers.
  - **Encryption Detection**: Identifies high-entropy blocks within carrier files indicating encrypted payloads.
  - **Tool Signature**: Matches known steganography tool artifacts (e.g., LsbSteg, OutGuess).
- **Risk Impact**: High (`leakLikelihood` weighting).

### Risk Engine v10
Upgraded the `calculateAdvancedRiskScore` function to integrate steganographic forensic signals.
- **Version**: 10.0.0
- **Weighting**: Steganographic Detection (up to +85), Encrypted Payload (+20).

## Update: 2026-08-07 - Cross-Chain Identity Linking & Bridge Forensic Analysis (v11)

### Cross-Chain Forensic Linking
Implemented deep analysis of cross-chain transaction paths to identify linked identities across multiple networks.
- **Signal**: `crossChainForensics`
- **Metrics**:
  - **Hop Count**: Detects complex multi-hop bridging patterns often used in laundering.
  - **Bridge Velocity**: Analyzes the speed of capital movement across chains.
  - **Mixer Association**: Heuristic detection of privacy mixer interaction in the transaction chain.
- **Risk Impact**: High (+75) for mixer association, Medium (+30) for high-hop counts.

### Risk Engine v11
Upgraded the `calculateAdvancedRiskScore` function to integrate cross-chain forensic signals.
- **Version**: 11.0.0
- **Weighting**: Mixer Association (+75), Cross-Chain Velocity (up to +40), High Hop Count (+30).

## Update: 2026-08-09 - Zero-Knowledge Proof (ZKP) Integrity & Circuit Forensics (v12)

### ZKP Forensic Analysis
Implemented analysis for Zero-Knowledge Proof (ZKP) integrity and circuit-level forensics. This is critical for verifying the soundness of proofs used in privacy-preserving and scaling protocols.
- **Signal**: `zkpForensics`
- **Metrics**:
  - **Proof Type**: Identifies the proving system used (Groth16, Plonk, STARK, etc.).
  - **Trusted Setup Integrity**: Evaluates the risk associated with proofs requiring a trusted setup (e.g., Groth16 soundness risks).
  - **Verification Latency**: Monitors for unusual proving/verification times that might indicate side-channel attacks or proof forgery attempts.
- **Risk Impact**: High (+45) for soundness risks, Critical (+100) for invalid proofs.

### Risk Engine v12
Upgraded the `calculateAdvancedRiskScore` function to integrate ZKP forensic signals.
- **Version**: 12.0.0
- **Weighting**: Invalid ZK Proof (+100 - Critical), Soundness Risk Detected (+45), Verification Latency Anomaly (+20).

## Update: 2026-08-11 - USB HID Forensic Analysis & Hardware Keylogger Detection (v14)

### Hardware-Level HID Forensics
Implemented analysis of USB Human Interface Device (HID) descriptors and event timing to detect hardware-level keyloggers and suspicious peripherals.
- **Signal**: `hidForensics`
- **Checks**:
  - **HID Report Descriptor Integrity**: Verifies the structure of HID reports against known valid patterns.
  - **Keystroke Timing Anomaly**: Detects robotic or fixed-interval keystroke injection common in hardware keyloggers.
  - **Vendor ID (VID) Reputation**: Cross-references device vendor IDs against a whitelist of trusted manufacturers.
- **Risk Impact**: High (+80) for descriptor tampering, Medium (+40) for timing anomalies.

### Risk Engine v14
Upgraded the `calculateAdvancedRiskScore` function to integrate HID forensic signals.
- **Version**: 14.0.0
- **Weighting**: HID Descriptor Tampering (+80), Suspicious HID Device Detected (+65), Keystroke Timing Anomaly (+40).

## Update: 2026-08-14 - Optical Air-Gap Forensics & ZKP Integrity Restoration (v15)

### Optical Air-Gap Forensic Analysis
Implemented detection for visual exfiltration channels, specifically targeting screen-to-camera data leaks and rapid QR-code flashing.
- **Signal**: `opticalAirGapForensics`
- **Checks**:
  - **High-Frequency Flicker Detection**: Identifies subtle screen flickering used to transmit data to external sensors.
  - **QR Rapid Exfiltration**: Monitors for rapid sequences of QR codes or visual markers designed for high-bandwidth air-gap bypass.
  - **Visual Steganography**: Analyzes screen output for hidden visual artifacts.
- **Risk Impact**: Critical (+100) for rapid QR exfiltration, High (+85) for flicker detection.

### ZKP Forensic Restoration
Restored the Zero-Knowledge Proof (ZKP) integrity verification engine to the core forensic pipeline.
- **Signal**: `zkpForensics`
- **Weighting**: Invalid ZK Proof (+100), Soundness Risk (+45).

### Risk Engine v15
Upgraded the `calculateAdvancedRiskScore` function to integrate Optical Air-Gap signals and fully reconcile the ZKP and HID forensic weightings.
- **Version**: 15.0.0
- **New Weighting**: QR Rapid Exfiltration (+100 - Critical), High-Frequency Flicker (+85), Invalid ZK Proof (+100).

## Update: 2026-08-15 - Quantum-Resistant Forensic Signatures & Cryptographic Robustness (v16)

### Quantum-Resistant Forensic Analysis
Implemented analysis of cryptographic signatures against quantum computing threats, specifically focusing on Shor's and Grover's algorithms.
- **Signal**: `quantumForensics`
- **Checks**:
  - **Algorithm Type**: Identifies if the signature uses post-quantum algorithms (Dilithium, Falcon, SPHINCS+) or traditional ECDSA/Ed25519.
  - **Shor's Vulnerability**: Calculates the theoretical vulnerability to Shor's algorithm based on the underlying mathematical problem (Integer Factorization vs. Lattice-based).
  - **Grover Resistance**: Evaluates the effective security bits against Grover's search algorithm.
- **Risk Impact**: Medium (+30) for high Shor's vulnerability, Low (+15) for Grover vulnerability.

### Risk Engine v16
Upgraded the `calculateAdvancedRiskScore` function to integrate quantum forensic signals and prioritize post-quantum cryptographic transitions.
- **Version**: 16.0.0
- **Weighting**: Non-Quantum-Resistant Algorithm (+25), High Shor's Vulnerability (+30), Grover Attack Risk (+15).

## Update: 2026-08-16 - RAM Scraping & Memory Dump Detection (v17)

### RAM Scraping & Memory Forensics
Implemented kernel-level detection for RAM scraping, DMA (Direct Memory Access) attacks, and cold boot vulnerabilities. This ensures the integrity of sensitive data in volatile memory.
- **Signal**: `memoryForensics`
- **Checks**:
  - **RAM Scraping Detection**: Identifies pattern-based memory scanning targeting sensitive cryptographic keys.
  - **DMA Attack Vector**: Monitors for unauthorized hardware-level access to system memory.
  - **Paging Integrity**: Verifies that virtual memory paging structures have not been tampered with.
- **Risk Impact**: Critical (+95) for RAM scraping detection, High (+80) for DMA attacks.

### Risk Engine v17
Upgraded the `calculateAdvancedRiskScore` function to integrate Memory Forensic signals.
- **Version**: 17.0.0
- **Weighting**: RAM Scraping Detected (+95 - Critical), DMA Attack Vector Found (+80 - High), Paging Integrity Violation (+70).

## Update: 2026-08-17 - TLS Handshake Fingerprinting (JA3/JA3S) (v18)

### TLS Handshake Forensic Analysis
Implemented JA3 and JA3S fingerprinting to identify clients and servers based on their TLS handshake parameters. This allows for precise identification of automated bots, scripts, and non-standard clients that may be impersonating legitimate browsers.
- **Signal**: `tlsFingerprint`
- **Metrics**:
  - **JA3 Hash**: Client-side fingerprint based on SSL Version, Cipher Suites, Extensions, Elliptic Curves, and Point Formats.
  - **JA3S Hash**: Server-side response fingerprint.
  - **Common Browser Verification**: Compares the JA3 hash against a database of known legitimate browser fingerprints (Chrome, Firefox, Safari).
- **Detection**: Flags fingerprints associated with known malicious bots, CLI tools (curl, wget), and headless browsers.
- **Risk Impact**: Medium (+45) for suspicious JA3 matches, Medium (+30) for known bot fingerprints.

### Risk Engine v18
Upgraded the `calculateAdvancedRiskScore` function to integrate TLS Fingerprinting signals.
- **Version**: 18.0.0
- **Weighting**: Suspicious TLS Match (+45), Known Bot Fingerprint (+30).

## Update: 2026-08-18 - Supply Chain Integrity Forensics (v19)

Implemented deep analysis of the software supply chain to detect compromised dependencies and build-time tampering. This is critical for defending against highly sophisticated upstream attacks.

### Supply Chain Integrity Forensic Analysis
Analyzes the integrity of the application's dependency graph and build environment.
- **Signal**: `supplyChainForensics`
- **Checks**:
  - **Dependency Hash Verification**: Cross-references local dependency hashes against known-good hashes from official package registries.
  - **SLSA Compliance**: Evaluates the Build Provenance against SLSA (Supply-chain Levels for Software Artifacts) standards.
  - **Registry Reputation**: Identifies if packages are sourced from untrusted or high-risk third-party registries.
  - **Signature Attestation**: Verifies cryptographic signatures of critical library updates.
- **Risk Impact**: Critical (+100) for malicious package signatures, High (+85) for hash mismatches.

### Risk Engine v19
Upgraded the `calculateAdvancedRiskScore` function to integrate Supply Chain forensic signals.
- **Version**: 19.0.0
- **Weighting**: Malicious Package Signature (+100 - Critical), Dependency Hash Mismatch (+85 - High), Untrusted Registry (+60).

### BGP Route Leak Detection (v19)
- **Model**: `BGPRouteLeakSignal`
- **Logic**: Analyzes AS paths to detect potential traffic hijacking or route leaks.
- **Risk Impact**: Critical (up to +90 risk score).

### Behavioral Biometric Signatures (v20)
- **Model**: `BehavioralBiometricForensics`
- **Logic**: Analyzes keystroke dynamics entropy and mouse trajectory jitter to distinguish between human users and automated bots.
- **Risk Impact**: High (+55 for bot signature detection).

### Device Fingerprint Entropy (v20)
- **Model**: `DeviceFingerprintForensics`
- **Logic**: Calculates Shannon entropy across browser/hardware attributes and detects Virtual Machine environments via hardware forensic correlation.
- **Risk Impact**: Medium (+25 for VM detection, +45 for OS kernel mismatch).

## Update: 2026-08-23 - Peripheral Bus & DMA Forensics (v21)

### Peripheral Bus Forensic Analysis
Implemented analysis of high-speed peripheral buses (Thunderbolt, PCIe) to detect and mitigate Direct Memory Access (DMA) attacks. This ensures the integrity of system memory against hardware-level threats that bypass the CPU and OS security controls.

- **Signal**: `peripheralBus`
- **Checks**:
  - **DMA Attack Detection**: Identifies unauthorized attempts by external devices to read or write directly to system RAM.
  - **Untrusted PCIe Device Discovery**: Scans for non-whitelisted or suspicious peripheral devices connected to the PCIe bus.
  - **IOMMU Verification**: Ensures the Input-Output Memory Management Unit is active and properly configured to isolate device memory access.
  - **Thunderbolt Security Level**: Evaluates the authentication requirements for Thunderbolt peripherals (None, User, Secure).
- **Risk Impact**: Critical (+98) for active DMA attack detection, High (+60) for untrusted PCIe devices.

### Risk Engine v21
Upgraded the `calculateAdvancedRiskScore` function to integrate Peripheral Bus forensic signals.
- **Version**: 21.0.0
- **Weighting**: DMA Attack Detected (+98 - Critical), Untrusted PCIe Device Found (+60 - High), Disabled IOMMU (+35), No Thunderbolt Security (+40).
