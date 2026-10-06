"""
Sentinel-X Event Correlation Engine
======================================
Correlates anomaly events across multiple sensors to identify
complex threat scenarios that individual detectors might miss.
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict


@dataclass
class CorrelationRule:
    """Defines a multi-event correlation pattern."""
    rule_id: str
    name: str
    description: str
    required_events: List[str]  # List of anomaly types or sensor IDs
    time_window_seconds: int = 300  # Events must occur within this window
    min_events: int = 2
    severity_override: Optional[str] = None


@dataclass
class CorrelatedIncident:
    """Represents a correlated incident from multiple events."""
    incident_id: str
    rule_id: str
    description: str
    events: List[Dict[str, Any]]
    severity: str
    first_event_time: datetime
    last_event_time: datetime
    sensor_count: int
    confidence: float


class CorrelationEngine:
    """Correlates events across sensors within time windows.

    Maintains a sliding buffer of recent events and checks
    them against configured correlation rules to detect
    compound threat scenarios.

    Attributes:
        rules: List of correlation rules.
        _event_buffer: Time-windowed buffer of recent events.
        _incidents: Detected correlated incidents.
    """

    def __init__(self, buffer_duration_seconds: int = 600):
        self.rules: List[CorrelationRule] = []
        self._event_buffer: List[Dict[str, Any]] = []
        self._buffer_duration = timedelta(seconds=buffer_duration_seconds)
        self._incidents: List[CorrelatedIncident] = []
        self._incident_counter = 0

    def add_rule(self, rule: CorrelationRule) -> None:
        """Add a correlation rule."""
        self.rules.append(rule)

    def ingest_event(self, event: Dict[str, Any]) -> List[CorrelatedIncident]:
        """Ingest a new event and check for correlations.

        Args:
            event: Event dictionary with at least 'type', 'sensor_id', 'timestamp'.

        Returns:
            List of newly detected correlated incidents.
        """
        self._event_buffer.append(event)
        self._prune_buffer()

        new_incidents = []
        for rule in self.rules:
            incident = self._check_rule(rule)
            if incident:
                new_incidents.append(incident)
                self._incidents.append(incident)

        return new_incidents

    def _prune_buffer(self) -> None:
        """Remove events outside the buffer duration."""
        cutoff = datetime.utcnow() - self._buffer_duration
        self._event_buffer = [
            e for e in self._event_buffer
            if e.get("timestamp", datetime.utcnow()) >= cutoff
        ]

    def _check_rule(self, rule: CorrelationRule) -> Optional[CorrelatedIncident]:
        """Check if current events satisfy a correlation rule.

        Args:
            rule: The correlation rule to check.

        Returns:
            CorrelatedIncident if rule is satisfied, None otherwise.
        """
        window = timedelta(seconds=rule.time_window_seconds)
        now = datetime.utcnow()
        recent_events = [
            e for e in self._event_buffer
            if now - e.get("timestamp", now) <= window
        ]

        matching = []
        for event in recent_events:
            event_type = event.get("type", "")
            sensor_id = event.get("sensor_id", "")
            if event_type in rule.required_events or sensor_id in rule.required_events:
                matching.append(event)

        if len(matching) >= rule.min_events:
            self._incident_counter += 1
            sensors = set(e.get("sensor_id", "") for e in matching)
            timestamps = [e.get("timestamp", now) for e in matching]

            return CorrelatedIncident(
                incident_id=f"inc-{self._incident_counter:04d}",
                rule_id=rule.rule_id,
                description=f"Correlation rule '{rule.name}' triggered: "
                            f"{len(matching)} events from {len(sensors)} sensors",
                events=matching,
                severity=rule.severity_override or "high",
                first_event_time=min(timestamps),
                last_event_time=max(timestamps),
                sensor_count=len(sensors),
                confidence=min(len(matching) / (rule.min_events * 2), 1.0),
            )

        return None

    def get_recent_incidents(self, limit: int = 10) -> List[CorrelatedIncident]:
        """Get most recent correlated incidents.

        Args:
            limit: Maximum incidents to return.

        Returns:
            List of recent incidents, newest first.
        """
        return sorted(
            self._incidents,
            key=lambda i: i.last_event_time,
            reverse=True,
        )[:limit]
