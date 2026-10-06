"""
Unit Tests for Event Bus Module
=================================
"""

import pytest
from src.modules.event_bus import EventBus, Event, EventType


class TestEventBus:
    """Test suite for the event bus."""

    def setup_method(self):
        self.bus = EventBus(max_history=100)
        self.received_events = []

    def _handler(self, event):
        self.received_events.append(event)

    def test_subscribe_and_publish(self):
        self.bus.subscribe(EventType.ANOMALY_DETECTED, self._handler)
        event = Event.create(
            EventType.ANOMALY_DETECTED,
            "detector",
            {"sensor": "temp_01", "value": 55.0},
        )
        count = self.bus.publish(event)
        assert count == 1
        assert len(self.received_events) == 1
        assert self.received_events[0].payload["sensor"] == "temp_01"

    def test_no_subscribers(self):
        event = Event.create(EventType.SYSTEM_HEALTH, "monitor", {})
        count = self.bus.publish(event)
        assert count == 0

    def test_multiple_subscribers(self):
        other_received = []
        self.bus.subscribe(EventType.ALERT_TRIGGERED, self._handler)
        self.bus.subscribe(EventType.ALERT_TRIGGERED, lambda e: other_received.append(e))
        event = Event.create(EventType.ALERT_TRIGGERED, "router", {"alert_id": "a1"})
        count = self.bus.publish(event)
        assert count == 2
        assert len(self.received_events) == 1
        assert len(other_received) == 1

    def test_unsubscribe(self):
        self.bus.subscribe(EventType.CONFIG_UPDATED, self._handler)
        assert self.bus.unsubscribe(EventType.CONFIG_UPDATED, self._handler) is True
        event = Event.create(EventType.CONFIG_UPDATED, "admin", {})
        count = self.bus.publish(event)
        assert count == 0

    def test_unsubscribe_unknown_handler(self):
        assert self.bus.unsubscribe(EventType.CONFIG_UPDATED, self._handler) is False

    def test_event_log_bounded(self):
        bus = EventBus(max_history=5)
        for i in range(10):
            event = Event.create(EventType.SENSOR_DATA, "s1", {"i": i})
            bus.publish(event)
        assert len(bus._event_log) == 5

    def test_event_create_factory(self):
        event = Event.create(
            EventType.USER_ACTION,
            "api",
            {"action": "login"},
            correlation_id="corr-123",
        )
        assert event.event_type == EventType.USER_ACTION
        assert event.correlation_id == "corr-123"
        assert event.event_id  # Should be auto-generated

    def test_handler_exception_doesnt_break_chain(self):
        def bad_handler(event):
            raise RuntimeError("Handler crashed")

        self.bus.subscribe(EventType.SENSOR_DATA, bad_handler)
        self.bus.subscribe(EventType.SENSOR_DATA, self._handler)
        event = Event.create(EventType.SENSOR_DATA, "s1", {})
        count = self.bus.publish(event)
        assert count == 1  # Second handler still executed
        assert len(self.received_events) == 1
