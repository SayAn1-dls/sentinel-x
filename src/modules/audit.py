"""
Sentinel-X Audit Trail Module
================================
Records and queries all security-relevant actions performed
in the system for compliance and forensic analysis.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class AuditAction(Enum):
    """Categorized audit actions."""
    LOGIN = "auth.login"
    LOGOUT = "auth.logout"
    LOGIN_FAILED = "auth.login_failed"
    CONFIG_CHANGE = "config.change"
    ALERT_ACKNOWLEDGE = "alert.acknowledge"
    ALERT_RESOLVE = "alert.resolve"
    RULE_CREATE = "rule.create"
    RULE_UPDATE = "rule.update"
    RULE_DELETE = "rule.delete"
    USER_CREATE = "user.create"
    USER_UPDATE = "user.update"
    USER_DELETE = "user.delete"
    SENSOR_REGISTER = "sensor.register"
    SENSOR_DEACTIVATE = "sensor.deactivate"
    DATA_EXPORT = "data.export"
    API_KEY_CREATE = "apikey.create"
    API_KEY_REVOKE = "apikey.revoke"


@dataclass
class AuditEntry:
    """A single audit log entry."""
    entry_id: str
    action: AuditAction
    actor: str  # User ID or system identifier
    timestamp: datetime
    resource_type: str
    resource_id: str
    details: Dict[str, Any] = field(default_factory=dict)
    ip_address: str = ""
    user_agent: str = ""
    success: bool = True


class AuditLogger:
    """In-memory audit logger with query capabilities.

    In production, this would write to an append-only database
    or immutable log store (e.g., AWS CloudTrail, MongoDB capped collection).

    Attributes:
        _entries: List of audit entries (in-memory store).
        _max_entries: Maximum entries to retain in memory.
    """

    def __init__(self, max_entries: int = 10000):
        self._entries: List[AuditEntry] = []
        self._max_entries = max_entries

    def log(self, entry: AuditEntry) -> None:
        """Record an audit entry.

        Args:
            entry: The audit entry to record.
        """
        self._entries.append(entry)
        if len(self._entries) > self._max_entries:
            self._entries = self._entries[-self._max_entries:]

    def query(
        self,
        action: Optional[AuditAction] = None,
        actor: Optional[str] = None,
        since: Optional[datetime] = None,
        until: Optional[datetime] = None,
        limit: int = 100,
    ) -> List[AuditEntry]:
        """Query audit entries with filters.

        Args:
            action: Filter by action type.
            actor: Filter by actor ID.
            since: Lower time bound.
            until: Upper time bound.
            limit: Maximum results.

        Returns:
            Matching audit entries, newest first.
        """
        results = self._entries[:]
        if action:
            results = [e for e in results if e.action == action]
        if actor:
            results = [e for e in results if e.actor == actor]
        if since:
            results = [e for e in results if e.timestamp >= since]
        if until:
            results = [e for e in results if e.timestamp <= until]
        return sorted(results, key=lambda e: e.timestamp, reverse=True)[:limit]

    def get_failed_logins(self, minutes: int = 60) -> List[AuditEntry]:
        """Get failed login attempts in the last N minutes.

        Useful for detecting brute-force attacks.

        Args:
            minutes: Lookback window in minutes.

        Returns:
            List of failed login entries.
        """
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(minutes=minutes)
        return [
            e for e in self._entries
            if e.action == AuditAction.LOGIN_FAILED and e.timestamp >= cutoff
        ]
