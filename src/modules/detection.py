import math

class AnomalyDetector:
    """Statistical anomaly detection module v1."""
    SENSITIVITY_LEVELS = {"low": 0.3, "medium": 0.6, "high": 0.9}

    def __init__(self, sensitivity="medium"):
        self.sensitivity = self.SENSITIVITY_LEVELS.get(sensitivity, 0.6)
        self.history = []
        self.baseline = None

    def fit(self, training_data):
        """Fit detector on training data to establish baseline."""
        if not training_data:
            raise ValueError("Training data cannot be empty")
        self.baseline = {
            "mean": sum(training_data) / len(training_data),
            "std": self._std_dev(training_data),
            "min": min(training_data),
            "max": max(training_data),
            "count": len(training_data),
        }
        return self

    def _std_dev(self, data):
        """Calculate standard deviation."""
        mean = sum(data) / len(data)
        variance = sum((x - mean) ** 2 for x in data) / len(data)
        return math.sqrt(variance)

    def detect(self, value):
        """Check if a value is anomalous based on baseline."""
        if self.baseline is None:
            raise RuntimeError("Detector not fitted")
        z_score = abs(value - self.baseline["mean"]) / max(self.baseline["std"], 1e-7)
        is_anomaly = z_score > (3.0 - self.sensitivity * 2)
        self.history.append({"value": value, "z_score": z_score, "anomaly": is_anomaly})
        return {"z_score": round(z_score, 4), "is_anomaly": is_anomaly, "confidence": min(z_score / 5.0, 1.0)}
