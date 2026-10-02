"""
behavioral_baseline.py — User behavioral baseline profiling and deviation detection.

Builds a statistical baseline of normal user behavior (login times, locations,
action patterns, session durations) and flags deviations as anomalies.
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple


# ── Data models ──────────────────────────────────────────────────────────────

@dataclass
class BehaviorEvent:
    user_id: str
    timestamp: float          # Unix epoch UTC
    action: str               # e.g. "login", "file_access", "transfer"
    ip: Optional[str] = None
    country: Optional[str] = None
    duration_seconds: Optional[float] = None   # session/action duration
    bytes_transferred: Optional[int] = None


@dataclass
class BaselineProfile:
    user_id: str
    sample_count: int = 0
    # Login hour distribution (0-23)
    hour_counts: Dict[int, int] = field(default_factory=lambda: defaultdict(int))
    # Action frequency
    action_counts: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    # Country frequency
    country_counts: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    # Session durations (raw samples)
    durations: List[float] = field(default_factory=list)
    # Bytes transferred (raw samples)
    bytes_samples: List[int] = field(default_factory=list)
    # Inter-event gaps in seconds
    gaps: List[float] = field(default_factory=list)
    _last_ts: Optional[float] = field(default=None, repr=False)


@dataclass
class DeviationReport:
    user_id: str
    event: BehaviorEvent
    deviations: List[str]          # human-readable descriptions
    risk_score: float              # 0.0 – 1.0
    severity: str                  # LOW / MEDIUM / HIGH / CRITICAL

    @property
    def flagged(self) -> bool:
        return self.risk_score > 0.3


# ── Core engine ──────────────────────────────────────────────────────────────

class BehavioralBaseline:
    """
    Profile user behavior and detect deviations in real time.

    Usage
    -----
    bb = BehavioralBaseline(min_samples=30)
    bb.train(historical_events)          # build baseline
    report = bb.evaluate(new_event)      # check new event
    """

    def __init__(
        self,
        min_samples: int = 10,
        z_threshold: float = 2.5,
        rare_country_pct: float = 0.05,
        rare_hour_pct: float = 0.03,
    ):
        self.min_samples = min_samples
        self.z_threshold = z_threshold
        self.rare_country_pct = rare_country_pct
        self.rare_hour_pct = rare_hour_pct
        self._profiles: Dict[str, BaselineProfile] = {}

    # ── Training ─────────────────────────────────────────────────────────────

    def train(self, events: List[BehaviorEvent]) -> None:
        """Ingest historical events to build baselines."""
        for ev in sorted(events, key=lambda e: e.timestamp):
            self._update_profile(ev)

    def _update_profile(self, ev: BehaviorEvent) -> BaselineProfile:
        if ev.user_id not in self._profiles:
            self._profiles[ev.user_id] = BaselineProfile(user_id=ev.user_id)
        p = self._profiles[ev.user_id]

        hour = datetime.fromtimestamp(ev.timestamp, tz=timezone.utc).hour
        p.hour_counts[hour] += 1
        p.action_counts[ev.action] += 1
        if ev.country:
            p.country_counts[ev.country] += 1
        if ev.duration_seconds is not None:
            p.durations.append(ev.duration_seconds)
        if ev.bytes_transferred is not None:
            p.bytes_samples.append(ev.bytes_transferred)
        if p._last_ts is not None:
            gap = ev.timestamp - p._last_ts
            if 0 < gap < 86400:   # ignore gaps > 1 day (different sessions)
                p.gaps.append(gap)
        p._last_ts = ev.timestamp
        p.sample_count += 1
        return p

    # ── Evaluation ───────────────────────────────────────────────────────────

    def evaluate(self, ev: BehaviorEvent) -> DeviationReport:
        """Evaluate a new event against the user's baseline."""
        # Always update profile so baseline keeps growing
        profile = self._update_profile(ev)

        deviations: List[str] = []
        scores: List[float] = []

        if profile.sample_count < self.min_samples:
            # Not enough data — return neutral report
            return DeviationReport(
                user_id=ev.user_id,
                event=ev,
                deviations=["INSUFFICIENT_BASELINE"],
                risk_score=0.0,
                severity="LOW",
            )

        # 1. Unusual login hour
        hour = datetime.fromtimestamp(ev.timestamp, tz=timezone.utc).hour
        hour_pct = profile.hour_counts.get(hour, 0) / max(profile.sample_count, 1)
        if hour_pct < self.rare_hour_pct:
            deviations.append(f"UNUSUAL_HOUR:{hour:02d}h (only {hour_pct:.1%} of activity)")
            scores.append(min(1.0, (self.rare_hour_pct - hour_pct) / self.rare_hour_pct))

        # 2. Rare or new country
        if ev.country:
            country_pct = profile.country_counts.get(ev.country, 0) / max(profile.sample_count, 1)
            if country_pct < self.rare_country_pct:
                label = "NEW_COUNTRY" if profile.country_counts.get(ev.country, 0) == 0 else "RARE_COUNTRY"
                deviations.append(f"{label}:{ev.country} ({country_pct:.1%})")
                scores.append(min(1.0, 1.0 - country_pct / self.rare_country_pct))

        # 3. Unusual action for this user
        action_pct = profile.action_counts.get(ev.action, 0) / max(profile.sample_count, 1)
        if action_pct < 0.02:
            deviations.append(f"RARE_ACTION:{ev.action} ({action_pct:.1%})")
            scores.append(0.4)

        # 4. Session duration Z-score
        if ev.duration_seconds is not None and len(profile.durations) >= 5:
            z = self._z_score(ev.duration_seconds, profile.durations)
            if z is not None and abs(z) > self.z_threshold:
                direction = "long" if z > 0 else "short"
                deviations.append(f"ABNORMAL_DURATION:{z:.1f}σ ({direction})")
                scores.append(min(1.0, abs(z) / (self.z_threshold * 2)))

        # 5. Bytes transferred Z-score
        if ev.bytes_transferred is not None and len(profile.bytes_samples) >= 5:
            z = self._z_score(ev.bytes_transferred, profile.bytes_samples)
            if z is not None and z > self.z_threshold:
                deviations.append(f"HIGH_DATA_VOLUME:{z:.1f}σ above baseline")
                scores.append(min(1.0, z / (self.z_threshold * 2)))

        risk_score = self._aggregate_score(scores)
        severity = self._severity(risk_score)

        return DeviationReport(
            user_id=ev.user_id,
            event=ev,
            deviations=deviations,
            risk_score=risk_score,
            severity=severity,
        )

    def evaluate_batch(self, events: List[BehaviorEvent]) -> List[DeviationReport]:
        return [self.evaluate(ev) for ev in sorted(events, key=lambda e: e.timestamp)]

    # ── Queries ───────────────────────────────────────────────────────────────

    def profile(self, user_id: str) -> Optional[BaselineProfile]:
        return self._profiles.get(user_id)

    def top_countries(self, user_id: str, n: int = 3) -> List[Tuple[str, float]]:
        p = self._profiles.get(user_id)
        if not p or not p.country_counts:
            return []
        total = sum(p.country_counts.values())
        ranked = sorted(p.country_counts.items(), key=lambda x: x[1], reverse=True)
        return [(c, count / total) for c, count in ranked[:n]]

    def peak_hours(self, user_id: str) -> List[int]:
        p = self._profiles.get(user_id)
        if not p:
            return []
        if not p.hour_counts:
            return []
        max_count = max(p.hour_counts.values())
        return sorted(h for h, c in p.hour_counts.items() if c >= max_count * 0.7)

    def avg_session_duration(self, user_id: str) -> Optional[float]:
        p = self._profiles.get(user_id)
        if not p or not p.durations:
            return None
        return statistics.mean(p.durations)

    # ── Internals ─────────────────────────────────────────────────────────────

    @staticmethod
    def _z_score(value: float, samples: List[float]) -> Optional[float]:
        if len(samples) < 2:
            return None
        mu = statistics.mean(samples)
        sigma = statistics.stdev(samples)
        if sigma == 0:
            return 0.0
        return (value - mu) / sigma

    @staticmethod
    def _aggregate_score(scores: List[float]) -> float:
        if not scores:
            return 0.0
        # Combine: highest single score + dampened contribution from rest
        scores_sorted = sorted(scores, reverse=True)
        combined = scores_sorted[0]
        for s in scores_sorted[1:]:
            combined = combined + s * (1 - combined) * 0.5
        return round(min(combined, 1.0), 4)

    @staticmethod
    def _severity(score: float) -> str:
        if score >= 0.8:
            return "CRITICAL"
        if score >= 0.6:
            return "HIGH"
        if score >= 0.35:
            return "MEDIUM"
        return "LOW"
