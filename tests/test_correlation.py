"""
Unit Tests for Event Correlation Engine
==========================================
"""

import pytest
from datetime import datetime, timedelta
from src.modules.correlation import (
    CorrelationEngine,
    CorrelationRule,
    CorrelatedIncident,
)


class TestCorrelationEngine:
    """Test suite for CorrelationEngine."""

    def setup_method(self):
        self.engine = CorrelationEngine(buffer_duration_seconds=300)
        self.rule = CorrelationRule(
            rule_id="cr-001",
            name="Multi-sensor temperature alert",
            description="Temperature anomalies from multiple sensors",
            required_events=["threshold_breach"],
            time_window_seconds=120,
            min_events=2,
            severity_override="critical",
        )
        self.engine.add_rule(self.rule)

    def _make_event(self, event_type="threshold_breach", sensor_id="s1"):
        return {
            "type": event_type,
            "sensor_id": sensor_id,
            "timestamp": datetime.utcnow(),
            "value": 55.0,
        }

    def test_single_event_no_incident(self):
        incidents = self.engine.ingest_event(self._make_event())
        assert len(incidents) == 0

    def test_two_events_trigger_incident(self):
        self.engine.ingest_event(self._make_event(sensor_id="s1"))
        incidents = self.engine.ingest_event(self._make_event(sensor_id="s2"))
        assert len(incidents) == 1
        assert incidents[0].severity == "critical"
        assert incidents[0].sensor_count == 2

    def test_non_matching_events_no_incident(self):
        self.engine.ingest_event(self._make_event(event_type="rate_anomaly"))
        incidents = self.engine.ingest_event(self._make_event(event_type="rate_anomaly"))
        assert len(incidents) == 0

    def test_incident_has_correct_event_count(self):
        for i in range(3):
            self.engine.ingest_event(self._make_event(sensor_id=f"s{i}"))
        incidents = self.engine.ingest_event(self._make_event(sensor_id="s3"))
        assert len(incidents) >= 1
        assert len(incidents[0].events) >= 2

    def test_get_recent_incidents(self):
        self.engine.ingest_event(self._make_event())
        self.engine.ingest_event(self._make_event(sensor_id="s2"))
        recent = self.engine.get_recent_incidents(limit=5)
        assert len(recent) >= 1

    def test_incident_id_format(self):
        self.engine.ingest_event(self._make_event())
        incidents = self.engine.ingest_event(self._make_event(sensor_id="s2"))
        assert incidents[0].incident_id.startswith("inc-")


class TestDuplicateSuppression:
    """A rule must not re-fire on evidence already reported (regression:
    every ingest used to produce a duplicate incident once a rule was
    satisfied, causing an alert storm from a single event pair)."""

    def setup_method(self):
        self.engine = CorrelationEngine(buffer_duration_seconds=300)
        self.engine.add_rule(CorrelationRule(
            rule_id="cr-dup",
            name="dup",
            description="dup",
            required_events=["threshold_breach"],
            time_window_seconds=120,
            min_events=2,
        ))

    def _event(self, event_type="threshold_breach", sensor_id="s1"):
        return {"type": event_type, "sensor_id": sensor_id,
                "timestamp": datetime.utcnow()}

    def test_unrelated_ingest_does_not_refire(self):
        self.engine.ingest_event(self._event(sensor_id="s1"))
        assert len(self.engine.ingest_event(self._event(sensor_id="s2"))) == 1
        assert self.engine.ingest_event(self._event(event_type="heartbeat")) == []
        assert self.engine.ingest_event(self._event(event_type="heartbeat")) == []
        assert len(self.engine._incidents) == 1

    def test_new_matching_event_retriggers_once(self):
        self.engine.ingest_event(self._event(sensor_id="s1"))
        self.engine.ingest_event(self._event(sensor_id="s2"))
        incidents = self.engine.ingest_event(self._event(sensor_id="s3"))
        assert len(incidents) == 1
        assert len(incidents[0].events) == 3
        assert self.engine.ingest_event(self._event(event_type="heartbeat")) == []

    def test_distinct_event_pairs_each_fire(self):
        self.engine.ingest_event(self._event(sensor_id="s1"))
        self.engine.ingest_event(self._event(sensor_id="s2"))
        self.engine.ingest_event(self._event(sensor_id="s3"))
        incidents = self.engine.ingest_event(self._event(sensor_id="s4"))
        assert len(incidents) == 1


class TestTimeWindow:
    """Events outside the rule's time window must not count toward it."""

    def setup_method(self):
        self.engine = CorrelationEngine(buffer_duration_seconds=600)
        self.engine.add_rule(CorrelationRule(
            rule_id="cr-win",
            name="win",
            description="win",
            required_events=["threshold_breach"],
            time_window_seconds=120,
            min_events=2,
        ))

    def _event(self, sensor_id, age_seconds=0):
        return {"type": "threshold_breach", "sensor_id": sensor_id,
                "timestamp": datetime.utcnow() - timedelta(seconds=age_seconds)}

    def test_event_older_than_window_not_counted(self):
        self.engine.ingest_event(self._event("s1", age_seconds=300))
        incidents = self.engine.ingest_event(self._event("s2"))
        assert incidents == []

    def test_event_inside_window_counted(self):
        self.engine.ingest_event(self._event("s1", age_seconds=60))
        incidents = self.engine.ingest_event(self._event("s2"))
        assert len(incidents) == 1


class TestIncidentFields:
    """Pin incident field semantics."""

    def setup_method(self):
        self.engine = CorrelationEngine(buffer_duration_seconds=300)

    def _event(self, sensor_id):
        return {"type": "threshold_breach", "sensor_id": sensor_id,
                "timestamp": datetime.utcnow()}

    def _fire(self, n_sensors, min_events=2, severity_override=None):
        self.engine.add_rule(CorrelationRule(
            rule_id="cr-f", name="f", description="f",
            required_events=["threshold_breach"], time_window_seconds=120,
            min_events=min_events, severity_override=severity_override))
        incidents = []
        for i in range(n_sensors):
            incidents = self.engine.ingest_event(self._event(f"s{i}"))
        return incidents

    def test_default_severity_is_high(self):
        incidents = self._fire(2)
        assert incidents[0].severity == "high"

    def test_confidence_scales_with_evidence(self):
        incidents = self._fire(2)
        assert incidents[0].confidence == pytest.approx(0.5)

    def test_confidence_caps_at_one(self):
        incidents = self._fire(4)
        assert incidents[-1].confidence == 1.0

    def test_first_and_last_event_times(self):
        incidents = self._fire(3)
        incident = incidents[-1]
        times = [e["timestamp"] for e in incident.events]
        assert incident.first_event_time == min(times)
        assert incident.last_event_time == max(times)
