"""
Sentinel-X Data Pipeline
==========================
Handles sensor data ingestion, normalization, and routing
to the detection engine.
"""

from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class DataFormat(Enum):
    """Supported sensor data formats."""
    RAW = "raw"
    NORMALIZED = "normalized"
    AGGREGATED = "aggregated"


@dataclass
class SensorReading:
    """Normalized sensor reading."""
    sensor_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: datetime
    quality: float = 1.0  # Data quality score 0-1
    raw_payload: Dict[str, Any] = field(default_factory=dict)


class DataNormalizer:
    """Normalizes raw sensor data into standard units.

    Handles unit conversions and data quality assessment
    before feeding data into the detection pipeline.

    Attributes:
        _unit_converters: Registry of unit conversion functions.
    """

    def __init__(self):
        self._unit_converters: Dict[str, Callable] = {
            "fahrenheit_to_celsius": lambda f: (f - 32) * 5 / 9,
            "psi_to_bar": lambda psi: psi * 0.0689476,
            "mph_to_kmh": lambda mph: mph * 1.60934,
            "feet_to_meters": lambda ft: ft * 0.3048,
        }

    def normalize(self, raw_data: Dict[str, Any]) -> List[SensorReading]:
        """Normalize raw sensor payload into standard readings.

        Args:
            raw_data: Raw sensor data dictionary.

        Returns:
            List of normalized SensorReading instances.
        """
        readings = []
        sensor_id = raw_data.get("sensor_id", "unknown")
        timestamp_str = raw_data.get("timestamp", "")

        try:
            if timestamp_str.endswith("Z"):
                timestamp_str = timestamp_str[:-1] + "+00:00"
            timestamp = datetime.fromisoformat(timestamp_str)
        except (ValueError, AttributeError):
            timestamp = datetime.utcnow()

        for reading in raw_data.get("readings", []):
            sensor_type = reading.get("type", "unknown")
            value = reading.get("value", 0.0)
            unit = reading.get("unit", "")

            # Apply unit conversions
            if unit == "fahrenheit":
                value = self._unit_converters["fahrenheit_to_celsius"](value)
                unit = "celsius"
            elif unit == "psi":
                value = self._unit_converters["psi_to_bar"](value)
                unit = "bar"

            quality = self._assess_quality(value, sensor_type)

            readings.append(SensorReading(
                sensor_id=sensor_id,
                sensor_type=sensor_type,
                value=round(value, 4),
                unit=unit,
                timestamp=timestamp,
                quality=quality,
                raw_payload=reading,
            ))

        return readings

    def _assess_quality(self, value: float, sensor_type: str) -> float:
        """Assess data quality based on value plausibility.

        Args:
            value: Reading value.
            sensor_type: Type of sensor.

        Returns:
            Quality score between 0 and 1.
        """
        # Basic plausibility checks
        plausible_ranges = {
            "temperature": (-50, 100),
            "humidity": (0, 100),
            "pressure": (800, 1200),
            "motion": (0, 1),
        }

        if sensor_type in plausible_ranges:
            low, high = plausible_ranges[sensor_type]
            if low <= value <= high:
                return 1.0
            # Slightly outside range
            if low - 10 <= value <= high + 10:
                return 0.7
            return 0.3

        return 0.8  # Unknown sensor type, moderate confidence


class DataRouter:
    """Routes normalized data to appropriate processing pipelines.

    Attributes:
        _routes: Mapping of sensor types to handler lists.
    """

    def __init__(self):
        self._routes: Dict[str, List[Callable]] = {}
        self._processed_count = 0

    def register_route(self, sensor_type: str, handler: Callable) -> None:
        """Register a handler for a sensor type.

        Args:
            sensor_type: Type of sensor data to route.
            handler: Callable that processes SensorReading.
        """
        if sensor_type not in self._routes:
            self._routes[sensor_type] = []
        self._routes[sensor_type].append(handler)

    def route(self, reading: SensorReading) -> int:
        """Route a reading to matching handlers.

        Args:
            reading: Normalized sensor reading.

        Returns:
            Number of handlers that processed the reading.
        """
        handlers = self._routes.get(reading.sensor_type, [])
        wildcard_handlers = self._routes.get("*", [])
        all_handlers = handlers + wildcard_handlers

        processed = 0
        for handler in all_handlers:
            try:
                handler(reading)
                processed += 1
            except Exception:
                pass  # Log and continue

        self._processed_count += 1
        return processed
