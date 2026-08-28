"""
Sentinel-X Alert Management Module
====================================
Handles alert routing, deduplication, escalation, and delivery
through multiple channels (email, webhook, Slack, SMS).
"""

from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import json
import hashlib


class AlertChannel(Enum):
    """Supported alert delivery channels."""
    EMAIL = "email"
    WEBHOOK = "webhook"
    SLACK = "slack"
    SMS = "sms"


class AlertPriority(Enum):
    """Alert priority levels for routing decisions."""
    P1_CRITICAL = 1
    P2_HIGH = 2
    P3_MEDIUM = 3
    P4_LOW = 4


@dataclass
class AlertRule:
    """Defines conditions and routing for an alert."""
    rule_id: str
    name: str
    condition: str  # Expression to evaluate
    channels: List[AlertChannel]
    priority: AlertPriority
    cooldown_minutes: int = 5
    escalate_after_minutes: int = 30
    tags: List[str] = field(default_factory=list)


@dataclass
class Alert:
    """Represents a triggered alert instance."""
    alert_id: str
    rule_id: str
    title: str
    message: str
    priority: AlertPriority
    source: str
    triggered_at: datetime
    acknowledged: bool = False
    resolved: bool = False
    escalated: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


class AlertDeduplicator:
    """Prevents duplicate alerts within a configurable time window.

    Uses a fingerprint-based approach to identify duplicate alerts
    and suppress repeated notifications within the cooldown period.

    Attributes:
        cooldown: Default cooldown duration between duplicate alerts.
        _fingerprints: Cache of recent alert fingerprints with timestamps.
    """

    def __init__(self, cooldown: timedelta = timedelta(minutes=5)):
        self.cooldown = cooldown
        self._fingerprints: Dict[str, datetime] = {}

    def _compute_fingerprint(self, alert: Alert) -> str:
        """Generate a deduplication fingerprint for an alert.

        Args:
            alert: The alert to fingerprint.

        Returns:
            SHA256 hex digest as fingerprint string.
        """
        key = f"{alert.rule_id}:{alert.source}:{alert.title}"
        return hashlib.sha256(key.encode()).hexdigest()

    def is_duplicate(self, alert: Alert) -> bool:
        """Check if an alert is a duplicate within the cooldown window.

        Args:
            alert: The alert to check.

        Returns:
            True if this alert should be suppressed, False otherwise.
        """
        fp = self._compute_fingerprint(alert)
        now = datetime.utcnow()

        if fp in self._fingerprints:
            last_seen = self._fingerprints[fp]
            if now - last_seen < self.cooldown:
                return True

        self._fingerprints[fp] = now
        return False

    def cleanup(self) -> int:
        """Remove expired fingerprints from the cache.

        Returns:
            Number of fingerprints removed.
        """
        now = datetime.utcnow()
        expired = [
            fp for fp, ts in self._fingerprints.items()
            if now - ts > self.cooldown * 2
        ]
        for fp in expired:
            del self._fingerprints[fp]
        return len(expired)
