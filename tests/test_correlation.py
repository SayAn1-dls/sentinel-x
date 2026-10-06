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
