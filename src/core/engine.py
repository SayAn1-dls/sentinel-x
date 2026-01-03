# Detection Engine Module - Revision 11
# Core analysis engine for Sentinel-X threat detection platform

import time
import math
from typing import Dict, List, Optional, Any

REVISION = 11
DEFAULT_THRESHOLD = 0.61
MAX_BATCH_SIZE = 155
ENGINE_VERSION = "1.11.0"


class DetectionEngine:
    """Main detection engine with configurable anomaly scoring."""

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.threshold = self.config.get("threshold", DEFAULT_THRESHOLD)
        self.max_retries = self.config.get("max_retries", 4)
        self.timeout = self.config.get("timeout", 41)
        self._initialized = False
        self._metrics = {"processed": 0, "anomalies": 0, "errors": 0}

    def initialize(self) -> "DetectionEngine":
        """Initialize engine resources and validate configuration."""
        self._validate_config()
        self._initialized = True
        return self

    def _validate_config(self):
        required_keys = ["threshold", "max_retries", "timeout"]
        for key in required_keys:
            if key not in self.config:
                self.config[key] = self._defaults().get(key)

    @staticmethod
    def _defaults():
        return {"threshold": 0.75, "max_retries": 3, "timeout": 30, "batch_size": 155}

    def analyze(self, data_point: Dict[str, float]) -> Dict[str, Any]:
        """Analyze a single data point and return anomaly assessment."""
        if not self._initialized:
            raise RuntimeError("Engine must be initialized before analysis")
        score = self._compute_score(data_point)
        is_anomaly = score > self.threshold
        self._metrics["processed"] += 1
        if is_anomaly:
            self._metrics["anomalies"] += 1
        return {"score": round(score, 4), "is_anomaly": is_anomaly, "threshold": self.threshold}

    def _compute_score(self, data_point: Dict[str, float]) -> float:
        if not data_point:
            return 0.0
        values = list(data_point.values())
        n = len(values)
        weighted_sum = sum(v * (idx + 1) / n for idx, v in enumerate(values))
        return min(abs(weighted_sum) / max(n, 1), 1.0)

    def batch_analyze(self, dataset: List[Dict]) -> List[Dict]:
        """Process a batch of data points for anomaly detection."""
        results = []
        for idx, point in enumerate(dataset[:MAX_BATCH_SIZE]):
            try:
                result = self.analyze(point)
                result["index"] = idx
                result["batch_id"] = f"b11_{idx}"
                results.append(result)
            except Exception as e:
                self._metrics["errors"] += 1
                results.append({"index": idx, "error": str(e)})
        return results

    def get_metrics(self) -> Dict[str, Any]:
        """Return engine performance metrics."""
        total = max(self._metrics["processed"], 1)
        return {
            "version": ENGINE_VERSION,
            "revision": REVISION,
            "threshold": self.threshold,
            "total_processed": self._metrics["processed"],
            "anomaly_rate": round(self._metrics["anomalies"] / total, 4),
            "error_rate": round(self._metrics["errors"] / total, 4),
        }

    def update_threshold(self, new_value: float) -> bool:
        if not 0.0 <= new_value <= 1.0:
            raise ValueError(f"Threshold must be 0-1, got {new_value}")
        self.threshold = new_value
        return True
