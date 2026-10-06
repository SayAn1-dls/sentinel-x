"""
Unit Tests for Sentinel-X Alert Management Module
===================================================
"""

import pytest
from datetime import datetime, timedelta
from src.modules.alert import (
    AlertRouter,
    AlertDeduplicator,
    Alert,
    AlertRule,
    AlertChannel,
    AlertPriority,
)


class TestAlertDeduplicator:
    """Test suite for alert deduplication."""

    def setup_method(self):
        self.dedup = AlertDeduplicator(cooldown=timedelta(minutes=5))

    def _make_alert(self, rule_id="r1", source="s1", title="Test Alert"):
        return Alert(
            alert_id="a1",
            rule_id=rule_id,
            title=title,
            message="Test message",
            priority=AlertPriority.P2_HIGH,
            source=source,
            triggered_at=datetime.utcnow(),
        )

    def test_first_alert_not_duplicate(self):
        alert = self._make_alert()
        assert self.dedup.is_duplicate(alert) is False

    def test_same_alert_within_cooldown_is_duplicate(self):
        alert = self._make_alert()
        self.dedup.is_duplicate(alert)  # First time
        assert self.dedup.is_duplicate(alert) is True  # Duplicate

    def test_different_source_not_duplicate(self):
        alert1 = self._make_alert(source="sensor_a")
        alert2 = self._make_alert(source="sensor_b")
        self.dedup.is_duplicate(alert1)
        assert self.dedup.is_duplicate(alert2) is False

    def test_different_rule_not_duplicate(self):
        alert1 = self._make_alert(rule_id="rule_1")
        alert2 = self._make_alert(rule_id="rule_2")
        self.dedup.is_duplicate(alert1)
        assert self.dedup.is_duplicate(alert2) is False

    def test_cleanup_removes_expired(self):
        alert = self._make_alert()
        self.dedup.is_duplicate(alert)
        assert len(self.dedup._fingerprints) == 1
        # Cleanup won't remove fresh entries
        removed = self.dedup.cleanup()
        assert removed == 0


class TestAlertRouter:
    """Test suite for alert routing."""

    def setup_method(self):
        self.router = AlertRouter()
        self.delivered = []

    def _handler(self, alert):
        self.delivered.append(alert)

    def _make_rule(self, rule_id="r1"):
        return AlertRule(
            rule_id=rule_id,
            name="Test Rule",
            condition="temperature > 40",
            channels=[AlertChannel.EMAIL, AlertChannel.WEBHOOK],
            priority=AlertPriority.P2_HIGH,
        )

    def _make_alert(self, rule_id="r1"):
        return Alert(
            alert_id=f"a-{len(self.delivered)}",
            rule_id=rule_id,
            title="Temperature High",
            message="Sensor reading exceeds threshold",
            priority=AlertPriority.P2_HIGH,
            source="sensor_001",
            triggered_at=datetime.utcnow(),
        )

    def test_route_with_handler(self):
        self.router.add_rule(self._make_rule())
        self.router.register_handler(AlertChannel.EMAIL, self._handler)
        alert = self._make_alert()
        result = self.router.route(alert)
        assert result["status"] == "routed"
        assert len(self.delivered) == 1

    def test_route_without_handler(self):
        self.router.add_rule(self._make_rule())
        alert = self._make_alert()
        result = self.router.route(alert)
        assert result["channels"]["email"]["status"] == "no_handler"

    def test_acknowledge_alert(self):
        self.router.add_rule(self._make_rule())
        self.router.register_handler(AlertChannel.EMAIL, self._handler)
        alert = self._make_alert()
        self.router.route(alert)
        assert self.router.acknowledge(alert.alert_id) is True

    def test_acknowledge_unknown_alert(self):
        assert self.router.acknowledge("nonexistent") is False

    def test_unacknowledged_list(self):
        self.router.add_rule(self._make_rule())
        self.router.register_handler(AlertChannel.EMAIL, self._handler)
        alert = self._make_alert()
        self.router.route(alert)
        unacked = self.router.get_unacknowledged()
        assert len(unacked) == 1
