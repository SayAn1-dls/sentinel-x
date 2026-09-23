"""Tests for ThreatScorer — src/modules/threat_scorer.py"""

import pytest
from src.modules.threat_scorer import (
    ThreatScorer, DetectorSignal, ThreatReport,
    SEVERITY_THRESHOLDS, DEFAULT_WEIGHTS,
)


# ── Helpers ────────────────────────────────────────────────────────────────

def make_signal(detector_id="d1", detector_type="zscore",
                anomaly_score=0.5, confidence=1.0):
    return DetectorSignal(
        detector_id=detector_id,
        detector_type=detector_type,
        anomaly_score=anomaly_score,
        confidence=confidence,
    )


# ── Basic scoring ──────────────────────────────────────────────────────────

def test_single_signal_score():
    scorer = ThreatScorer()
    sig = make_signal(anomaly_score=0.9, detector_type="zscore")
    report = scorer.score("evt-001", [sig])
    assert isinstance(report, ThreatReport)
    assert 0.0 <= report.threat_score <= 1.0
    assert report.event_id == "evt-001"


def test_score_clamped_between_0_and_1():
    scorer = ThreatScorer()
    sig = make_signal(anomaly_score=1.5)   # out-of-range input
    report = scorer.score("evt-x", [sig])
    assert report.threat_score <= 1.0


def test_zero_anomaly_score_is_nominal():
    scorer = ThreatScorer()
    sig = make_signal(anomaly_score=0.0)
    report = scorer.score("evt-0", [sig])
    assert report.severity == "NOMINAL"
    assert report.threat_score == 0.0


def test_full_anomaly_score_is_critical():
    scorer = ThreatScorer()
    sig = make_signal(anomaly_score=1.0, confidence=1.0)
    report = scorer.score("evt-crit", [sig])
    assert report.severity == "CRITICAL"


# ── Severity thresholds ────────────────────────────────────────────────────

@pytest.mark.parametrize("score,expected_severity", [
    (0.90, "CRITICAL"),
    (0.70, "HIGH"),
    (0.50, "MEDIUM"),
    (0.25, "LOW"),
    (0.05, "NOMINAL"),
])
def test_severity_classification(score, expected_severity):
    scorer = ThreatScorer()
    sig = make_signal(anomaly_score=score, detector_type="threshold", confidence=1.0)
    report = scorer.score(f"evt-{score}", [sig])
    assert report.severity == expected_severity


# ── Weighted aggregation ───────────────────────────────────────────────────

def test_weighted_average_of_multiple_signals():
    scorer = ThreatScorer()
    signals = [
        make_signal("d1", "zscore",        anomaly_score=0.8, confidence=1.0),
        make_signal("d2", "threshold",     anomaly_score=0.4, confidence=1.0),
        make_signal("d3", "rate_of_change",anomaly_score=0.6, confidence=1.0),
    ]
    report = scorer.score("evt-multi", signals)
    # All detectors contribute — score should be between min and max
    assert 0.4 <= report.threat_score <= 0.8


def test_high_confidence_signal_dominates():
    scorer = ThreatScorer()
    signals = [
        make_signal("low",  "zscore", anomaly_score=0.1, confidence=0.1),
        make_signal("high", "zscore", anomaly_score=0.9, confidence=1.0),
    ]
    report = scorer.score("evt-conf", signals)
    assert report.threat_score > 0.7


def test_custom_weights_applied():
    custom_w = {"zscore": 10.0, "threshold": 0.1}
    scorer = ThreatScorer(weights=custom_w)
    signals = [
        make_signal("d1", "zscore",    anomaly_score=1.0, confidence=1.0),
        make_signal("d2", "threshold", anomaly_score=0.0, confidence=1.0),
    ]
    report = scorer.score("evt-w", signals)
    # zscore has 100x the weight of threshold, so score should be close to 1
    assert report.threat_score > 0.85


# ── Dominant signal ────────────────────────────────────────────────────────

def test_dominant_signal_is_highest_anomaly():
    scorer = ThreatScorer()
    signals = [
        make_signal("weak",   "zscore", anomaly_score=0.2),
        make_signal("strong", "zscore", anomaly_score=0.9),
        make_signal("mid",    "zscore", anomaly_score=0.5),
    ]
    report = scorer.score("evt-dom", signals)
    assert report.dominant_signal == "strong"


# ── Batch scoring ──────────────────────────────────────────────────────────

def test_batch_score_returns_all_reports():
    scorer = ThreatScorer()
    events = [
        {"event_id": f"evt-{i}", "signals": [make_signal(anomaly_score=i * 0.1)]}
        for i in range(1, 6)
    ]
    reports = scorer.batch_score(events)
    assert len(reports) == 5
    assert [r.event_id for r in reports] == [f"evt-{i}" for i in range(1, 6)]


# ── History & summary ──────────────────────────────────────────────────────

def test_top_threats_ordering():
    scorer = ThreatScorer()
    for score in [0.3, 0.9, 0.5, 0.95, 0.1]:
        scorer.score(f"evt-{score}", [make_signal(anomaly_score=score)])
    top = scorer.top_threats(n=2)
    assert top[0].threat_score >= top[1].threat_score
    assert top[0].threat_score == pytest.approx(0.95, abs=0.01)


def test_summary_contains_correct_total():
    scorer = ThreatScorer()
    for i in range(4):
        scorer.score(f"e{i}", [make_signal(anomaly_score=0.5)])
    s = scorer.summary()
    assert s["total"] == 4
    assert "severity_breakdown" in s
    assert "avg_score" in s


def test_empty_summary():
    scorer = ThreatScorer()
    assert scorer.summary() == {"total": 0}


# ── Edge cases ─────────────────────────────────────────────────────────────

def test_min_signals_enforcement():
    scorer = ThreatScorer(min_signals=3)
    with pytest.raises(ValueError, match="at least 3"):
        scorer.score("evt-bad", [make_signal()])


def test_unknown_detector_type_uses_default_weight():
    scorer = ThreatScorer()
    sig = make_signal(detector_type="unknown_detector", anomaly_score=0.7)
    report = scorer.score("evt-unk", [sig])
    assert report.threat_score == pytest.approx(0.7, abs=0.01)


def test_explanation_string_is_non_empty():
    scorer = ThreatScorer()
    report = scorer.score("evt-exp", [make_signal(anomaly_score=0.6)])
    assert len(report.explanation) > 0
    assert "dominant" in report.explanation.lower()
