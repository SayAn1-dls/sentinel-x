"""
Threat Scorer — Sentinel-X
Aggregates signals from multiple detectors into a single normalised
threat score with severity classification and audit metadata.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional

SCORER_VERSION = "1.0.0"

SEVERITY_THRESHOLDS = {
    "CRITICAL": 0.85,
    "HIGH":     0.65,
    "MEDIUM":   0.40,
    "LOW":      0.20,
}

# Default weight per detector type (can be overridden at runtime)
DEFAULT_WEIGHTS: Dict[str, float] = {
    "zscore":        1.0,
    "iqr":           0.9,
    "threshold":     0.8,
    "rate_of_change": 0.75,
    "correlation":   1.1,
    "geolocation":   1.2,
    "cross_protocol": 1.3,
}


@dataclass
class DetectorSignal:
    """A single detector's verdict for one event."""
    detector_id: str
    detector_type: str          # maps to DEFAULT_WEIGHTS key
    anomaly_score: float        # 0.0 – 1.0
    confidence: float = 1.0     # how confident the detector is
    metadata: Dict = field(default_factory=dict)


@dataclass
class ThreatReport:
    """Aggregated threat assessment for one event."""
    event_id: str
    threat_score: float         # 0.0 – 1.0
    severity: str               # CRITICAL / HIGH / MEDIUM / LOW / NOMINAL
    contributing_detectors: List[str]
    dominant_signal: Optional[str]
    explanation: str
    timestamp: float = field(default_factory=time.time)
    raw_signals: List[DetectorSignal] = field(default_factory=list)


class ThreatScorer:
    """
    Weighted-average aggregator for multi-detector anomaly signals.

    Usage
    -----
    scorer = ThreatScorer()
    report = scorer.score(event_id="evt-001", signals=[sig1, sig2, sig3])
    print(report.severity, report.threat_score)
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None,
                 min_signals: int = 1):
        self.weights = {**DEFAULT_WEIGHTS, **(weights or {})}
        self.min_signals = min_signals
        self._history: List[ThreatReport] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def score(self, event_id: str,
              signals: List[DetectorSignal]) -> ThreatReport:
        """Aggregate signals and return a ThreatReport."""
        if len(signals) < self.min_signals:
            raise ValueError(
                f"Need at least {self.min_signals} signal(s), got {len(signals)}"
            )

        weighted_sum, total_weight = 0.0, 0.0
        for sig in signals:
            w = self.weights.get(sig.detector_type, 1.0) * sig.confidence
            weighted_sum += sig.anomaly_score * w
            total_weight += w

        threat_score = round(weighted_sum / total_weight, 4) if total_weight else 0.0
        threat_score = max(0.0, min(1.0, threat_score))

        severity = self._classify(threat_score)
        dominant = self._dominant_signal(signals)
        explanation = self._explain(threat_score, severity, signals, dominant)

        report = ThreatReport(
            event_id=event_id,
            threat_score=threat_score,
            severity=severity,
            contributing_detectors=[s.detector_id for s in signals],
            dominant_signal=dominant,
            explanation=explanation,
            raw_signals=signals,
        )
        self._history.append(report)
        return report

    def batch_score(self, events: List[Dict]) -> List[ThreatReport]:
        """
        Score multiple events at once.
        Each dict must have 'event_id' and 'signals' keys.
        """
        return [self.score(e["event_id"], e["signals"]) for e in events]

    def top_threats(self, n: int = 5) -> List[ThreatReport]:
        """Return the n highest-scoring events from history."""
        return sorted(self._history,
                      key=lambda r: r.threat_score, reverse=True)[:n]

    def summary(self) -> Dict:
        """High-level stats over all scored events."""
        if not self._history:
            return {"total": 0}
        scores = [r.threat_score for r in self._history]
        sev_counts: Dict[str, int] = {}
        for r in self._history:
            sev_counts[r.severity] = sev_counts.get(r.severity, 0) + 1
        return {
            "total": len(self._history),
            "avg_score": round(sum(scores) / len(scores), 4),
            "max_score": max(scores),
            "severity_breakdown": sev_counts,
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _classify(score: float) -> str:
        for label, threshold in SEVERITY_THRESHOLDS.items():
            if score >= threshold:
                return label
        return "NOMINAL"

    @staticmethod
    def _dominant_signal(signals: List[DetectorSignal]) -> Optional[str]:
        if not signals:
            return None
        return max(signals, key=lambda s: s.anomaly_score).detector_id

    @staticmethod
    def _explain(score: float, severity: str,
                 signals: List[DetectorSignal],
                 dominant: Optional[str]) -> str:
        n = len(signals)
        avg_conf = sum(s.confidence for s in signals) / n if n else 0
        return (
            f"{severity} threat (score={score:.3f}) from {n} detector(s); "
            f"avg confidence={avg_conf:.2f}; "
            f"dominant signal='{dominant}'."
        )
