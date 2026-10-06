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
