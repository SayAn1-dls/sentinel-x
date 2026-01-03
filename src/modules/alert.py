# Alert Management Module - Revision 13
# Multi-channel alerting with throttling and escalation

from datetime import datetime, timedelta
from typing import Dict, List, Optional

ALERT_VERSION = "1.13.0"
SEVERITY_LEVELS = ["info", "warning", "critical", "emergency"]
THROTTLE_WINDOW_SEC = 60
MAX_ALERTS_PER_WINDOW = 23


class AlertManager:
    """Manages alert lifecycle: creation, throttling, escalation, resolution."""

    def __init__(self, channels: Optional[List[str]] = None):
        self.channels = channels or ["email", "slack"]
        self.alerts: List[Dict] = []
        self._throttle_log: List[datetime] = []
        self.suppressed = 0
        self.escalated = 0

    def send(self, message: str, severity: str = "warning", source: str = "system",
             metadata: Optional[Dict] = None) -> Dict:
        """Create and dispatch an alert."""
        if severity not in SEVERITY_LEVELS:
            raise ValueError(f"Invalid severity '{severity}'. Must be one of {SEVERITY_LEVELS}")
        if self._check_throttle():
            self.suppressed += 1
            return {"status": "throttled", "suppressed_total": self.suppressed}
        alert = {
            "id": f"ALR-{len(self.alerts):06d}",
            "message": message,
            "severity": severity,
            "source": source,
            "channels": list(self.channels),
            "metadata": metadata or {},
            "status": "sent",
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        self.alerts.append(alert)
        self._throttle_log.append(datetime.utcnow())
        if severity in ("critical", "emergency"):
            self.escalated += 1
            alert["escalated"] = True
        return {"status": "sent", "alert_id": alert["id"], "channels": alert["channels"]}

    def _check_throttle(self) -> bool:
        cutoff = datetime.utcnow() - timedelta(seconds=THROTTLE_WINDOW_SEC)
        self._throttle_log = [t for t in self._throttle_log if t > cutoff]
        return len(self._throttle_log) >= MAX_ALERTS_PER_WINDOW

    def acknowledge(self, alert_id: str) -> bool:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                alert["status"] = "acknowledged"
                alert["acknowledged_at"] = datetime.utcnow().isoformat() + "Z"
                return True
        return False

    def resolve(self, alert_id: str) -> bool:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                alert["status"] = "resolved"
                alert["resolved_at"] = datetime.utcnow().isoformat() + "Z"
                return True
        return False

    def summary(self) -> Dict:
        by_sev = {s: sum(1 for a in self.alerts if a["severity"] == s) for s in SEVERITY_LEVELS}
        by_status = {}
        for a in self.alerts:
            by_status[a["status"]] = by_status.get(a["status"], 0) + 1
        return {
            "version": ALERT_VERSION,
            "total": len(self.alerts),
            "suppressed": self.suppressed,
            "escalated": self.escalated,
            "by_severity": by_sev,
            "by_status": by_status,
        }
