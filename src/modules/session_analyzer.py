"""
session_analyzer.py — Sentinel-X
Detects session-level threats: hijacking, concurrent anomalies,
off-hours activity, rapid action bursts, and device fingerprint shifts.
"""

from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

ANALYZER_VERSION = "1.0.0"

# ── Data models ─────────────────────────────────────────────────────────────

@dataclass
class SessionEvent:
    session_id: str
    user_id: str
    timestamp: float          # Unix epoch seconds
    ip: str
    user_agent: str
    action: str               # e.g. "login", "transfer", "view", "logout"
    country_code: str = ""
    device_fingerprint: str = ""
    metadata: Dict = field(default_factory=dict)


@dataclass
class SessionAnomaly:
    session_id: str
    user_id: str
    anomaly_type: str         # e.g. "CONCURRENT_SESSION", "UA_SHIFT", "OFF_HOURS"
    severity: str             # CRITICAL / HIGH / MEDIUM / LOW
    score: float              # 0.0 – 1.0
    description: str
    detected_at: float = field(default_factory=time.time)
    evidence: Dict = field(default_factory=dict)


# ── Constants ────────────────────────────────────────────────────────────────

SEVERITY_MAP = {
    "HIJACK_SUSPECTED":    ("CRITICAL", 0.95),
    "CONCURRENT_SESSION":  ("HIGH",     0.75),
    "UA_SHIFT":            ("HIGH",     0.70),
    "RAPID_BURST":         ("MEDIUM",   0.55),
    "OFF_HOURS_ACTIVITY":  ("LOW",      0.30),
    "IP_COUNTRY_SHIFT":    ("HIGH",     0.65),
    "FINGERPRINT_CHANGE":  ("HIGH",     0.72),
}

BUSINESS_HOURS = (8, 22)          # 08:00 – 22:00 local (approximate)
BURST_WINDOW_SECONDS = 60         # Window for rapid-action detection
BURST_ACTION_THRESHOLD = 15       # Max actions in window before flagged
CONCURRENT_IP_THRESHOLD = 2       # Max distinct IPs in the same session


# ── Core analyzer ────────────────────────────────────────────────────────────

class SessionAnalyzer:
    """
    Stateful analyzer that ingests SessionEvents and emits SessionAnomalies.

    Usage
    -----
    analyzer = SessionAnalyzer()
    anomalies = analyzer.ingest(event)
    for a in anomalies:
        print(a.anomaly_type, a.severity, a.score)
    """

    def __init__(self,
                 burst_threshold: int = BURST_ACTION_THRESHOLD,
                 burst_window: float = BURST_WINDOW_SECONDS,
                 concurrent_ip_threshold: int = CONCURRENT_IP_THRESHOLD):
        self.burst_threshold = burst_threshold
        self.burst_window = burst_window
        self.concurrent_ip_threshold = concurrent_ip_threshold

        # session_id -> list of events (ordered)
        self._sessions: Dict[str, List[SessionEvent]] = defaultdict(list)
        # user_id -> set of active session_ids
        self._user_sessions: Dict[str, set] = defaultdict(set)
        # All anomalies detected so far
        self._anomalies: List[SessionAnomaly] = []

    # ── Public API ──────────────────────────────────────────────────────────

    def ingest(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Process one event and return any anomalies it triggers."""
        self._sessions[event.session_id].append(event)
        self._user_sessions[event.user_id].add(event.session_id)

        anomalies: List[SessionAnomaly] = []
        anomalies += self._check_concurrent_sessions(event)
        anomalies += self._check_ua_shift(event)
        anomalies += self._check_ip_country_shift(event)
        anomalies += self._check_fingerprint_change(event)
        anomalies += self._check_rapid_burst(event)
        anomalies += self._check_off_hours(event)
        anomalies += self._check_hijack_pattern(event)

        self._anomalies.extend(anomalies)
        return anomalies

    def ingest_batch(self, events: List[SessionEvent]) -> List[SessionAnomaly]:
        """Ingest multiple events in chronological order."""
        all_anomalies = []
        for ev in sorted(events, key=lambda e: e.timestamp):
            all_anomalies.extend(self.ingest(ev))
        return all_anomalies

    def anomalies_for_session(self, session_id: str) -> List[SessionAnomaly]:
        return [a for a in self._anomalies if a.session_id == session_id]

    def anomalies_for_user(self, user_id: str) -> List[SessionAnomaly]:
        return [a for a in self._anomalies if a.user_id == user_id]

    def top_anomalies(self, n: int = 10) -> List[SessionAnomaly]:
        return sorted(self._anomalies, key=lambda a: a.score, reverse=True)[:n]

    def summary(self) -> Dict:
        if not self._anomalies:
            return {"total": 0}
        by_type: Dict[str, int] = defaultdict(int)
        by_severity: Dict[str, int] = defaultdict(int)
        for a in self._anomalies:
            by_type[a.anomaly_type] += 1
            by_severity[a.severity] += 1
        return {
            "total": len(self._anomalies),
            "by_type": dict(by_type),
            "by_severity": dict(by_severity),
            "avg_score": round(
                sum(a.score for a in self._anomalies) / len(self._anomalies), 4
            ),
        }

    # ── Detection rules ─────────────────────────────────────────────────────

    def _check_concurrent_sessions(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Flag when a user has multiple active sessions from distinct IPs."""
        active_ips = set()
        for sid in self._user_sessions[event.user_id]:
            session_events = self._sessions[sid]
            if session_events:
                active_ips.add(session_events[-1].ip)
        if len(active_ips) > self.concurrent_ip_threshold:
            sev, score = SEVERITY_MAP["CONCURRENT_SESSION"]
            return [self._make_anomaly(
                event, "CONCURRENT_SESSION", sev, score,
                f"User has {len(active_ips)} concurrent IPs across active sessions.",
                {"active_ips": list(active_ips)},
            )]
        return []

    def _check_ua_shift(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Detect User-Agent change within the same session."""
        history = self._sessions[event.session_id]
        if len(history) < 2:
            return []
        original_ua = history[0].user_agent
        if event.user_agent and event.user_agent != original_ua:
            sev, score = SEVERITY_MAP["UA_SHIFT"]
            return [self._make_anomaly(
                event, "UA_SHIFT", sev, score,
                "User-Agent changed mid-session — possible token replay or hijack.",
                {"original_ua": original_ua, "current_ua": event.user_agent},
            )]
        return []

    def _check_ip_country_shift(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Detect country change within the same session."""
        history = self._sessions[event.session_id]
        if len(history) < 2 or not event.country_code:
            return []
        original_country = history[0].country_code
        if original_country and event.country_code != original_country:
            sev, score = SEVERITY_MAP["IP_COUNTRY_SHIFT"]
            return [self._make_anomaly(
                event, "IP_COUNTRY_SHIFT", sev, score,
                f"Session origin shifted from {original_country} to {event.country_code}.",
                {"original_country": original_country, "current_country": event.country_code},
            )]
        return []

    def _check_fingerprint_change(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Detect device fingerprint change within a session."""
        history = self._sessions[event.session_id]
        if len(history) < 2 or not event.device_fingerprint:
            return []
        original_fp = history[0].device_fingerprint
        if original_fp and event.device_fingerprint != original_fp:
            sev, score = SEVERITY_MAP["FINGERPRINT_CHANGE"]
            return [self._make_anomaly(
                event, "FINGERPRINT_CHANGE", sev, score,
                "Device fingerprint changed mid-session.",
                {"original_fp": original_fp, "current_fp": event.device_fingerprint},
            )]
        return []

    def _check_rapid_burst(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Flag unusually high action rate within a short window."""
        history = self._sessions[event.session_id]
        recent = [e for e in history if event.timestamp - e.timestamp <= self.burst_window]
        if len(recent) > self.burst_threshold:
            sev, score = SEVERITY_MAP["RAPID_BURST"]
            return [self._make_anomaly(
                event, "RAPID_BURST", sev, score,
                f"{len(recent)} actions in {self.burst_window}s — possible bot or scripted attack.",
                {"action_count": len(recent), "window_seconds": self.burst_window},
            )]
        return []

    def _check_off_hours(self, event: SessionEvent) -> List[SessionAnomaly]:
        """Flag sensitive actions performed outside business hours."""
        SENSITIVE = {"transfer", "withdrawal", "admin", "delete", "export"}
        if event.action.lower() not in SENSITIVE:
            return []
        hour = int((event.timestamp % 86400) / 3600)   # UTC hour approximation
        if not (BUSINESS_HOURS[0] <= hour < BUSINESS_HOURS[1]):
            sev, score = SEVERITY_MAP["OFF_HOURS_ACTIVITY"]
            return [self._make_anomaly(
                event, "OFF_HOURS_ACTIVITY", sev, score,
                f"Sensitive action '{event.action}' performed at off-hours (UTC hour {hour}).",
                {"utc_hour": hour, "action": event.action},
            )]
        return []

    def _check_hijack_pattern(self, event: SessionEvent) -> List[SessionAnomaly]:
        """
        Composite rule: UA shift + IP change together = high hijack confidence.
        Only fires if both signals appear within the same session.
        """
        existing = self.anomalies_for_session(event.session_id)
        types = {a.anomaly_type for a in existing}
        if "UA_SHIFT" in types and "IP_COUNTRY_SHIFT" in types:
            # Avoid duplicate HIJACK anomalies
            if "HIJACK_SUSPECTED" not in types:
                sev, score = SEVERITY_MAP["HIJACK_SUSPECTED"]
                return [self._make_anomaly(
                    event, "HIJACK_SUSPECTED", sev, score,
                    "Combined UA shift + country shift strongly indicates session hijacking.",
                    {"correlated_signals": ["UA_SHIFT", "IP_COUNTRY_SHIFT"]},
                )]
        return []

    # ── Helpers ──────────────────────────────────────────────────────────────

    @staticmethod
    def _make_anomaly(event: SessionEvent, anomaly_type: str,
                      severity: str, score: float,
                      description: str, evidence: Dict) -> SessionAnomaly:
        return SessionAnomaly(
            session_id=event.session_id,
            user_id=event.user_id,
            anomaly_type=anomaly_type,
            severity=severity,
            score=score,
            description=description,
            detected_at=event.timestamp,
            evidence=evidence,
        )
