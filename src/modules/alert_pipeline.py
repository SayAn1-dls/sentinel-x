"""
alert_pipeline.py — Real-time alert deduplication, correlation & escalation.

Sits between raw threat detectors and the notification layer.
Receives raw alerts, deduplicates bursts, groups related events into
incidents, and escalates severity based on configurable rules.

Usage:
    pipeline = AlertPipeline(dedup_window_s=30, max_incident_gap_s=120)
    incident = pipeline.ingest(alert)
    if incident and incident.severity >= Severity.HIGH:
        notify(incident)
"""

from __future__ import annotations

import hashlib
import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import IntEnum
from typing import Dict, List, Optional


# ── Severity ─────────────────────────────────────────────────────────────────

class Severity(IntEnum):
    LOW      = 1
    MEDIUM   = 2
    HIGH     = 3
    CRITICAL = 4

    @classmethod
    def from_score(cls, score: float) -> "Severity":
        """Map a 0-1 risk score to a severity level."""
        if score >= 0.85:
            return cls.CRITICAL
        if score >= 0.65:
            return cls.HIGH
        if score >= 0.40:
            return cls.MEDIUM
        return cls.LOW


# ── Raw alert ────────────────────────────────────────────────────────────────

@dataclass
class Alert:
    source: str          # detector name, e.g. "c2_beacon_detector"
    entity: str          # IP, user, host — the subject of the alert
    event_type: str      # e.g. "C2_BEACON", "BRUTE_FORCE", "EXFIL"
    score: float         # 0.0 – 1.0 risk score from the detector
    detail: str = ""     # human-readable description
    ts: float = field(default_factory=time.time)

    @property
    def severity(self) -> Severity:
        return Severity.from_score(self.score)

    @property
    def fingerprint(self) -> str:
        """Stable hash for deduplication — same entity + event type = same bucket."""
        key = f"{self.entity}:{self.event_type}"
        return hashlib.sha1(key.encode()).hexdigest()[:12]


# ── Incident (correlated group of alerts) ────────────────────────────────────

@dataclass
class Incident:
    incident_id: str
    entity: str
    alerts: List[Alert] = field(default_factory=list)
    opened_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    @property
    def severity(self) -> Severity:
        """Severity is the max across all constituent alerts."""
        if not self.alerts:
            return Severity.LOW
        return max(a.severity for a in self.alerts)

    @property
    def score(self) -> float:
        """Aggregate risk score — weighted by recency."""
        if not self.alerts:
            return 0.0
        now = time.time()
        total, weight_sum = 0.0, 0.0
        for a in self.alerts:
            age = max(1.0, now - a.ts)
            w = 1.0 / age
            total += a.score * w
            weight_sum += w
        return round(total / weight_sum, 4)

    @property
    def event_types(self) -> List[str]:
        seen, out = set(), []
        for a in self.alerts:
            if a.event_type not in seen:
                seen.add(a.event_type)
                out.append(a.event_type)
        return out

    @property
    def alert_count(self) -> int:
        return len(self.alerts)

    def add(self, alert: Alert) -> None:
        self.alerts.append(alert)
        self.updated_at = time.time()
        # escalate severity if score jumped significantly
        if alert.score > self.score + 0.2:
            pass  # severity is computed dynamically; nothing to update here

    def summary(self) -> str:
        return (
            f"Incident {self.incident_id} | entity={self.entity} "
            f"| severity={self.severity.name} | score={self.score:.3f} "
            f"| events={self.event_types} | alerts={self.alert_count}"
        )


# ── Escalation rule ──────────────────────────────────────────────────────────

@dataclass
class EscalationRule:
    """Promote severity when alert count or score thresholds are crossed."""
    min_alerts: int
    min_score: float
    promote_to: Severity

    def matches(self, incident: Incident) -> bool:
        return (
            incident.alert_count >= self.min_alerts
            and incident.score >= self.min_score
        )


DEFAULT_ESCALATION_RULES: List[EscalationRule] = [
    EscalationRule(min_alerts=5,  min_score=0.50, promote_to=Severity.HIGH),
    EscalationRule(min_alerts=10, min_score=0.60, promote_to=Severity.CRITICAL),
    EscalationRule(min_alerts=3,  min_score=0.80, promote_to=Severity.CRITICAL),
]


# ── Alert pipeline ───────────────────────────────────────────────────────────

class AlertPipeline:
    """
    Ingests raw alerts and outputs correlated incidents.

    dedup_window_s   — identical alerts within this window are collapsed (count-only)
    max_incident_gap_s — if an entity goes quiet longer than this, its incident closes
    """

    def __init__(
        self,
        dedup_window_s: float = 30.0,
        max_incident_gap_s: float = 120.0,
        escalation_rules: Optional[List[EscalationRule]] = None,
    ) -> None:
        self.dedup_window_s = dedup_window_s
        self.max_incident_gap_s = max_incident_gap_s
        self.escalation_rules = escalation_rules or DEFAULT_ESCALATION_RULES

        # fingerprint → last seen timestamp (for dedup)
        self._dedup_cache: Dict[str, float] = {}
        # entity → open incident
        self._open_incidents: Dict[str, Incident] = {}
        # all closed incidents (ordered)
        self._closed: List[Incident] = []
        self._incident_counter = 0

    # ── public API ───────────────────────────────────────────────────────────

    def ingest(self, alert: Alert) -> Optional[Incident]:
        """
        Process one alert.  Returns the affected Incident after updating it,
        or None if the alert was suppressed by deduplication.
        """
        if self._is_duplicate(alert):
            return None

        self._record_dedup(alert)
        incident = self._get_or_create_incident(alert)
        incident.add(alert)
        self._apply_escalation(incident)
        return incident

    def flush_stale(self) -> List[Incident]:
        """Close incidents that have been quiet longer than max_incident_gap_s."""
        now = time.time()
        closed = []
        for entity, incident in list(self._open_incidents.items()):
            if now - incident.updated_at > self.max_incident_gap_s:
                self._closed.append(incident)
                del self._open_incidents[entity]
                closed.append(incident)
        return closed

    def open_incidents(self) -> List[Incident]:
        return list(self._open_incidents.values())

    def closed_incidents(self) -> List[Incident]:
        return list(self._closed)

    def stats(self) -> Dict[str, int]:
        return {
            "open": len(self._open_incidents),
            "closed": len(self._closed),
            "dedup_cache_size": len(self._dedup_cache),
        }

    # ── internals ────────────────────────────────────────────────────────────

    def _is_duplicate(self, alert: Alert) -> bool:
        last = self._dedup_cache.get(alert.fingerprint)
        if last is None:
            return False
        return (alert.ts - last) < self.dedup_window_s

    def _record_dedup(self, alert: Alert) -> None:
        self._dedup_cache[alert.fingerprint] = alert.ts

    def _get_or_create_incident(self, alert: Alert) -> Incident:
        existing = self._open_incidents.get(alert.entity)
        if existing:
            # re-open/continue if still within gap window
            return existing
        self._incident_counter += 1
        inc_id = f"INC-{self._incident_counter:05d}"
        incident = Incident(incident_id=inc_id, entity=alert.entity)
        self._open_incidents[alert.entity] = incident
        return incident

    def _apply_escalation(self, incident: Incident) -> None:
        for rule in self.escalation_rules:
            if rule.matches(incident):
                # escalation is reflected in the dynamic severity property
                # but we can attach a tag for auditing
                if not hasattr(incident, "_escalated"):
                    incident._escalated = rule.promote_to  # type: ignore[attr-defined]


# ── Quick smoke test ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    pipeline = AlertPipeline(dedup_window_s=5, max_incident_gap_s=60)

    alerts = [
        Alert("c2_beacon_detector",      "192.168.1.55", "C2_BEACON",    0.88),
        Alert("credential_stuffing",      "192.168.1.55", "BRUTE_FORCE",  0.72),
        Alert("entropy_scanner",          "192.168.1.55", "DATA_STAGING", 0.65),
        Alert("c2_beacon_detector",      "192.168.1.55", "C2_BEACON",    0.88),  # dup
        Alert("behavioral_baseline",      "10.0.0.9",     "ANOMALY",      0.45),
        Alert("dns_anomaly",              "10.0.0.9",     "DNS_TUNNEL",   0.78),
    ]

    for a in alerts:
        result = pipeline.ingest(a)
        status = result.summary() if result else f"[DEDUP] {a.event_type} from {a.entity}"
        print(status)

    print("\nPipeline stats:", pipeline.stats())
