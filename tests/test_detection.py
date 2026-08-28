"""
Unit Tests for Sentinel-X Anomaly Detection Module
====================================================
Tests for ThresholdDetector and StatisticalDetector classes.
"""

import pytest
from datetime import datetime
from src.modules.detection import (
    ThresholdDetector,
    StatisticalDetector,
    AnomalyType,
    Severity,
    AnomalyEvent,
)


class TestThresholdDetector:
    """Test suite for ThresholdDetector."""

    def setup_method(self):
        """Set up test fixtures."""
        self.thresholds = {
            "temperature": (10.0, 40.0),
            "humidity": (20.0, 80.0),
            "pressure": (950.0, 1050.0),
        }
        self.detector = ThresholdDetector(self.thresholds)

    def test_value_within_range_returns_none(self):
        """Normal values should not trigger anomaly."""
        result = self.detector.check("temperature", 25.0)
        assert result is None

    def test_value_at_lower_bound_returns_none(self):
        """Values exactly at the lower bound are acceptable."""
        result = self.detector.check("temperature", 10.0)
        assert result is None

    def test_value_at_upper_bound_returns_none(self):
        """Values exactly at the upper bound are acceptable."""
        result = self.detector.check("temperature", 40.0)
        assert result is None

    def test_value_above_upper_bound_triggers_anomaly(self):
        """Values exceeding upper bound should trigger an anomaly."""
        result = self.detector.check("temperature", 45.0)
        assert result is not None
        assert isinstance(result, AnomalyEvent)
        assert result.anomaly_type == AnomalyType.THRESHOLD_BREACH
        assert result.raw_value == 45.0

    def test_value_below_lower_bound_triggers_anomaly(self):
        """Values below lower bound should trigger an anomaly."""
        result = self.detector.check("temperature", 5.0)
        assert result is not None
        assert result.anomaly_type == AnomalyType.THRESHOLD_BREACH

    def test_unknown_sensor_type_returns_none(self):
        """Unknown sensor types should not trigger anomalies."""
        result = self.detector.check("unknown_sensor", 999.0)
        assert result is None

    def test_breach_count_increments(self):
        """Each breach should increment the breach counter."""
        self.detector.check("temperature", 50.0)
        self.detector.check("temperature", 55.0)
        assert self.detector.breach_count["temperature"] == 2

    def test_severity_scales_with_deviation(self):
        """Large deviations should produce higher severity."""
        mild = self.detector.check("temperature", 42.0)
        extreme = self.detector.check("temperature", 80.0)
        assert mild is not None
        assert extreme is not None
        assert extreme.severity == Severity.HIGH

    def test_multiple_sensor_types(self):
        """Detector should handle multiple sensor types independently."""
        temp_result = self.detector.check("temperature", 50.0)
        humidity_result = self.detector.check("humidity", 30.0)
        assert temp_result is not None
        assert humidity_result is None


class TestStatisticalDetector:
    """Test suite for StatisticalDetector."""

    def setup_method(self):
        """Set up test fixtures."""
        self.detector = StatisticalDetector(window_size=50, z_threshold=3.0)

    def test_insufficient_data_returns_none(self):
        """Should not flag anomalies with fewer than 10 observations."""
        for i in range(5):
            result = self.detector.ingest("sensor_a", 20.0 + i)
        assert result is None

    def test_normal_values_no_anomaly(self):
        """Consistent values should not trigger anomalies."""
        for i in range(20):
            result = self.detector.ingest("sensor_b", 20.0 + (i % 3))
        assert result is None

    def test_outlier_detected(self):
        """Extreme outlier after stable readings should be flagged."""
        for i in range(30):
            self.detector.ingest("sensor_c", 20.0)
        result = self.detector.ingest("sensor_c", 200.0)
        assert result is not None
        assert result.anomaly_type == AnomalyType.STATISTICAL_OUTLIER
        assert "z_score" in result.metadata

    def test_z_score_in_metadata(self):
        """Anomaly metadata should include computed z-score."""
        for i in range(30):
            self.detector.ingest("sensor_d", 50.0)
        result = self.detector.ingest("sensor_d", 500.0)
        assert result is not None
        assert result.metadata["z_score"] > 3.0

    def test_independent_sensor_windows(self):
        """Different sensors should have independent windows."""
        for i in range(20):
            self.detector.ingest("sensor_e", 10.0)
            self.detector.ingest("sensor_f", 100.0)
        result_e = self.detector.ingest("sensor_e", 10.0)
        result_f = self.detector.ingest("sensor_f", 100.0)
        assert result_e is None
        assert result_f is None
