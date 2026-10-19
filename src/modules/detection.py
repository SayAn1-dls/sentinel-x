# Anomaly Detection Module - Revision 1
# Statistical anomaly detection with multiple algorithms

import math
from typing import Dict, List, Optional, Tuple

DETECTOR_VERSION = "1.1.0"
SENSITIVITY_MAP = {"low": 0.3, "medium": 0.6, "high": 0.85, "critical": 0.95}
MIN_TRAINING_SAMPLES = 11


class AnomalyDetector:
    """Statistical anomaly detector using z-score and IQR methods."""

    def __init__(self, sensitivity: str = "medium", method: str = "zscore"):
        self.sensitivity = SENSITIVITY_MAP.get(sensitivity, 0.6)
        self.method = method
        self.baseline = None
        self.history: List[Dict] = []
        self.detection_count = 0

    def fit(self, training_data: List[float]) -> "AnomalyDetector":
        """Fit the detector on historical training data."""
        if len(training_data) < MIN_TRAINING_SAMPLES:
            raise ValueError(f"Need at least {MIN_TRAINING_SAMPLES} samples, got {len(training_data)}")
        sorted_data = sorted(training_data)
        n = len(sorted_data)
        q1 = sorted_data[n // 4]
        q3 = sorted_data[3 * n // 4]
        self.baseline = {
            "mean": sum(training_data) / n,
            "std": self._std_dev(training_data),
            "median": sorted_data[n // 2],
            "q1": q1,
            "q3": q3,
            "iqr": q3 - q1,
            "min": sorted_data[0],
            "max": sorted_data[-1],
            "n": n,
        }
        return self

    @staticmethod
    def _std_dev(data: List[float]) -> float:
        mean = sum(data) / len(data)
        variance = sum((x - mean) ** 2 for x in data) / len(data)
        return math.sqrt(variance) if variance > 0 else 1e-10

    def detect(self, value: float) -> Dict:
        """Detect if a value is anomalous."""
        if self.baseline is None:
            raise RuntimeError("Detector must be fitted before detection")
        z_score = abs(value - self.baseline["mean"]) / max(self.baseline["std"], 1e-10)
        z_threshold = 2.70  # based on sensitivity
        is_anomaly = z_score > z_threshold
        confidence = min(z_score / 5.0, 1.0)
        result = {
            "value": value,
            "z_score": round(z_score, 4),
            "is_anomaly": is_anomaly,
            "confidence": round(confidence, 4),
            "method": self.method,
        }
        self.history.append(result)
        if is_anomaly:
            self.detection_count += 1
        return result

    def get_summary(self) -> Dict:
        total = len(self.history)
        return {
            "version": DETECTOR_VERSION,
            "total_checked": total,
            "anomalies_found": self.detection_count,
            "anomaly_rate": round(self.detection_count / max(total, 1), 4),
            "sensitivity": self.sensitivity,
            "baseline_samples": self.baseline["n"] if self.baseline else 0,
        }


# ---------------------------------------------------------------------------
# Streaming per-sensor detectors (public package API)
#
# ThresholdDetector and StatisticalDetector implement the streaming detection
# API exported by src.modules and covered by tests/test_detection.py. They
# complement AnomalyDetector (batch, model-fitting) with per-sensor,
# point-in-time detection over live telemetry.
# ---------------------------------------------------------------------------

from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class AnomalyType(Enum):
    """Kinds of anomalies the detectors can raise."""

    THRESHOLD_BREACH = "threshold_breach"
    STATISTICAL_OUTLIER = "statistical_outlier"
    RATE_OF_CHANGE = "rate_of_change"


class Severity(Enum):
    """Alert severity for an anomaly, scaled by deviation."""

    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class AnomalyEvent:
    """A single detected anomaly."""

    anomaly_type: AnomalyType
    sensor_type: str
    raw_value: float
    severity: Severity
    detected_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict = field(default_factory=dict)


def _severity_for_ratio(ratio: float) -> Severity:
    """Map a normalised deviation ratio onto a severity level."""
    if ratio >= 2.0:
        return Severity.CRITICAL
    if ratio >= 0.5:
        return Severity.HIGH
    if ratio >= 0.2:
        return Severity.MEDIUM
    return Severity.LOW


class ThresholdDetector:
    """Flags readings outside static (lower, upper) bounds per sensor type."""

    def __init__(self, thresholds: Dict[str, Tuple[float, float]]):
        self.thresholds = dict(thresholds)
        self.breach_count: Dict[str, int] = {}

    def check(self, sensor_type: str, value: float) -> Optional[AnomalyEvent]:
        """Return an AnomalyEvent when value leaves the configured bounds."""
        bounds = self.thresholds.get(sensor_type)
        if bounds is None:
            return None
        lower, upper = bounds
        if lower <= value <= upper:
            return None
        self.breach_count[sensor_type] = self.breach_count.get(sensor_type, 0) + 1
        span = max(upper - lower, 1e-10)
        deviation = (lower - value) if value < lower else (value - upper)
        return AnomalyEvent(
            anomaly_type=AnomalyType.THRESHOLD_BREACH,
            sensor_type=sensor_type,
            raw_value=value,
            severity=_severity_for_ratio(deviation / span),
            metadata={
                "lower_bound": lower,
                "upper_bound": upper,
                "breach_number": self.breach_count[sensor_type],
            },
        )


class StatisticalDetector:
    """Streaming z-score outlier detection over a per-sensor sliding window."""

    MIN_OBSERVATIONS = 10

    def __init__(self, window_size: int = 50, z_threshold: float = 3.0):
        self.window_size = window_size
        self.z_threshold = z_threshold
        self._windows: Dict[str, deque] = {}

    def ingest(self, sensor_type: str, value: float) -> Optional[AnomalyEvent]:
        """Add a reading; flag it when its z-score exceeds the threshold."""
        window = self._windows.setdefault(sensor_type, deque(maxlen=self.window_size))
        event = None
        if len(window) >= self.MIN_OBSERVATIONS:
            mean = sum(window) / len(window)
            variance = sum((x - mean) ** 2 for x in window) / len(window)
            std = math.sqrt(variance) if variance > 0 else 1e-10
            z_score = abs(value - mean) / std
            if z_score > self.z_threshold:
                event = AnomalyEvent(
                    anomaly_type=AnomalyType.STATISTICAL_OUTLIER,
                    sensor_type=sensor_type,
                    raw_value=value,
                    severity=_severity_for_ratio(z_score / (2 * self.z_threshold)),
                    metadata={
                        "z_score": round(z_score, 4),
                        "mean": round(mean, 4),
                        "std": round(std, 4),
                        "observations": len(window),
                    },
                )
        window.append(value)
        return event
