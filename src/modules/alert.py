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


# ---------------------------------------------------------------------------
# Rule-based alert routing (public package API)
#
# Alert, AlertRule, AlertChannel, AlertPriority, AlertDeduplicator and
# AlertRouter implement the routing API exported by src.modules and covered
# by tests/test_alert.py and tests/test_notification.py. AlertManager (above)
# remains the throttling/lifecycle manager; these classes decide *where* an
# alert goes and suppress repeats while it gets there.
# ---------------------------------------------------------------------------

from dataclasses import dataclass, field
from enum import Enum, IntEnum
from typing import Callable


class AlertPriority(IntEnum):
    """Routing priority; lower value means more urgent."""

    P1_CRITICAL = 1
    P2_HIGH = 2
    P3_MEDIUM = 3
    P4_LOW = 4


class AlertChannel(Enum):
    """Delivery channels a rule can route to."""

    EMAIL = "email"
    SLACK = "slack"
    WEBHOOK = "webhook"


@dataclass
class Alert:
    """A triggered alert ready for routing."""

    alert_id: str
    rule_id: str
    title: str
    message: str
    priority: AlertPriority
    source: str
    triggered_at: datetime
    metadata: Dict = field(default_factory=dict)


@dataclass
class AlertRule:
    """Maps alerts from a condition onto delivery channels."""

    rule_id: str
    name: str
    condition: str
    channels: List[AlertChannel]
    priority: AlertPriority
    enabled: bool = True


class AlertDeduplicator:
    """Suppresses repeat alerts for the same rule+source within a cooldown."""

    def __init__(self, cooldown: timedelta = timedelta(minutes=5)):
        self.cooldown = cooldown
        self._fingerprints: Dict[str, datetime] = {}

    @staticmethod
    def _fingerprint(alert: Alert) -> str:
        return f"{alert.rule_id}:{alert.source}"

    def is_duplicate(self, alert: Alert) -> bool:
        """True when this rule+source already fired inside the cooldown."""
        now = datetime.utcnow()
        fingerprint = self._fingerprint(alert)
        last_seen = self._fingerprints.get(fingerprint)
        self._fingerprints[fingerprint] = now
        return last_seen is not None and now - last_seen < self.cooldown

    def cleanup(self) -> int:
        """Drop expired fingerprints; returns how many were removed."""
        now = datetime.utcnow()
        expired = [fp for fp, seen in self._fingerprints.items() if now - seen >= self.cooldown]
        for fp in expired:
            del self._fingerprints[fp]
        return len(expired)


class AlertRouter:
    """Routes alerts to the channels named by their matching rule."""

    def __init__(self):
        self._rules: Dict[str, AlertRule] = {}
        self._handlers: Dict[AlertChannel, Callable[[Alert], None]] = {}
        self._routed: Dict[str, Alert] = {}
        self._acknowledged: set = set()

    def add_rule(self, rule: AlertRule) -> None:
        self._rules[rule.rule_id] = rule

    def register_handler(self, channel: AlertChannel, handler: Callable[[Alert], None]) -> None:
        self._handlers[channel] = handler

    def route(self, alert: Alert) -> Dict:
        """Deliver an alert to every channel on its rule; report per-channel status."""
        rule = self._rules.get(alert.rule_id)
        if rule is None:
            return {"status": "no_rule", "alert_id": alert.alert_id, "channels": {}}
        channels: Dict[str, Dict] = {}
        for channel in rule.channels:
            handler = self._handlers.get(channel)
            if handler is None:
                channels[channel.value] = {"status": "no_handler"}
                continue
            try:
                handler(alert)
                channels[channel.value] = {"status": "delivered"}
            except Exception as exc:  # a broken channel must not block the rest
                channels[channel.value] = {"status": "error", "error": str(exc)}
        self._routed[alert.alert_id] = alert
        return {"status": "routed", "alert_id": alert.alert_id, "channels": channels}

    def acknowledge(self, alert_id: str) -> bool:
        """Mark a routed alert acknowledged; False when unknown or already acked."""
        if alert_id not in self._routed or alert_id in self._acknowledged:
            return False
        self._acknowledged.add(alert_id)
        return True

    def get_unacknowledged(self) -> List[Alert]:
        """Routed alerts nobody has acknowledged yet."""
        return [alert for aid, alert in self._routed.items() if aid not in self._acknowledged]
