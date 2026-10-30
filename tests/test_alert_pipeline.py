"""Unit tests for the AlertPipeline dedup/correlation/escalation engine."""

import time

import pytest

from src.modules.alert_pipeline import (
    Alert,
    AlertPipeline,
    EscalationRule,
    Incident,
    Severity,
)


def _alert(entity="1.2.3.4", event_type="C2_BEACON", score=0.9, ts=None, source="det"):
    return Alert(source=source, entity=entity, event_type=event_type,
                 score=score, ts=ts if ts is not None else time.time())


class TestSeverity:
    def test_from_score_bands(self):
        assert Severity.from_score(0.9) == Severity.CRITICAL
        assert Severity.from_score(0.85) == Severity.CRITICAL
        assert Severity.from_score(0.7) == Severity.HIGH
        assert Severity.from_score(0.5) == Severity.MEDIUM
        assert Severity.from_score(0.39) == Severity.LOW
        assert Severity.from_score(0.0) == Severity.LOW

    def test_ordering(self):
        assert Severity.LOW < Severity.MEDIUM < Severity.HIGH < Severity.CRITICAL


class TestAlert:
    def test_fingerprint_stable_per_entity_and_type(self):
        a = _alert(score=0.5, ts=1000.0)
        b = _alert(score=0.9, ts=2000.0)
        assert a.fingerprint == b.fingerprint

    def test_fingerprint_differs_by_entity_or_type(self):
        base = _alert()
        assert _alert(entity="5.6.7.8").fingerprint != base.fingerprint
        assert _alert(event_type="EXFIL").fingerprint != base.fingerprint


class TestIncident:
    def test_severity_is_max_of_alerts(self):
        inc = Incident("INC-1", "e1")
        inc.add(_alert(score=0.5))
        inc.add(_alert(score=0.95))
        assert inc.severity == Severity.CRITICAL

    def test_empty_incident_is_low(self):
        assert Incident("INC-1", "e1").severity == Severity.LOW

    def test_score_is_recency_weighted_average(self):
        inc = Incident("INC-1", "e1")
        now = time.time()
        inc.add(_alert(score=0.4, ts=now))
        inc.add(_alert(score=0.8, ts=now))
        # Fresh alerts: age clamps to 1s, so the weighted mean is the plain mean.
        assert inc.score == pytest.approx(0.6, abs=0.01)

    def test_event_types_unique_in_order(self):
        inc = Incident("INC-1", "e1")
        inc.add(_alert(event_type="A"))
        inc.add(_alert(event_type="B"))
        inc.add(_alert(event_type="A"))
        assert inc.event_types == ["A", "B"]

    def test_summary_mentions_key_fields(self):
        inc = Incident("INC-00042", "1.2.3.4")
        inc.add(_alert(score=0.9))
        s = inc.summary()
        assert "INC-00042" in s and "1.2.3.4" in s and "CRITICAL" in s


class TestDedup:
    def test_duplicate_within_window_suppressed(self):
        p = AlertPipeline(dedup_window_s=30)
        t = time.time()
        assert p.ingest(_alert(ts=t)) is not None
        assert p.ingest(_alert(ts=t + 10)) is None

    def test_duplicate_after_window_accepted(self):
        p = AlertPipeline(dedup_window_s=30)
        t = time.time()
        p.ingest(_alert(ts=t))
        assert p.ingest(_alert(ts=t + 31)) is not None

    def test_different_type_same_entity_not_duplicate(self):
        p = AlertPipeline(dedup_window_s=30)
        t = time.time()
        p.ingest(_alert(event_type="A", ts=t))
        assert p.ingest(_alert(event_type="B", ts=t + 1)) is not None

    def test_out_of_order_alert_counts_as_duplicate(self):
        # alert.ts - last < window holds for older timestamps too (negative dt).
        p = AlertPipeline(dedup_window_s=30)
        t = time.time()
        p.ingest(_alert(ts=t))
        assert p.ingest(_alert(ts=t - 10)) is None


class TestIncidentCorrelation:
    def test_same_entity_groups_into_one_incident(self):
        p = AlertPipeline()
        p.ingest(_alert(event_type="A", ts=time.time()))
        p.ingest(_alert(event_type="B", ts=time.time() + 100))
        incidents = p.open_incidents()
        assert len(incidents) == 1
        assert incidents[0].alert_count == 2

    def test_distinct_entities_get_distinct_incidents(self):
        p = AlertPipeline()
        p.ingest(_alert(entity="a", ts=time.time()))
        p.ingest(_alert(entity="b", ts=time.time() + 100))
        assert len(p.open_incidents()) == 2

    def test_incident_ids_increment(self):
        p = AlertPipeline()
        i1 = p.ingest(_alert(entity="a", ts=time.time()))
        i2 = p.ingest(_alert(entity="b", ts=time.time() + 100))
        assert (i1.incident_id, i2.incident_id) == ("INC-00001", "INC-00002")

    def test_flush_stale_closes_quiet_incidents(self):
        p = AlertPipeline(max_incident_gap_s=60)
        stale = p.ingest(_alert(entity="old"))
        fresh = p.ingest(_alert(entity="new"))
        stale.updated_at = time.time() - 120
        closed = p.flush_stale()
        assert closed == [stale]
        assert p.open_incidents() == [fresh]
        assert p.closed_incidents() == [stale]

    def test_stats(self):
        p = AlertPipeline()
        t = time.time()
        p.ingest(_alert(entity="a", ts=t))
        p.ingest(_alert(entity="a", ts=t + 1))  # deduped
        p.ingest(_alert(entity="b", ts=t + 200))
        s = p.stats()
        assert s == {"open": 2, "closed": 0, "dedup_cache_size": 2}


class TestEscalation:
    def test_five_medium_alerts_escalate_to_high(self):
        p = AlertPipeline()
        inc = None
        for i in range(5):
            inc = p.ingest(_alert(event_type=f"T{i}", score=0.55, ts=time.time() + i * 100))
        assert inc.escalated_to == Severity.HIGH
        # Individual alerts are MEDIUM; the incident severity is promoted.
        assert inc.severity == Severity.HIGH

    def test_ten_alerts_escalate_to_critical(self):
        p = AlertPipeline()
        inc = None
        for i in range(10):
            inc = p.ingest(_alert(event_type=f"T{i}", score=0.65, ts=time.time() + i * 100))
        assert inc.severity == Severity.CRITICAL

    def test_three_high_score_alerts_escalate_to_critical(self):
        p = AlertPipeline()
        inc = None
        for i in range(3):
            inc = p.ingest(_alert(event_type=f"T{i}", score=0.85, ts=time.time() + i * 100))
        assert inc.severity == Severity.CRITICAL

    def test_escalation_upgrades_not_latched(self):
        # Reaching HIGH at 5 alerts must not block CRITICAL at 10.
        p = AlertPipeline()
        inc = None
        for i in range(5):
            inc = p.ingest(_alert(event_type=f"T{i}", score=0.65, ts=time.time() + i * 100))
        assert inc.severity == Severity.HIGH
        for i in range(5, 10):
            inc = p.ingest(_alert(event_type=f"T{i}", score=0.65, ts=time.time() + i * 100))
        assert inc.escalated_to == Severity.CRITICAL
        assert inc.severity == Severity.CRITICAL

    def test_below_thresholds_no_escalation(self):
        p = AlertPipeline()
        inc = p.ingest(_alert(score=0.5))
        assert inc.escalated_to is None
        assert inc.severity == Severity.MEDIUM

    def test_custom_rules(self):
        rule = EscalationRule(min_alerts=2, min_score=0.3, promote_to=Severity.CRITICAL)
        p = AlertPipeline(escalation_rules=[rule])
        p.ingest(_alert(event_type="A", score=0.5, ts=time.time()))
        inc = p.ingest(_alert(event_type="B", score=0.5, ts=time.time() + 100))
        assert inc.severity == Severity.CRITICAL

    def test_escalation_never_downgrades_base(self):
        # A CRITICAL alert in a non-escalated incident stays CRITICAL.
        p = AlertPipeline()
        inc = p.ingest(_alert(score=0.95))
        assert inc.severity == Severity.CRITICAL
