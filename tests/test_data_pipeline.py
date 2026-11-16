"""
Unit Tests for Data Pipeline Module
======================================
"""

import pytest
from datetime import datetime
from src.modules.data_pipeline import DataNormalizer, DataRouter, SensorReading


class TestDataNormalizer:
    """Test suite for DataNormalizer."""

    def setup_method(self):
        self.normalizer = DataNormalizer()

    def test_normalize_celsius_reading(self):
        raw = {
            "sensor_id": "s1",
            "timestamp": "2026-08-29T10:00:00Z",
            "readings": [{"type": "temperature", "value": 25.0, "unit": "celsius"}],
        }
        readings = self.normalizer.normalize(raw)
        assert len(readings) == 1
        assert readings[0].value == 25.0
        assert readings[0].sensor_type == "temperature"

    def test_fahrenheit_to_celsius_conversion(self):
        raw = {
            "sensor_id": "s2",
            "timestamp": "2026-08-29T10:00:00Z",
            "readings": [{"type": "temperature", "value": 77.0, "unit": "fahrenheit"}],
        }
        readings = self.normalizer.normalize(raw)
        assert abs(readings[0].value - 25.0) < 0.1
        assert readings[0].unit == "celsius"

    def test_multiple_readings(self):
        raw = {
            "sensor_id": "s3",
            "timestamp": "2026-08-29T10:00:00Z",
            "readings": [
                {"type": "temperature", "value": 25.0},
                {"type": "humidity", "value": 60.0},
            ],
        }
        readings = self.normalizer.normalize(raw)
        assert len(readings) == 2

    def test_quality_score_plausible(self):
        raw = {
            "sensor_id": "s4",
            "timestamp": "2026-08-29T10:00:00Z",
            "readings": [{"type": "temperature", "value": 25.0}],
        }
        readings = self.normalizer.normalize(raw)
        assert readings[0].quality == 1.0

    def test_quality_score_implausible(self):
        raw = {
            "sensor_id": "s5",
            "timestamp": "2026-08-29T10:00:00Z",
            "readings": [{"type": "temperature", "value": 500.0}],
        }
        readings = self.normalizer.normalize(raw)
        assert readings[0].quality < 0.5

    def test_missing_timestamp_uses_now(self):
        raw = {
            "sensor_id": "s6",
            "readings": [{"type": "motion", "value": 1}],
        }
        readings = self.normalizer.normalize(raw)
        assert readings[0].timestamp is not None


class TestDataRouter:
    """Test suite for DataRouter."""

    def setup_method(self):
        self.router = DataRouter()
        self.routed = []

    def _handler(self, reading):
        self.routed.append(reading)

    def test_route_to_registered_handler(self):
        self.router.register_route("temperature", self._handler)
        reading = SensorReading(
            sensor_id="s1", sensor_type="temperature",
            value=25.0, unit="celsius", timestamp=datetime.utcnow(),
        )
        count = self.router.route(reading)
        assert count == 1
        assert len(self.routed) == 1

    def test_no_handler_for_type(self):
        reading = SensorReading(
            sensor_id="s1", sensor_type="pressure",
            value=1013.0, unit="hPa", timestamp=datetime.utcnow(),
        )
        count = self.router.route(reading)
        assert count == 0

    def test_wildcard_handler(self):
        self.router.register_route("*", self._handler)
        reading = SensorReading(
            sensor_id="s1", sensor_type="anything",
            value=42.0, unit="", timestamp=datetime.utcnow(),
        )
        count = self.router.route(reading)
        assert count == 1


class TestRouterFailureLogging:
    def test_failing_handler_is_logged_and_route_continues(self, caplog):
        # Regression: `except Exception: pass` silently swallowed handler
        # failures despite the "Log and continue" contract.
        router = DataRouter()
        calls = []

        def bad(reading):
            raise RuntimeError("boom")

        def good(reading):
            calls.append(reading.sensor_id)

        router.register_route("temperature", bad)
        router.register_route("temperature", good)
        reading = SensorReading(sensor_id="s1", sensor_type="temperature",
                                value=20.0, unit="celsius",
                                timestamp=datetime.now())
        import logging
        with caplog.at_level(logging.ERROR, logger="src.modules.data_pipeline"):
            processed = router.route(reading)
        assert processed == 1  # only the healthy handler counted
        assert calls == ["s1"]  # routing continued past the failure
        assert any("boom" in r.getMessage() or "failed" in r.getMessage().lower()
                   for r in caplog.records)


class TestNormalizerEdgeCases:
    def test_psi_to_bar_conversion(self):
        n = DataNormalizer()
        readings = n.normalize({
            "sensor_id": "p1",
            "timestamp": "2026-01-01T00:00:00",
            "readings": [{"type": "pressure", "value": 14.5038, "unit": "psi"}],
        })
        assert readings[0].unit == "bar"
        assert readings[0].value == pytest.approx(1.0, abs=1e-3)

    def test_zulu_timestamp_parsed(self):
        n = DataNormalizer()
        readings = n.normalize({
            "sensor_id": "s1",
            "timestamp": "2026-01-01T12:00:00Z",
            "readings": [{"type": "motion", "value": 1, "unit": ""}],
        })
        assert readings[0].timestamp.tzinfo is not None

    def test_quality_bands(self):
        n = DataNormalizer()
        assert n._assess_quality(20, "temperature") == 1.0   # in range
        assert n._assess_quality(105, "temperature") == 0.7  # slightly outside
        assert n._assess_quality(500, "temperature") == 0.3  # far outside
        assert n._assess_quality(1, "exotic") == 0.8         # unknown type

    def test_wildcard_runs_with_specific_handlers(self):
        router = DataRouter()
        calls = []
        router.register_route("motion", lambda r: calls.append("specific"))
        router.register_route("*", lambda r: calls.append("wild"))
        reading = SensorReading(sensor_id="m1", sensor_type="motion",
                                value=1.0, unit="", timestamp=datetime.now())
        assert router.route(reading) == 2
        assert calls == ["specific", "wild"]

    def test_route_with_no_handlers_increments_count(self):
        router = DataRouter()
        reading = SensorReading(sensor_id="x", sensor_type="none",
                                value=0.0, unit="", timestamp=datetime.now())
        assert router.route(reading) == 0
        assert router._processed_count == 1
