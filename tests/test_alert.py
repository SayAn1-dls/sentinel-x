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


class TestAlertManager:
    """Contract tests for the throttling/lifecycle AlertManager."""

    def test_send_rejects_invalid_severity(self):
        from src.modules.alert import AlertManager
        with pytest.raises(ValueError):
            AlertManager().send("boom", severity="catastrophic")

    def test_send_creates_alert_with_defaults(self):
        from src.modules.alert import AlertManager
        m = AlertManager()
        r = m.send("disk full", "warning", source="agent")
        assert r["status"] == "sent"
        assert r["alert_id"] == "ALR-000000"
        assert r["channels"] == ["email", "slack"]
        assert m.alerts[0]["source"] == "agent"

    def test_critical_and_emergency_escalate(self):
        from src.modules.alert import AlertManager
        m = AlertManager()
        m.send("a", "critical")
        m.send("b", "emergency")
        m.send("c", "info")
        assert m.escalated == 2
        assert m.alerts[0]["escalated"] is True
        assert "escalated" not in m.alerts[2]

    def test_throttle_after_window_limit(self):
        from src.modules.alert import AlertManager, MAX_ALERTS_PER_WINDOW
        m = AlertManager()
        for _ in range(MAX_ALERTS_PER_WINDOW):
            assert m.send("flood", "info")["status"] == "sent"
        r = m.send("flood", "info")
        assert r["status"] == "throttled"
        assert m.suppressed == 1
        # Throttled alerts are not recorded as alerts.
        assert len(m.alerts) == MAX_ALERTS_PER_WINDOW

    def test_acknowledge_unknown_returns_false(self):
        from src.modules.alert import AlertManager
        assert AlertManager().acknowledge("ALR-999999") is False

    def test_acknowledge_lifecycle(self):
        from src.modules.alert import AlertManager
        m = AlertManager()
        aid = m.send("x", "info")["alert_id"]
        assert m.acknowledge(aid) is True
        assert m.alerts[0]["status"] == "acknowledged"
        first_ack = m.alerts[0]["acknowledged_at"]
        # Re-acknowledge is refused and preserves the first timestamp.
        assert m.acknowledge(aid) is False
        assert m.alerts[0]["acknowledged_at"] == first_ack

    def test_resolve_is_terminal(self):
        from src.modules.alert import AlertManager
        m = AlertManager()
        aid = m.send("x", "critical")["alert_id"]
        assert m.resolve(aid) is True
        resolved_at = m.alerts[0]["resolved_at"]
        # A resolved alert cannot be resolved again or pulled back to
        # acknowledged.
        assert m.resolve(aid) is False
        assert m.acknowledge(aid) is False
        assert m.alerts[0]["status"] == "resolved"
        assert m.alerts[0]["resolved_at"] == resolved_at

    def test_resolve_after_acknowledge(self):
        from src.modules.alert import AlertManager
        m = AlertManager()
        aid = m.send("x", "warning")["alert_id"]
        m.acknowledge(aid)
        assert m.resolve(aid) is True
        assert m.alerts[0]["status"] == "resolved"

    def test_summary_counts(self):
        from src.modules.alert import AlertManager, ALERT_VERSION
        m = AlertManager()
        a1 = m.send("a", "critical")["alert_id"]
        m.send("b", "info")
        m.acknowledge(a1)
        s = m.summary()
        assert s["version"] == ALERT_VERSION
        assert s["total"] == 2
        assert s["escalated"] == 1
        assert s["by_severity"]["critical"] == 1
        assert s["by_status"]["acknowledged"] == 1
        assert s["by_status"]["sent"] == 1
