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
