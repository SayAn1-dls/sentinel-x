# Threat Detection Model

This document describes the anomaly detection pipeline and threat classification logic in Sentinel-X.

## Detection Layers

Sentinel-X uses a three-layer detection approach:

### Layer 1 — Threshold Detector
Stateless, per-sensor rules that fire instantly when a reading crosses a configured absolute limit.

| Sensor Type       | Default Threshold          | Action on Breach        |
|-------------------|----------------------------|-------------------------|
| Temperature probe | > 45°C or < 2°C            | CRITICAL alert          |
| Motion sensor     | > 50 events / 10s          | HIGH alert              |
| Camera occupancy  | > 90% capacity             | MEDIUM alert            |
| Network packet    | > 10k anomalous/min        | CRITICAL alert          |

Thresholds are configurable per-sensor in `src/config/thresholds.json`.

### Layer 2 — Statistical Detector (Z-Score)
Maintains a rolling 24-hour baseline per sensor and flags readings that deviate beyond a configurable Z-score.

- Default Z-score threshold: `3.5`
- Baseline window: 24 hours
- Minimum samples before activation: 100 readings
- Resistant to gradual drift via exponential moving average (EMA) baseline updates

Use case: catches subtle, sustained anomalies that stay below absolute thresholds.

### Layer 3 — Rate-of-Change Detector
Monitors the velocity of change between consecutive readings.

- Fires when delta > configured `roc_threshold` within a single polling interval
- Most effective for sudden spike detection (e.g., door forced open, temperature surge)

## Threat Classifier

Once an anomaly event passes any detection layer, it is forwarded to the Threat Classifier.

```
Anomaly Event
    ├── Source sensor type
    ├── Detection layer that fired
    ├── Deviation magnitude
    └── Temporal context (time of day, day of week)
         ↓
  Rule-based scoring (v1)
         ↓
  Severity: CRITICAL / HIGH / MEDIUM / LOW / INFO
```

### Severity Definitions

| Severity | Response Time Target | Auto-Escalate After |
|----------|----------------------|---------------------|
| CRITICAL | Immediate            | 2 minutes           |
| HIGH     | < 5 minutes          | 10 minutes          |
| MEDIUM   | < 30 minutes         | 60 minutes          |
| LOW      | Best effort          | Never               |
| INFO     | Log only             | Never               |

## Alert Deduplication

Repeated anomalies from the same sensor within a cooldown window are collapsed into a single alert to prevent alert fatigue.

- Default cooldown: 5 minutes (CRITICAL), 15 minutes (HIGH), 30 minutes (MEDIUM)
- Escalation counter increments on each deduplicated event; escalation fires when counter reaches `escalation_threshold`

## Future: ML-Based Detection (v2)

Planned upgrade to replace rule-based scoring with an LSTM autoencoder trained on historical sensor telemetry. The model will learn normal behavioural patterns per sensor per time window and flag deviations using reconstruction error.

Expected improvement: ~40% reduction in false positives compared to threshold-only detection, based on benchmarks from similar IoT security systems.
