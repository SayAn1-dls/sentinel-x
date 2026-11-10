"""
Unit Tests for Sentinel-X Anomaly Detection Module
====================================================
Tests for ThresholdDetector and StatisticalDetector classes.
"""

import pytest
from datetime import datetime
from src.modules.detection import (
    AnomalyDetector,
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


class TestAnomalyDetector:
    """Contract tests for the batch, model-fitting AnomalyDetector."""

    DATA = [float(i % 7) for i in range(50)]  # mean 2.94, std ~2.02

    def test_fit_requires_min_samples(self):
        with pytest.raises(ValueError):
            AnomalyDetector().fit([1.0] * 5)

    def test_fit_computes_baseline(self):
        d = AnomalyDetector().fit(self.DATA)
        assert abs(d.baseline["mean"] - 2.94) < 1e-9
        assert d.baseline["n"] == 50
        assert d.baseline["min"] == 0.0
        assert d.baseline["max"] == 6.0

    def test_detect_requires_fit(self):
        with pytest.raises(RuntimeError):
            AnomalyDetector().detect(1.0)

    def test_normal_value_not_flagged(self):
        d = AnomalyDetector().fit(self.DATA)
        result = d.detect(3.5)
        assert result["is_anomaly"] is False
        assert result["z_score"] < 2.7

    def test_extreme_value_flagged_and_counted(self):
        d = AnomalyDetector().fit(self.DATA)
        before = d.detection_count
        result = d.detect(30.0)
        assert result["is_anomaly"] is True
        assert d.detection_count == before + 1

    def test_sensitivity_changes_threshold(self):
        # z ~ 3.0 for value 9.0: above medium (2.7) and critical (1.65)
        # thresholds, below low (3.6).
        low = AnomalyDetector(sensitivity="low").fit(self.DATA)
        medium = AnomalyDetector(sensitivity="medium").fit(self.DATA)
        critical = AnomalyDetector(sensitivity="critical").fit(self.DATA)
        assert low.detect(9.0)["is_anomaly"] is False
        assert medium.detect(9.0)["is_anomaly"] is True
        assert critical.detect(9.0)["is_anomaly"] is True
        # Near the mean, nothing flags regardless of sensitivity.
        assert critical.detect(3.2)["is_anomaly"] is False

    def test_default_medium_threshold_unchanged(self):
        # Backward compatibility: medium sensitivity keeps the old 2.70
        # cutoff, so z in (2.7, 3.6] still flags at the default.
        d = AnomalyDetector().fit(self.DATA)
        assert d.detect(9.0)["is_anomaly"] is True   # z ~ 3.0 > 2.7
        assert d.detect(8.0)["is_anomaly"] is False  # z ~ 2.5 < 2.7

    def test_history_and_summary(self):
        d = AnomalyDetector(sensitivity="high").fit(self.DATA)
        d.detect(3.0)
        d.detect(25.0)
        summary = d.get_summary()
        assert summary["total_checked"] == 2
        assert summary["anomalies_found"] == 1
        assert summary["baseline_samples"] == 50
        assert summary["sensitivity"] == 0.85
