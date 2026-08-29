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


class StatisticalDetector:
    """Detect anomalies using statistical methods (Z-score, IQR).

    Maintains a sliding window of recent observations to compute
    running statistics and identify outliers.

    Attributes:
        window_size: Number of recent observations to maintain.
        z_threshold: Z-score threshold for outlier detection.
    """

    def __init__(self, window_size: int = 100, z_threshold: float = 3.0):
        """Initialize statistical detector.

        Args:
            window_size: Size of the sliding observation window.
            z_threshold: Number of standard deviations for outlier classification.
        """
        self.window_size = window_size
        self.z_threshold = z_threshold
        self._windows: Dict[str, List[float]] = {}

    def _compute_stats(self, values: List[float]) -> Tuple[float, float]:
        """Compute mean and standard deviation of a value list.

        Args:
            values: List of numeric observations.

        Returns:
            Tuple of (mean, standard_deviation).
        """
        n = len(values)
        if n == 0:
            return 0.0, 0.0
        mean = sum(values) / n
        variance = sum((x - mean) ** 2 for x in values) / n
        return mean, variance ** 0.5

    def ingest(self, sensor_id: str, value: float) -> Optional[AnomalyEvent]:
        """Ingest a new observation and check for statistical anomalies.

        Args:
            sensor_id: Identifier for the data source.
            value: New observation value.

        Returns:
            AnomalyEvent if the value is a statistical outlier, None otherwise.
        """
        if sensor_id not in self._windows:
            self._windows[sensor_id] = []

        window = self._windows[sensor_id]
        window.append(value)
        if len(window) > self.window_size:
            window.pop(0)

        if len(window) < 10:
            return None  # Not enough data for reliable statistics

        mean, std = self._compute_stats(window[:-1])  # Exclude current value
        if std == 0:
            return None

        z_score = abs(value - mean) / std
        if z_score < self.z_threshold:
            return None

        return AnomalyEvent(
            event_id=f"stat-{sensor_id}-{len(window)}",
            anomaly_type=AnomalyType.STATISTICAL_OUTLIER,
            severity=Severity.HIGH if z_score > 4.0 else Severity.MEDIUM,
            source_sensor=sensor_id,
            timestamp=datetime.utcnow(),
            description=f"Z-score {z_score:.2f} exceeds threshold {self.z_threshold}",
            raw_value=value,
            expected_range=(mean - self.z_threshold * std, mean + self.z_threshold * std),
            confidence=min(z_score / 5.0, 1.0),
            metadata={"z_score": z_score, "mean": mean, "std": std},
        )


class RateDetector:
    """Detect anomalous rates of change in sensor readings.

    Monitors the rate at which values change over time, flagging
    sudden spikes or drops that exceed configured thresholds.

    Attributes:
        max_rate: Maximum acceptable rate of change per second.
        _last_values: Cache of last seen values per sensor.
    """

    def __init__(self, max_rate: float = 10.0):
        """Initialize rate detector.

        Args:
            max_rate: Maximum allowed change per second.
        """
        self.max_rate = max_rate
        self._last_values: Dict[str, tuple] = {}

    def check(self, sensor_id: str, value: float, timestamp: datetime) -> Optional[AnomalyEvent]:
        """Check if the rate of change is anomalous.

        Args:
            sensor_id: Sensor identifier.
            value: Current reading.
            timestamp: Time of the reading.

        Returns:
            AnomalyEvent if rate exceeds threshold, None otherwise.
        """
        if sensor_id in self._last_values:
            last_value, last_time = self._last_values[sensor_id]
            time_diff = (timestamp - last_time).total_seconds()

            if time_diff > 0:
                rate = abs(value - last_value) / time_diff

                if rate > self.max_rate:
                    self._last_values[sensor_id] = (value, timestamp)
                    return AnomalyEvent(
                        event_id=f"rate-{sensor_id}",
                        anomaly_type=AnomalyType.RATE_ANOMALY,
                        severity=Severity.HIGH if rate > self.max_rate * 2 else Severity.MEDIUM,
                        source_sensor=sensor_id,
                        timestamp=timestamp,
                        description=f"Rate of change {rate:.2f}/s exceeds max {self.max_rate}/s",
                        raw_value=value,
                        expected_range=(
                            last_value - self.max_rate * time_diff,
                            last_value + self.max_rate * time_diff,
                        ),
                        confidence=min(rate / (self.max_rate * 3), 1.0),
                        metadata={"rate": rate, "previous_value": last_value},
                    )

        self._last_values[sensor_id] = (value, timestamp)
        return None


class DetectionPipeline:
    """Orchestrates multiple detectors in a processing pipeline.

    Runs readings through all configured detectors and aggregates
    the results into a unified anomaly report.

    Attributes:
        detectors: List of detector instances to run.
    """

    def __init__(self):
        self.detectors: List[Any] = []
        self._processed_count = 0
        self._anomaly_count = 0

    def add_detector(self, detector: Any) -> None:
        """Add a detector to the pipeline.

        Args:
            detector: Any detector with a check() or ingest() method.
        """
        self.detectors.append(detector)

    def process(self, sensor_id: str, value: float,
                timestamp: Optional[datetime] = None) -> List[AnomalyEvent]:
        """Run a reading through all detectors.

        Args:
            sensor_id: Source sensor identifier.
            value: Reading value.
            timestamp: Time of reading (default: now).

        Returns:
            List of detected anomalies (may be empty).
        """
        if timestamp is None:
            timestamp = datetime.utcnow()

        anomalies = []
        self._processed_count += 1

        for detector in self.detectors:
            result = None
            if hasattr(detector, "check"):
                if isinstance(detector, RateDetector):
                    result = detector.check(sensor_id, value, timestamp)
                else:
                    result = detector.check(sensor_id, value)
            elif hasattr(detector, "ingest"):
                result = detector.ingest(sensor_id, value)

            if result is not None:
                anomalies.append(result)

        self._anomaly_count += len(anomalies)
        return anomalies

    @property
    def stats(self) -> Dict[str, int]:
        """Get pipeline processing statistics."""
        return {
            "processed": self._processed_count,
            "anomalies_detected": self._anomaly_count,
            "detector_count": len(self.detectors),
        }
