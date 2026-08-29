"""
Sentinel-X Sensor Registry
=============================
Manages sensor registration, status tracking, and metadata
for all connected IoT devices and data sources.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum


class SensorStatus(Enum):
    """Sensor connection status."""
    ACTIVE = "active"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    DECOMMISSIONED = "decommissioned"


@dataclass
class SensorInfo:
    """Metadata and status for a registered sensor."""
    sensor_id: str
    name: str
    sensor_type: str
    location: str
    status: SensorStatus = SensorStatus.ACTIVE
    firmware_version: str = ""
    registered_at: datetime = field(default_factory=datetime.utcnow)
    last_ping: Optional[datetime] = None
    reading_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_stale(self) -> bool:
        """Check if the sensor hasn't reported recently (>5 min)."""
        if self.last_ping is None:
            return True
        return datetime.utcnow() - self.last_ping > timedelta(minutes=5)


class SensorRegistry:
    """Central registry for all system sensors.

    Handles registration, status updates, and provides
    query interfaces for sensor management.

    Attributes:
        _sensors: In-memory sensor store.
    """

    def __init__(self):
        self._sensors: Dict[str, SensorInfo] = {}

    def register(self, sensor: SensorInfo) -> bool:
        """Register a new sensor.

        Args:
            sensor: SensorInfo to register.

        Returns:
            True if newly registered, False if already exists.
        """
        if sensor.sensor_id in self._sensors:
            return False
        self._sensors[sensor.sensor_id] = sensor
        return True

    def update_status(self, sensor_id: str, status: SensorStatus) -> bool:
        """Update sensor status.

        Args:
            sensor_id: ID of the sensor.
            status: New status.

        Returns:
            True if sensor was found and updated.
        """
        if sensor_id in self._sensors:
            self._sensors[sensor_id].status = status
            return True
        return False

    def record_ping(self, sensor_id: str) -> bool:
        """Record a heartbeat ping from a sensor.

        Args:
            sensor_id: ID of the reporting sensor.

        Returns:
            True if sensor was found.
        """
        if sensor_id in self._sensors:
            self._sensors[sensor_id].last_ping = datetime.utcnow()
            self._sensors[sensor_id].reading_count += 1
            if self._sensors[sensor_id].status == SensorStatus.OFFLINE:
                self._sensors[sensor_id].status = SensorStatus.ACTIVE
            return True
        return False

    def get(self, sensor_id: str) -> Optional[SensorInfo]:
        """Get sensor information by ID."""
        return self._sensors.get(sensor_id)

    def list_sensors(
        self,
        status: Optional[SensorStatus] = None,
        sensor_type: Optional[str] = None,
    ) -> List[SensorInfo]:
        """List sensors with optional filtering.

        Args:
            status: Filter by status.
            sensor_type: Filter by type.

        Returns:
            Filtered list of sensors.
        """
        sensors = list(self._sensors.values())
        if status:
            sensors = [s for s in sensors if s.status == status]
        if sensor_type:
            sensors = [s for s in sensors if s.sensor_type == sensor_type]
        return sensors

    def get_stale_sensors(self) -> List[SensorInfo]:
        """Get sensors that haven't pinged recently.

        Returns:
            List of stale sensors (>5 min since last ping).
        """
        return [
            s for s in self._sensors.values()
            if s.status == SensorStatus.ACTIVE and s.is_stale
        ]

    @property
    def active_count(self) -> int:
        """Count of currently active sensors."""
        return sum(
            1 for s in self._sensors.values()
            if s.status == SensorStatus.ACTIVE
        )

    def decommission(self, sensor_id: str, reason: str = "") -> bool:
        """Decommission a sensor.

        Args:
            sensor_id: Sensor to decommission.
            reason: Reason for decommissioning.

        Returns:
            True if sensor was found and decommissioned.
        """
        if sensor_id in self._sensors:
            self._sensors[sensor_id].status = SensorStatus.DECOMMISSIONED
            self._sensors[sensor_id].metadata["decommission_reason"] = reason
            self._sensors[sensor_id].metadata["decommissioned_at"] = datetime.utcnow().isoformat()
            return True
        return False
