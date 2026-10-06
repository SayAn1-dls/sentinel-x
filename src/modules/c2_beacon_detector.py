"""
Sentinel-X C2 Beacon Detector
==============================
Identifies command-and-control beaconing by analysing the regularity
of outbound connection intervals per (source, destination) pair.
Implants usually call home on a fixed timer with small jitter, which
produces a low coefficient of variation and consistent payload sizes.
"""

import statistics
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass
class ConnectionRecord:
    """A single outbound connection observation (e.g. from flow logs)."""
    src_ip: str
    dst_host: str
    dst_port: int
    timestamp: float
    bytes_out: int = 0


@dataclass
class BeaconCandidate:
    """Scored result for one source/destination channel."""
    src_ip: str
    dst_host: str
    dst_port: int
    connections: int
    mean_interval: float
    interval_cv: float
    size_cv: float
    score: float
    reasons: List[str] = field(default_factory=list)


@dataclass
class BeaconConfig:
    """Tunable thresholds for beacon detection."""
    min_connections: int = 8
    max_interval_cv: float = 0.25
    max_size_cv: float = 0.3
    min_interval_seconds: float = 5.0
    report_threshold: float = 0.6
    allowlisted_hosts: Tuple[str, ...] = ("time.windows.com", "ntp.ubuntu.com")


class C2BeaconDetector:
    """Groups flows into channels and scores their periodicity."""

    def __init__(self, config: Optional[BeaconConfig] = None):
        self.config = config or BeaconConfig()
        self._channels: Dict[Tuple[str, str, int], List[ConnectionRecord]] = defaultdict(list)

    def ingest(self, record: ConnectionRecord) -> None:
        """Add a connection record unless the destination is allowlisted."""
        if record.dst_host in self.config.allowlisted_hosts:
            return
        self._channels[(record.src_ip, record.dst_host, record.dst_port)].append(record)

    def ingest_many(self, records: List[ConnectionRecord]) -> int:
        """Bulk ingest; returns number of records accepted."""
        before = sum(len(v) for v in self._channels.values())
        for r in records:
            self.ingest(r)
        return sum(len(v) for v in self._channels.values()) - before

    @staticmethod
    def coefficient_of_variation(values: List[float]) -> float:
        """Standard deviation divided by mean (0 when perfectly regular)."""
        if len(values) < 2:
            return float("inf")
        mean = statistics.fmean(values)
        if mean == 0:
            return float("inf")
        return statistics.pstdev(values) / mean

    @staticmethod
    def intervals(records: List[ConnectionRecord]) -> List[float]:
        """Return inter-arrival times for time-ordered records."""
        ordered = sorted(r.timestamp for r in records)
        return [b - a for a, b in zip(ordered, ordered[1:])]

    @staticmethod
    def trim_outliers(values: List[float], pct: float = 0.1) -> List[float]:
        """Drop the top/bottom pct of values to resist sleep/wake gaps."""
        if len(values) < 10:
            return list(values)
        k = int(len(values) * pct)
        ordered = sorted(values)
        return ordered[k:len(ordered) - k] if k else ordered

    def score_channel(self, key: Tuple[str, str, int]) -> Optional[BeaconCandidate]:
        """Compute a 0..1 beacon score for a single channel."""
        records = self._channels.get(key, [])
        if len(records) < self.config.min_connections:
            return None
        gaps = self.trim_outliers(self.intervals(records))
        if not gaps:
            return None
        mean_gap = statistics.fmean(gaps)
        if mean_gap < self.config.min_interval_seconds:
            return None
        icv = self.coefficient_of_variation(gaps)
        scv = self.coefficient_of_variation([float(r.bytes_out) for r in records])
        score, reasons = 0.0, []
        if icv <= self.config.max_interval_cv:
            score += 0.6 * (1 - icv / self.config.max_interval_cv)
            reasons.append(f"regular interval (cv={icv:.3f})")
        if scv <= self.config.max_size_cv:
            score += 0.25
            reasons.append(f"uniform payload size (cv={scv:.3f})")
        score += min(0.15, len(records) / 500)
        return BeaconCandidate(key[0], key[1], key[2], len(records), round(mean_gap, 2),
                               round(icv, 4), round(scv, 4), round(min(score, 1.0), 3), reasons)

    def analyze(self) -> List[BeaconCandidate]:
        """Score every channel and return those above the report threshold."""
        results = []
        for key in self._channels:
            cand = self.score_channel(key)
            if cand and cand.score >= self.config.report_threshold:
                results.append(cand)
        return sorted(results, key=lambda c: c.score, reverse=True)

    def reset(self) -> None:
        """Clear all buffered channel data."""
        self._channels.clear()
