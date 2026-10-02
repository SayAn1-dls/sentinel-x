
## Update: 2026-10-02 - L3 Cache Side-Channel Forensics (v50)

### L3 Cache Side-Channel Forensic Intelligence
Implemented a forensic layer designed to detect L3 cache side-channel attacks. This module identifies sophisticated cache-based exfiltration techniques like Prime+Probe and Flush+Reload that exploit shared cache resources to leak cryptographic keys or other sensitive data.

- **Signal**: `l3CacheForensics`
- **Checks**:
  - **Prime+Probe Detection**: Identifies eviction set patterns indicative of cache monitoring.
  - **Flush+Reload Artifacts**: Detects rapid cache line flushing and reloading timing anomalies.
  - **Occupancy Anomaly**: Monitors for unexpected cache occupancy shifts across security boundaries.
- **Risk Impact**: Critical (+95) for Prime+Probe, High (+90) for Flush+Reload, Medium (+65) for Way Locking anomalies.

### Risk Engine v50
Integrated L3 Cache Forensics into the core scoring engine and Python `threat_scorer.py` module.
- **Version**: 50.0.0
- **New Weights**: l3_cache_forensics (1.6).


## Update: 2026-10-01 - Micro-architectural Port Contention Forensics (v49)

### Micro-architectural Port Contention Forensic Intelligence
Implemented a forensic layer designed to detect execution unit contention and pipeline saturation. This module identifies sophisticated side-channel attacks (like PortSmash) that exploit Simultaneous Multithreading (SMT) to leak sensitive data across process boundaries.

- **Signal**: `microArchPortForensics`
- **New Interface**: `MicroArchPortForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics`
- **Checks**:
  - **Port Contention Detection**: Monitors for execution unit stalls indicative of concurrent resource exploitation.
  - **Pipeline Saturation Analysis**: Detects artificial load on specific CPU ports used in timing-based exfiltration.
  - **Hyperthreading Leakage Attestation**: Assesses the risk of cross-thread data leakage via SMT side-channels.
  - **SMT Interference Scoring**: Quantifies the degree of micro-architectural noise caused by neighboring logical processors.

- **Risk Impact**: 
  - **Hyperthreading Leakage Likely**: Critical (+90)
  - **Port Contention Detected**: High (+85)
  - **Pipeline Port Saturation**: Medium (+60)
  - **Port Timing Variance Anomaly**: Medium (+40)

## Update: 2026-09-30 - Hardware Debugger & Register Forensics (v48)

### Hardware Debugger Forensic Intelligence
Implemented a forensic layer designed to detect advanced tampering, reverse engineering, and live debugging attempts through hardware register analysis. This module identifies the presence of hardware breakpoints and watchpoints that bypass traditional software-level anti-debugging checks.

- **Signal**: `microArchPortForensics``hardwareDebuggerForensics`
- **New Interface**: `MicroArchPortForensics``HardwareDebuggerForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeHardwareDebuggerForensics`
- **Checks**:
  - **Hardware Breakpoint Detection**: Monitors for active debug registers (DR0-DR3) indicating instruction-level interception.
  - **Watchpoint Anomaly Analysis**: Detects data-access breakpoints used to monitor sensitive memory locations in real-time.
  - **Register Consistency Attestation**: Verifies the integrity of debug control registers (DR7) to detect obfuscation attempts.
  - **Instruction Tracing Detection**: Identifies branch tracing or single-step execution artifacts (Trap Flag manipulation).

- **Risk Impact**: 
  - **Hardware Breakpoint Detected**: Critical (+95)
  - **Instruction Tracing Active**: High (+85)
  - **Watchpoint Anomaly Likely**: High (+70)
  - **Register Inconsistency**: Medium (+60)

### Risk Engine v48
Upgraded the `calculateAdvancedRiskScore` function and the Python `threat_scorer.py` module to incorporate hardware debugger forensic signals.
- **Version**: 48.0.0
- **Aggregator Weight**: 1.40

## Update: 2026-09-29 - Temporal Anomaly Detection (v47)

### Temporal Forensic Intelligence
Implemented a forensic layer designed to detect clock manipulation, NTP discrepancies, and sub-millisecond monotonicity violations. This module identifies time-based anti-forensics, state restoration (snapshotting), and hypervisor-induced execution pauses.

- **Signal**: `microArchPortForensics``temporalForensics`
- **New Interface**: `MicroArchPortForensics``TemporalForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeTemporalForensics`
- **Checks**:
  - **Clock Skew Detection**: Identifies drift between local monotonic clocks and wall clocks indicative of time stretching.
  - **NTP Discrepancy Analysis**: Compares system time against high-precision remote references to detect manual time overrides.
  - **Monotonicity Violation**: Detects backward time jumps (time travel) common in virtual machine state restoration or debugger re-runs.
  - **TSC/Wall Clock Correlation**: Detects micro-architectural pauses indicative of out-of-band monitoring or virtualization.

- **Risk Impact**: 
  - **Monotonicity Violation**: Critical (+95)
  - **Clock Skew Detected**: High (+60)
  - **Time Manipulation Likely**: High (+80)
  - **High NTP Discrepancy**: Medium (+40)

### Risk Engine v47
Upgraded the `calculateAdvancedRiskScore` function and the Python `threat_scorer.py` module to incorporate temporal forensic signals.
- **Version**: 47.0.0
- **Aggregator Weight**: 1.35

## Update: 2026-09-28 - Behavioral Biometric Entropy Analysis (v46)

### Behavioral Biometric Entropy Analysis
Implemented a deep forensic intelligence layer that profiles sub-second micro-interaction jitter and synthetic event injection signatures. This module detects sophisticated automation tools that attempt to mimic human interaction through perfectly linear or unnaturally consistent trajectories.

- **Signal**: `microArchPortForensics``behavioralBiometricEntropy`
- **Checks**:
  - **Keystroke Jitter Entropy**: Analyzes the statistical variance of inter-keystroke timings to detect hardware-level injection.
  - **Mouse Path Curvature**: Detects non-human linear movement or perfect arcs indicative of scripted interaction.
  - **Neurological Signature Consistency**: Profiles the underlying rhythm of interaction to detect session handover or multi-operator account sharing.
  - **Synthetic Event Injection**: Monitors for the absence of raw HID interrupt artifacts during high-level event firing.

- **Risk Impact**: 
  - **Synthetic Event Injection**: Critical (+95)
  - **Neurological Signature Inconsistency**: High (+80)
  - **Coaching Artifact Detection**: High (+65)

### Risk Engine v46
Upgraded the `calculateAdvancedRiskScore` function and the Python `threat_scorer.py` module to incorporate behavioral biometric entropy signals.
- **Version**: 46.0.0
- **Aggregator Weight**: 1.45

## Update: 2026-09-27 - Multi-Level Page Table Forensics (v45)

### Page Table Forensic Intelligence
Implemented kernel-level analysis of CPU page tables to detect Translation Lookaside Buffer (TLB) flush anomalies, Page Table Entry (PTE) manipulation, and Shadow Page Table inconsistencies indicative of hypervisor or rootkit activity.

- **Signal**: `microArchPortForensics``pageTableForensics`
- **New Interface**: `MicroArchPortForensics``PageTableForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzePageTableForensics`
- **Checks**:
  - **PTE Manipulation Detection**: Identifies unauthorized modifications to page table entries (e.g., flipping the RWX bits).
  - **TLB Flush Anomaly**: Detects unexpected TLB flushes which can be used to hide malicious memory mappings.
  - **NX Bit Violation**: Monitors for execution attempts in non-executable pages.
  - **Shadow Page Table Integrity**: Verifies consistency between guest and host page tables in virtualized environments.
- **Risk Impact**: Critical (+95) for PTE manipulation, High (+85) for shadow page table inconsistencies.

### Risk Engine v45
Integrated page table forensic signals into the `calculateAdvancedRiskScore` engine and the Python `threat_scorer.py` module.
- **Version**: 45.0.0
- **Weighting**: PTE Manipulation (+95), NX Bit Violation (+90), Shadow Page Table Inconsistency (+85).

---

## Update: 2026-09-26 - Interrupt Latency Forensics (v44)

### Interrupt Forensic Intelligence
Implemented kernel-level analysis of hardware interrupts to detect sophisticated data exfiltration techniques and rootkit persistence mechanisms.

- **Signal**: `microArchPortForensics``interruptForensics`
- **New Interface**: `MicroArchPortForensics``InterruptForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeInterruptForensics`
- **Checks**:
  - **Interrupt Storm Detection**: Monitors for high-frequency IRQ bursts used in side-channel attacks.
  - **IRQ Hooking Detection**: Identifies unauthorized modification of interrupt request handlers.
  - **Latency Anomaly**: Detects micro-architectural delays indicative of hypervisor-level interception.
- **Risk Impact**: Critical (+95) for exfiltration signatures, High (+85) for IRQ hooking.

### Risk Engine v44
Integrated interrupt forensic signals into the `calculateAdvancedRiskScore` engine.
- **Version**: 44.0.0
- **Weighting**: Side-Channel Exfiltration (+95), IRQ Hooking (+85), Storm Detected (+60).

---

## Update: 2026-09-25 - Cross-Protocol Forensic Correlation (v43)

### Cross-Protocol Forensic Intelligence
Implemented deep correlation of forensic artifacts across disparate communication protocols (HTTPS, WSS, RPC, P2P). This allows the engine to detect identity fragmentation and sophisticated sybil attacks where an attacker uses different protocols to bypass single-channel monitoring.

- **Signal**: `microArchPortForensics`crossProtocol
- **New Interface**: `MicroArchPortForensics`CrossProtocolSignal
- **New Analysis Function**: `analyzeMicroArchPortForensics`analyzeCrossProtocolLinking
- **Checks**:
  - **Protocol Multiplexing Detection**: Identifies when a single fingerprint is used across multiple stateful and stateless protocols.
  - **Artifact Mismatch Analysis**: Detects inconsistencies in session identifiers and device hashes between WebSocket and HTTP/RPC channels.
  - **Correlation Confidence Scoring**: Probabilistic model for linking fragmented network identities.
- **Risk Impact**: High (+40) for multi-protocol multiplexing, Medium (+30) for artifact mismatches.

### Risk Engine v43
Integrated Cross-Protocol signals into the calculateAdvancedRiskScore engine for enhanced multi-channel security coverage.
- **Version**: 43.0.0
- **Weighting**: Protocol Multiplexing (+40), Artifact Mismatch (+30).

---

## Update: 2026-09-25 - Cross-Protocol Forensic Correlation (v43)

### Cross-Protocol Forensic Intelligence
Implemented deep correlation of forensic artifacts across disparate communication protocols (HTTPS, WSS, RPC, P2P). This allows the engine to detect identity fragmentation and sophisticated sybil attacks where an attacker uses different protocols to bypass single-channel monitoring.

- **Signal**: `microArchPortForensics`
- **New Interface**: `MicroArchPortForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics`
- **Checks**:
  - **Protocol Multiplexing Detection**: Identifies when a single fingerprint is used across multiple stateful and stateless protocols.
  - **Artifact Mismatch Analysis**: Detects inconsistencies in session identifiers and device hashes between WebSocket and HTTP/RPC channels.
  - **Correlation Confidence Scoring**: Probabilistic model for linking fragmented network identities.
- **Risk Impact**: High (+40) for multi-protocol multiplexing, Medium (+30) for artifact mismatches.

### Risk Engine v43
Integrated Cross-Protocol signals into the  engine for enhanced multi-channel security coverage.
- **Version**: 43.0.0
- **Weighting**: Protocol Multiplexing (+40), Artifact Mismatch (+30).

---

## Update: 2026-09-24 - Process Environment Block (PEB) Forensic Attestation (v42)

### PEB Forensic Intelligence
Implemented deep attestation of the Process Environment Block (PEB) to detect advanced stealth techniques like process hollowing, debugger concealment, and module list masquerading.

- **Signal**: `microArchPortForensics``pebForensics`
- **New Interface**: `MicroArchPortForensics``PEBForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzePEBForensics`
- **Checks**:
  - **BeingDebugged Flag Attestation**: Direct check of the PEB structure for debugger presence, bypassing standard API hooks.
  - **Process Hollowing Detection**: Detects mismatches between the PEB image path and the actual executable backing the process.
  - **LDR Module Order Anomaly**: Identifies suspicious reordering of loaded modules, common in rootkit and malware obfuscation.
- **Risk Impact**: Critical (+95) for image path mismatch, High (+70) for LDR anomalies, Medium (+30) for debugger flags.

### Risk Engine v42
Integrated PEB forensic signals into the `calculateAdvancedRiskScore` engine for enhanced stealth process detection.
- **Version**: 42.0.0
- **Weighting**: Image Mismatch (+95), LDR Anomaly (+70), Debugger Flag (+30).

---

## Update: 2026-09-23 - Direct Kernel Object Manipulation (DKOM) Detection (v41)

### DKOM Forensic Intelligence
Implemented deep kernel structure attestation to detect stealthy rootkit activities that bypass standard syscall monitoring by directly manipulating kernel objects.
- **Signal**: `microArchPortForensics``dkomForensics`
- **New Interface**: `MicroArchPortForensics``DKOMForensics`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeDKOMForensics`
- **Checks**:
  - **Process Hiding Detection**: Identifies mismatches between the EPROCESS list and the scheduler thread list.
  - **EPROCESS Integrity**: Attests the integrity of process environment blocks at the kernel level.
  - **Unlinked Module Detection**: Scans system memory for unlinked drivers and modules.
- **Risk Impact**: Critical (+95) for hidden processes, High (+80) for EPROCESS list corruption.

### Risk Engine v41
Integrated DKOM forensic signals into the `calculateAdvancedRiskScore` engine for advanced rootkit defense.
- **Version**: 41.0.0
- **Weighting**: Process Hidden (+95), EPROCESS Corruption (+80), Unlinked Module (+70).

---

## Update: 2026-09-21 - GPU Pipeline Forensic Profiling (v40)

### GPU Pipeline Forensic Analysis
Implemented deep forensic profiling of GPU execution pipelines to detect unique hardware signatures and virtualized renderer environments.

- **Signal**: `microArchPortForensics``gpuPipeline` 
- **New Interface**: `MicroArchPortForensics``GPUPipelineSignal` 
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeGPUPipeline` 
- **Checks**:
  - **Shader Precision Variance**: Detects anomalies in floating-point rounding indicative of non-standard or virtualized GPUs.
  - **Pipeline Stall Detection**: Identifies micro-architectural bottlenecks used for device fingerprinting.
  - **GPU Vendor Mismatch**: Cross-references reported renderer strings against actual execution capabilities.
- **Risk Impact**: High (+60) for vendor mismatch, Medium (+45) for detected pipeline stalls.

### Risk Engine v40
Integrated GPU Pipeline forensic signals into the `calculateAdvancedRiskScore` engine for enhanced hardware-level attestation.
- **Version**: 40.0.0
- **Weighting**: Pipeline Stall Detected (+45), GPU Vendor Mismatch (+60), Entropy-based scaling.

---

## Update: 2026-09-19 - WebRTC IP Leak Detection & Proxy/VPN Bypass Forensics (v39)

### WebRTC IP Leak Forensic Analysis
Implemented deep forensic analysis to detect real IP disclosure through WebRTC ICE candidates, bypassing traditional proxy and VPN-based obfuscation.

- **Signal**: `microArchPortForensics``webRTCLeak`
- **New Interface**: `MicroArchPortForensics``WebRTCLeakSignal`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeWebRTCLeak`
- **Checks**:
  - **Local IP Enumeration**: Identifies internal network addresses (10.x, 192.168.x) exposed via WebRTC.
  - **Public IP Mismatch**: Correlates WebRTC-discovered public IPs against the reported transaction IP to identify proxy/VPN usage.
  - **ICE Candidate Entropy**: Analyzes the diversity of connection candidates for suspicious routing patterns.
- **Risk Impact**: Critical (+85) for confirmed WebRTC leaks, with an additional (+15) for explicit IP mismatches.

### Risk Engine v39
Integrated WebRTC Leak forensic signals into the `calculateAdvancedRiskScore` engine for enhanced identity verification.
- **Version**: 39.0.0
- **Weighting**: WebRTC Leak Detected (+85), Public IP Mismatch (+100 total).

---

## Update: 2026-09-17 - Kernel Syscall Timing Anomaly Detection (v38)

### Kernel-Level Syscall Timing Analysis
Implemented deep system-level analysis to detect hidden virtualization and debugger-induced latencies through syscall execution timing forensics.
- **Signal**: `microArchPortForensics``syscallTiming`
- **New Interface**: `MicroArchPortForensics``SyscallTimingAnomaly`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeSyscallTiming`
- **Checks**:
  - **Virtualization Detection**: Identifies anomalous latency jitter indicative of nested virtualization or hypervisor-based monitoring.
  - **Sandboxing Forensic**: Heuristic analysis for heavy sandboxing environments through execution delay profiling.
  - **Outlier Correlation**: Maps timing outliers to potential debugger-induced instruction stepping.
- **Risk Impact**: Medium (+45) for detected timing anomalies, Low (+20) for sandboxed execution artifacts.

### Risk Engine v38
Integrated Syscall Timing forensic signals into the `calculateAdvancedRiskScore` engine for enhanced kernel-level security attestation.
- **Version**: 38.0.0
- **Weighting**: Syscall Anomaly Detected (+45), Sandbox Execution (+20), Outlier Burst (+15).

---

## Update: 2026-09-14 - Cross-Chain Forensic Linking & Bridge Correlation (v37)

### Cross-Chain Forensic Linking
Implemented deep bridge activity analysis to correlate linked network assets and detect suspicious cross-chain hops. This enhancement allows the engine to track assets as they move across disparate blockchain protocols.
- **Signal**: `microArchPortForensics``crossChainLinking`
- **New Interface**: `MicroArchPortForensics``CrossChainForensicLinking`
- **New Analysis Function**: `analyzeMicroArchPortForensics``analyzeCrossChainLinking`
- **Checks**:
  - **Bridge Activity Detection**: Identifies transactions interacting with known cross-chain bridge protocols.
  - **Suspicious Bridge Usage**: Flags high-volume or high-frequency bridging patterns often associated with asset obfuscation.
  - **Linked Network Correlation**: Maps the ecosystem of networks linked to a single originating identity.
- **Risk Impact**: High (+65) for suspicious bridge usage, Medium (+30) for excessive linked networks.

### Risk Engine v37
Integrated Cross-Chain Linking forensic signals into the `calculateAdvancedRiskScore` engine for holistic cross-ecosystem security coverage.
- **Version**: 37.0.0
- **Weighting**: Suspicious Bridge Usage (+65), Excessive Linked Networks (+30), Bridge Risk Score scaling.

---

## Update: 2026-09-13 - Multi-Window Velocity Correlation & Burst Attack Detection (v35)

### Multi-Window Velocity Correlation
Implemented advanced transaction velocity analysis that monitors activity across three distinct temporal windows (1 min, 10 min, 60 min). This allows the engine to detect "burst" attacks and sudden accelerations in transaction frequency that standard single-window metrics might miss.
- **Signal**: `microArchPortForensics``multiWindowVelocity`
- **Metrics**:
  - **Short-Term Velocity**: Detects immediate spikes (1 min).
  - **Acceleration Score**: Measures the rate of change between windows.
  - **Burst Detection**: Triggers when frequency exceeds safety thresholds or acceleration is anomalous.
- **Risk Impact**: High (+40) for burst detection, plus acceleration-weighted scaling.

### TypeScript Core Refinement
Expanded the `ForensicIntelligence` interface and updated the core engine to support multi-stage velocity correlation.

---

## Update: 2026-09-12 - RF Side-Channel Analysis & Electromagnetic Forensic Refinement (v36)

### RF Side-Channel Forensic Analysis
Implemented detection for electromagnetic leakage and Radio Frequency (RF) side-channel attacks, targeting Software Defined Radio (SDR) based interception and frequency hopping anomalies.

- **Signal**: `microArchPortForensics``rfSideChannel`
- **Checks**:
  - **Radio Frequency Leakage**: Detects unusual electromagnetic emissions from system components during sensitive operations.
  - **SDR Interception Likelihood**: Heuristic analysis for localized RF signals indicative of nearby interceptors.
  - **Spectrum Anomaly**: Monitors for deviations in the expected frequency spectrum characteristics.
- **Risk Impact**: Critical (+95) for RF leakage detection, High (+90) for SDR interception likelihood.

### Risk Engine v36
Integrated RF Side-Channel forensic signals into the `calculateAdvancedRiskScore` engine for holistic electromagnetic security coverage.
- **Version**: 36.0.0
- **Weighting**: RF Leakage Detected (+95), SDR Interception Likely (+90).

---

## Update: 2026-09-11 - Acoustic Air-Gap Analysis & Ultrasonic Forensic Refinement (v35)

### Acoustic Air-Gap Forensic Analysis
Implemented logic for detecting covert acoustic exfiltration channels, specifically targeting high-frequency ultrasonic signals (18kHz-22kHz) used to bypass traditional network and optical air-gap defenses.

- **Signal**: `microArchPortForensics``acousticAirGap`
- **Checks**:
  - **Ultrasonic Detection**: Monitors for periodic high-frequency patterns above the threshold of human hearing.
  - **Acoustic Exfiltration Risk**: Correlates system load with acoustic anomalies to detect side-channel leakage.
- **Risk Impact**: Critical (+95) for ultrasonic detection, High (+85) for confirmed acoustic exfiltration artifacts.

### Risk Engine v35
Integrated the Acoustic Air-Gap logic into the `calculateAdvancedRiskScore` engine to ensure cross-channel forensic coverage.
- **Version**: 35.0.0
- **Weighting**: Ultrasonic Signal (+95), Acoustic Exfiltration Likely (+85).

---
# Sentinel-X Forensic Intelligence Protocol

This document outlines the forensic analysis models and kernel-level integrity checks implemented in the Sentinel-X system.

## Forensic Data Models

### IP Geolocation Correlation
We correlate transaction origins with known IP reputation databases and perform distance-time calculations to detect 'Impossible Travel'.

### Behavioral Biometric Signatures
Signatures are generated based on mouse entropy, keystroke cadence, and cognitive load indices.

### Temporal Anomaly Detection
Detects transactions occurring outside of established business hours or historical usage patterns.
- **Signal**: `microArchPortForensics`Local hour analysis against expected range.
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
- [x] Device Fingerprint Entropy Models
- [x] Transaction Velocity Z-Score Analysis
- [x] Behavioral Biometric Bot Detection
- [x] Cross-Chain Forensic Linking (New)
- [x] Multi-Level Page Table Forensics (v45)
- [x] Hardware Debugger & Register Forensics (v48)
- [x] L3 Cache Side-Channel Forensics (v50)


## Kernel-Level Forensic Enhancements (v38)
Deep system-level analysis for rootkit detection and kernel integrity verification.

- **Instruction Pointer Anomaly**: Detects jumps to non-executable memory segments or suspicious code redirection.
- **Rootkit Detection Engine**: Heuristic analysis for hidden processes, files, and network connections at the Ring 0 level.
- **Kernel Patch Protection (KPP)**: Monitors for unauthorized modifications to critical kernel structures.
- **LVI Vulnerability Detection**: Identifies potential Load Value Injection artifacts in cryptographic operations.

### v39: TLS Fingerprinting (JA3/JA3S)
- **Feature**: Deep packet inspection for TLS handshake artifacts.
- **Implementation**: JA3 hashing of client hello and JA3S for server response correlation.
- **Risk Vectors**: Detection of known automation tools, bots, and legacy TLS versions.

## Update: 2026-09-22 - Geolocation Correlation & Forensic Logic Fixes (v36)

### IP Geolocation Correlation Analysis
Implemented advanced correlation logic to compare current session coordinates against historical "home base" data. This allows for detection of unusual access patterns even if they don't trigger "impossible travel" (e.g., using a VPN or local data center that is distant from the user's typical residence).
- **Signal**: `microArchPortForensics``geolocationCorrelation`
- **Metrics**: 
  - `isUnusualLocation`: True if distance from home > 500km.
  - `historicalProximityKm`: Physical distance from the primary user location.
- **Risk Impact**: Medium (+35) for unusual locations, with scaling weight based on distance.

### Forensic Engine Logic Restored
Fixed critical syntax errors in `forensic-engine.ts` and `mock-forensics.ts` where multi-value returns were incorrectly typed and called. 
- Restored `analyzeAcousticAirGap` return structure.
- Corrected `multiWindowVelocity` initialization in mock data pipelines.

### Risk Engine v36
Integrated Geolocation Correlation signals into the `calculateAdvancedRiskScore` function.
- **Version**: 36.0.0
- **New Weights**: Unusual Location (+35), Distance-weighted scaling factor.
