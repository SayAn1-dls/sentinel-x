"""
Sentinel-X Health Check Module
================================
System health monitoring with component status checks,
resource utilization tracking, and readiness probes.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta


class ComponentStatus(Enum):
    """Health status of a system component."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


@dataclass
class HealthCheck:
    """Result of a single component health check."""
    component: str
    status: ComponentStatus
    latency_ms: float
    message: str = ""
    last_checked: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SystemHealth:
    """Aggregate system health status."""
    overall_status: ComponentStatus
    checks: List[HealthCheck]
    uptime_seconds: float
    version: str
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize health status to dictionary for API response."""
        return {
            "status": self.overall_status.value,
            "uptime_seconds": self.uptime_seconds,
            "version": self.version,
            "timestamp": self.timestamp.isoformat(),
            "components": {
                check.component: {
                    "status": check.status.value,
                    "latency_ms": check.latency_ms,
                    "message": check.message,
                }
                for check in self.checks
            },
        }


class HealthMonitor:
    """Monitors system health by running periodic checks.

    Tracks component status, computes aggregate health,
    and exposes readiness/liveness probe endpoints.

    Attributes:
        _start_time: When the system started.
        _checks: Registry of health check functions.
        _history: Recent health check results.
    """

    def __init__(self, version: str = "2.0.0"):
        self._start_time = datetime.utcnow()
        self._version = version
        self._checks: Dict[str, Any] = {}
        self._history: List[SystemHealth] = []

    def register_check(self, component: str, check_fn) -> None:
        """Register a health check function for a component.

        Args:
            component: Name of the component.
            check_fn: Callable returning HealthCheck.
        """
        self._checks[component] = check_fn

    def get_uptime(self) -> float:
        """Get system uptime in seconds."""
        return (datetime.utcnow() - self._start_time).total_seconds()

    def run_checks(self) -> SystemHealth:
        """Execute all registered health checks.

        Returns:
            SystemHealth with aggregate and per-component status.
        """
        results = []
        for component, check_fn in self._checks.items():
            try:
                result = check_fn()
                results.append(result)
            except Exception as e:
                results.append(HealthCheck(
                    component=component,
                    status=ComponentStatus.UNHEALTHY,
                    latency_ms=-1,
                    message=str(e),
                ))

        overall = ComponentStatus.HEALTHY
        for check in results:
            if check.status == ComponentStatus.UNHEALTHY:
                overall = ComponentStatus.UNHEALTHY
                break
            elif check.status == ComponentStatus.DEGRADED:
                overall = ComponentStatus.DEGRADED

        health = SystemHealth(
            overall_status=overall,
            checks=results,
            uptime_seconds=self.get_uptime(),
            version=self._version,
        )
        self._history.append(health)
        return health

    def is_ready(self) -> bool:
        """Check if system is ready to serve traffic."""
        if not self._history:
            return False
        latest = self._history[-1]
        return latest.overall_status != ComponentStatus.UNHEALTHY
