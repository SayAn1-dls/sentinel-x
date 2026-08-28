"""
Sentinel-X Anomaly Detection Module
=====================================
Implements anomaly detection algorithms for sensor data streams,
network traffic analysis, and behavioral pattern recognition.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


class AnomalyType(Enum):
    """Classification of detected anomalies."""
    THRESHOLD_BREACH = "threshold_breach"
    STATISTICAL_OUTLIER = "statistical_outlier"
    PATTERN_DEVIATION = "pattern_deviation"
    RATE_ANOMALY = "rate_anomaly"
    SEQUENCE_ANOMALY = "sequence_anomaly"


class Severity(Enum):
    """Severity levels for detected anomalies."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class AnomalyEvent:
    """Represents a detected anomaly event."""
    event_id: str
    anomaly_type: AnomalyType
    severity: Severity
    source_sensor: str
    timestamp: datetime
    description: str
    raw_value: float
    expected_range: Tuple[float, float]
    confidence: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class ThresholdDetector:
    """Detect anomalies based on configurable threshold boundaries.

    This detector monitors sensor readings against predefined upper
    and lower thresholds, triggering alerts when values exceed bounds.

    Attributes:
        thresholds: Dictionary mapping sensor types to (min, max) tuples.
        breach_count: Running count of threshold breaches per sensor.
    """

    def __init__(self, thresholds: Dict[str, Tuple[float, float]]):
        """Initialize with threshold configuration.

        Args:
            thresholds: Mapping of sensor_type -> (lower_bound, upper_bound).
        """
        self.thresholds = thresholds
        self.breach_count: Dict[str, int] = {}

    def check(self, sensor_type: str, value: float) -> Optional[AnomalyEvent]:
        """Check a single reading against configured thresholds.

        Args:
            sensor_type: Type identifier for the sensor.
            value: Current sensor reading.

        Returns:
            AnomalyEvent if threshold breached, None otherwise.
        """
        if sensor_type not in self.thresholds:
            return None

        lower, upper = self.thresholds[sensor_type]
        if lower <= value <= upper:
            return None

        self.breach_count[sensor_type] = self.breach_count.get(sensor_type, 0) + 1

        severity = Severity.HIGH if abs(value - upper) > (upper - lower) else Severity.MEDIUM

        return AnomalyEvent(
            event_id=f"thr-{sensor_type}-{self.breach_count[sensor_type]}",
            anomaly_type=AnomalyType.THRESHOLD_BREACH,
            severity=severity,
            source_sensor=sensor_type,
            timestamp=datetime.utcnow(),
            description=f"{sensor_type} value {value} outside range [{lower}, {upper}]",
            raw_value=value,
            expected_range=(lower, upper),
            confidence=0.95,
        )
