# Database Models - Revision 6
# ORM-style models for Sentinel-X data persistence

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

MODELS_VERSION = "1.6.0"
EVENT_TYPES = ["intrusion", "malware", "phishing", "ddos", "data_leak", "brute_force", "anomaly"]
SEVERITY_LEVELS = ["low", "medium", "high", "critical"]


class Event:
    """Security event model."""
    TABLE = "events"

    def __init__(self, event_type: str, severity: str, source: str,
                 payload: Optional[Dict] = None):
        self.id: Optional[str] = None
        self.type = event_type
        self.severity = severity
        self.source = source
        self.payload = payload or {}
        self.tags: List[str] = []
        self.created_at = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "severity": self.severity,
            "source": self.source,
            "payload": self.payload,
            "tags": self.tags,
            "created_at": self.created_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Event":
        event = cls(data["type"], data["severity"], data["source"], data.get("payload"))
        event.id = data.get("id")
        event.tags = data.get("tags", [])
        return event

    def add_tag(self, tag: str) -> "Event":
        if tag not in self.tags:
            self.tags.append(tag)
        return self


class Alert:
    """Alert model with lifecycle management."""
    TABLE = "alerts"
    STATUSES = ["pending", "acknowledged", "resolved", "escalated", "expired"]

    def __init__(self, event_id: str, message: str, severity: str = "medium"):
        self.id: Optional[str] = None
        self.event_id = event_id
        self.message = message
        self.severity = severity
        self.status = "pending"
        self.assignee: Optional[str] = None
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = self.created_at

    def acknowledge(self, by: str = "system") -> "Alert":
        self.status = "acknowledged"
        self.assignee = by
        self.updated_at = datetime.now(timezone.utc)
        return self

    def resolve(self, by: str = "system") -> "Alert":
        self.status = "resolved"
        self.assignee = by
        self.updated_at = datetime.now(timezone.utc)
        return self

    def escalate(self) -> "Alert":
        self.status = "escalated"
        self.updated_at = datetime.now(timezone.utc)
        return self

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "event_id": self.event_id,
            "message": self.message,
            "severity": self.severity,
            "status": self.status,
            "assignee": self.assignee,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
