"""
Unit Tests for Health Check Module
====================================
"""

import pytest
from src.modules.health import (
    HealthMonitor,
    HealthCheck,
    ComponentStatus,
    SystemHealth,
)


class TestHealthMonitor:
    """Test suite for HealthMonitor."""

    def setup_method(self):
        self.monitor = HealthMonitor(version="2.0.0-test")

    def test_uptime_increases(self):
        import time
        time.sleep(0.1)
        assert self.monitor.get_uptime() > 0

    def test_no_checks_returns_healthy(self):
        health = self.monitor.run_checks()
        assert health.overall_status == ComponentStatus.HEALTHY
        assert len(health.checks) == 0

    def test_healthy_check(self):
        def db_check():
            return HealthCheck(
                component="database",
                status=ComponentStatus.HEALTHY,
                latency_ms=5.0,
            )
        self.monitor.register_check("database", db_check)
        health = self.monitor.run_checks()
        assert health.overall_status == ComponentStatus.HEALTHY

    def test_unhealthy_check_propagates(self):
        def bad_check():
            return HealthCheck(
                component="redis",
                status=ComponentStatus.UNHEALTHY,
                latency_ms=-1,
                message="Connection refused",
            )
        self.monitor.register_check("redis", bad_check)
        health = self.monitor.run_checks()
        assert health.overall_status == ComponentStatus.UNHEALTHY

    def test_degraded_status(self):
        def slow_check():
            return HealthCheck(
                component="api",
                status=ComponentStatus.DEGRADED,
                latency_ms=500.0,
            )
        self.monitor.register_check("api", slow_check)
        health = self.monitor.run_checks()
        assert health.overall_status == ComponentStatus.DEGRADED

    def test_exception_in_check_marks_unhealthy(self):
        def failing_check():
            raise ConnectionError("Cannot connect")
        self.monitor.register_check("broken", failing_check)
        health = self.monitor.run_checks()
        assert health.overall_status == ComponentStatus.UNHEALTHY

    def test_readiness_before_checks(self):
        assert self.monitor.is_ready() is False

    def test_readiness_after_healthy_check(self):
        self.monitor.run_checks()
        assert self.monitor.is_ready() is True

    def test_health_to_dict(self):
        health = self.monitor.run_checks()
        d = health.to_dict()
        assert "status" in d
        assert d["version"] == "2.0.0-test"
