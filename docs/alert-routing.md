# Alert Routing & Escalation

This document describes how Sentinel-X routes, deduplicates, and escalates alerts.

## Routing Pipeline

```
Threat Classifier
      ↓
 Priority Assignment (CRITICAL / HIGH / MEDIUM / LOW)
      ↓
 Deduplication Check (cooldown window per sensor)
      ↓
  ┌───────────────────────────────────┐
  │  Route to configured channels     │
  │  - Email (SMTP)                   │
  │  - Slack webhook                  │
  │  - In-app dashboard notification  │
  └───────────────────────────────────┘
      ↓
 Escalation Monitor (background task)
```

## Cooldown Windows

| Severity | Cooldown | Escalate After |
|----------|----------|----------------|
| CRITICAL | 2 min    | 2 min          |
| HIGH     | 10 min   | 10 min         |
| MEDIUM   | 30 min   | 60 min         |
| LOW      | 60 min   | Never          |

## Escalation Workflow

1. Alert fires and is routed normally.
2. If the alert is not acknowledged within the escalation window, the escalation monitor re-fires the alert at the next severity level up.
3. CRITICAL alerts that are unacknowledged for 10 minutes trigger a secondary channel (e.g. SMS/call if configured).
4. All escalations are logged in the audit trail with a timestamp and escalation reason.

## Deduplication

Duplicate events from the same sensor within the cooldown window are collapsed. The deduplication key is `(sensor_id, alert_type)`. Each suppressed duplicate increments the event counter on the open alert. When the counter hits `escalation_threshold` (default: 5), the alert is force-escalated regardless of the cooldown window.

## Acknowledgement

Alerts can be acknowledged via:
- Dashboard UI (one-click ack with optional note)
- API endpoint: `POST /alerts/{alert_id}/acknowledge`

Acknowledged alerts stop escalating but remain in the audit trail.
