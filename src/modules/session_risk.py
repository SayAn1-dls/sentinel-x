"""
session_risk.py — Session-level risk scoring and anomaly detection.

Tracks per-session behavioral signals (request velocity, geo-jumps,
UA switching, privilege escalation attempts) and emits a continuous
risk score that can feed AlertPipeline or trigger step-up auth.

Usage:
    tracker = SessionRiskTracker()
    score = tracker.update(session_id="abc123", event=SessionEvent(...))
    if score >= 0.75:
        force_reauth(session_id)
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple


# ── Event types ───────────────────────────────────────────────────────────────

class EventType(str, Enum):
    REQUEST          = "REQUEST"
    AUTH_ATTEMPT     = "AUTH_ATTEMPT"
    PRIVILEGE_CHANGE = "PRIVILEGE_CHANGE"
    FILE_ACCESS      = "FILE_ACCESS"
    DATA_EXPORT      = "DATA_EXPORT"
    GEO_CHANGE       = "GEO_CHANGE"
    UA_CHANGE        = "UA_CHANGE"
    IDLE_RESUME      = "IDLE_RESUME"


# ── Session event ─────────────────────────────────────────────────────────────

@dataclass
class SessionEvent:
    event_type: EventType
    ip: str = ""
    country: str = ""
    user_agent: str = ""
    path: str = ""
    status_code: int = 200
    bytes_sent: int = 0
    ts: float = field(default_factory=time.time)


# ── Session state ─────────────────────────────────────────────────────────────

@dataclass
class SessionState:
    session_id: str
    created_at: float = field(default_factory=time.time)
    last_seen: float = field(default_factory=time.time)

    # running signals
    request_count: int = 0
    failed_auth_count: int = 0
    privilege_changes: int = 0
    data_exports: int = 0

    # baseline fingerprint (set on first event)
    origin_ip: str = ""
    origin_country: str = ""
    origin_ua: str = ""

    # velocity tracking — timestamps of last N requests
    _req_timestamps: List[float] = field(default_factory=list)
    _MAX_TS_BUFFER: int = field(default=60, init=False, repr=False)

    # geo/ua change flags
    geo_jumps: int = 0
    ua_switches: int = 0

    # fingerprint latch: set once on the first event, never overwritten.
    # (Guarding on origin_ip meant sessions whose first event carried no IP
    # kept resetting the baseline, so geo/UA jumps were never detected.)
    _fingerprint_set: bool = field(default=False, init=False, repr=False)

    # accumulated risk score (EWMA)
    _risk_score: float = 0.0
    _EWMA_ALPHA: float = field(default=0.3, init=False, repr=False)

    def record_request_ts(self, ts: float) -> None:
        self._req_timestamps.append(ts)
        if len(self._req_timestamps) > self._MAX_TS_BUFFER:
            self._req_timestamps.pop(0)

    def requests_per_minute(self, window_s: float = 60.0) -> float:
        now = time.time()
        recent = [t for t in self._req_timestamps if now - t <= window_s]
        return len(recent) / (window_s / 60.0)

    def session_age_s(self) -> float:
        return time.time() - self.created_at

    def idle_gap_s(self) -> float:
        return time.time() - self.last_seen


# ── Risk factors ──────────────────────────────────────────────────────────────

def _velocity_score(rpm: float, baseline_rpm: float = 30.0) -> float:
    """High request velocity relative to baseline → high score."""
    if rpm <= 0:
        return 0.0
    ratio = rpm / max(baseline_rpm, 1.0)
    return min(1.0, math.log1p(ratio) / math.log1p(10))


def _auth_failure_score(failures: int) -> float:
    """Exponential growth: 1 failure ≈ 0.1, 5 ≈ 0.6, 10 ≈ 0.9."""
    return 1.0 - math.exp(-0.2 * failures)


def _geo_jump_score(jumps: int) -> float:
    return min(1.0, 0.4 * jumps)


def _ua_switch_score(switches: int) -> float:
    return min(1.0, 0.35 * switches)


def _privilege_score(changes: int) -> float:
    return min(1.0, 0.5 * changes)


def _export_score(exports: int) -> float:
    return min(1.0, 0.45 * exports)


def _idle_resume_score(idle_s: float) -> float:
    """Session resumed after suspicious idle (>30 min = mildly suspicious)."""
    if idle_s < 1800:
        return 0.0
    return min(0.5, (idle_s - 1800) / 3600 * 0.5)


# ── Weights ───────────────────────────────────────────────────────────────────

FACTOR_WEIGHTS = {
    "velocity":   0.25,
    "auth":       0.25,
    "geo":        0.20,
    "ua":         0.10,
    "privilege":  0.10,
    "export":     0.07,
    "idle":       0.03,
}


def _compute_raw_score(state: SessionState, event: SessionEvent) -> float:
    factors = {
        "velocity":  _velocity_score(state.requests_per_minute()),
        "auth":      _auth_failure_score(state.failed_auth_count),
        "geo":       _geo_jump_score(state.geo_jumps),
        "ua":        _ua_switch_score(state.ua_switches),
        "privilege": _privilege_score(state.privilege_changes),
        "export":    _export_score(state.data_exports),
        "idle":      _idle_resume_score(state.idle_gap_s())
                     if event.event_type == EventType.IDLE_RESUME else 0.0,
    }
    return sum(v * FACTOR_WEIGHTS[k] for k, v in factors.items())


# ── Tracker ───────────────────────────────────────────────────────────────────

class SessionRiskTracker:
    """
    Maintains per-session state and emits an EWMA-smoothed risk score
    after each event.
    """

    def __init__(self, session_ttl_s: float = 3600.0) -> None:
        self.session_ttl_s = session_ttl_s
        self._sessions: Dict[str, SessionState] = {}

    # ── public API ────────────────────────────────────────────────────────────

    def update(self, session_id: str, event: SessionEvent) -> float:
        """
        Ingest one session event and return the updated risk score (0-1).
        """
        state = self._get_or_create(session_id)
        self._apply_event(state, event)
        raw = _compute_raw_score(state, event)
        state._risk_score = (
            state._EWMA_ALPHA * raw
            + (1 - state._EWMA_ALPHA) * state._risk_score
        )
        state.last_seen = event.ts
        return round(state._risk_score, 4)

    def score(self, session_id: str) -> Optional[float]:
        s = self._sessions.get(session_id)
        return round(s._risk_score, 4) if s else None

    def evict_stale(self) -> int:
        cutoff = time.time() - self.session_ttl_s
        stale = [sid for sid, s in self._sessions.items() if s.last_seen < cutoff]
        for sid in stale:
            del self._sessions[sid]
        return len(stale)

    def top_risky(self, n: int = 10) -> List[Tuple[str, float]]:
        ranked = sorted(
            self._sessions.items(),
            key=lambda kv: kv[1]._risk_score,
            reverse=True,
        )
        return [(sid, round(s._risk_score, 4)) for sid, s in ranked[:n]]

    def session_count(self) -> int:
        return len(self._sessions)

    # ── internals ─────────────────────────────────────────────────────────────

    def _get_or_create(self, session_id: str) -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState(session_id=session_id)
        return self._sessions[session_id]

    def _apply_event(self, state: SessionState, event: SessionEvent) -> None:
        state.request_count += 1
        state.record_request_ts(event.ts)

        # set baseline fingerprint once, on the first event
        if not state._fingerprint_set:
            state.origin_ip = event.ip
            state.origin_country = event.country
            state.origin_ua = event.user_agent
            state._fingerprint_set = True

        if event.event_type == EventType.AUTH_ATTEMPT and event.status_code in (401, 403):
            state.failed_auth_count += 1

        if event.event_type == EventType.PRIVILEGE_CHANGE:
            state.privilege_changes += 1

        if event.event_type == EventType.DATA_EXPORT:
            state.data_exports += 1

        if event.event_type == EventType.GEO_CHANGE:
            if event.country and event.country != state.origin_country:
                state.geo_jumps += 1

        if event.event_type == EventType.UA_CHANGE:
            if event.user_agent and event.user_agent != state.origin_ua:
                state.ua_switches += 1


# ── Smoke test ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tracker = SessionRiskTracker()
    sid = "session-xyz"

    events = [
        SessionEvent(EventType.REQUEST,      ip="1.2.3.4", country="IN", user_agent="Chrome/120"),
        SessionEvent(EventType.AUTH_ATTEMPT, ip="1.2.3.4", status_code=401),
        SessionEvent(EventType.AUTH_ATTEMPT, ip="1.2.3.4", status_code=401),
        SessionEvent(EventType.AUTH_ATTEMPT, ip="1.2.3.4", status_code=401),
        SessionEvent(EventType.GEO_CHANGE,   ip="5.6.7.8", country="RU"),
        SessionEvent(EventType.PRIVILEGE_CHANGE),
        SessionEvent(EventType.DATA_EXPORT),
    ]

    for e in events:
        score = tracker.update(sid, e)
        print(f"{e.event_type.value:<20} → risk score: {score:.4f}")

    print("\nTop risky sessions:", tracker.top_risky())
