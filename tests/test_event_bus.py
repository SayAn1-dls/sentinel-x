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


class TestHandlerFailureLogging:
    """A failing handler must be logged, not silently swallowed."""

    def test_handler_exception_is_logged(self, caplog):
        import logging

        def bad_handler(event):
            raise RuntimeError("handler crashed")

        self_bus = EventBus()
        self_bus.subscribe(EventType.SENSOR_DATA, bad_handler)
        event = Event.create(EventType.SENSOR_DATA, "s1", {})
        with caplog.at_level(logging.ERROR, logger="src.modules.event_bus"):
            count = self_bus.publish(event)
        assert count == 0
        assert len(caplog.records) == 1
        record = caplog.records[0]
        assert record.levelno == logging.ERROR
        assert event.event_id in record.getMessage()
        assert record.exc_info is not None  # traceback preserved

    def test_failing_handler_does_not_block_later_handlers(self, caplog):
        import logging

        received = []

        def bad_handler(event):
            raise RuntimeError("boom")

        bus = EventBus()
        bus.subscribe(EventType.SENSOR_DATA, bad_handler)
        bus.subscribe(EventType.SENSOR_DATA, received.append)
        with caplog.at_level(logging.ERROR, logger="src.modules.event_bus"):
            count = bus.publish(Event.create(EventType.SENSOR_DATA, "s1", {}))
        assert count == 1
        assert len(received) == 1


class TestPublishSnapshot:
    """Handlers registered at publish time all run, per the contract."""

    def test_unsubscribe_during_publish_does_not_skip_handlers(self):
        bus = EventBus()
        received = []

        def h2(event):
            received.append("h2")

        def h1(event):
            bus.unsubscribe(EventType.ALERT_TRIGGERED, h2)
            received.append("h1")

        bus.subscribe(EventType.ALERT_TRIGGERED, h1)
        bus.subscribe(EventType.ALERT_TRIGGERED, h2)
        count = bus.publish(Event.create(EventType.ALERT_TRIGGERED, "x", {}))
        # Both were registered when publish started: both must run.
        assert received == ["h1", "h2"]
        assert count == 2
        # The unsubscription still applies to the NEXT publish.
        count = bus.publish(Event.create(EventType.ALERT_TRIGGERED, "x", {}))
        assert received == ["h1", "h2", "h1"]
        assert count == 1


class TestHistory:
    """Public accessor for the documented bounded event history."""

    def test_history_returns_events_in_publication_order(self):
        bus = EventBus()
        events = [Event.create(EventType.SENSOR_DATA, "s1", {"i": i}) for i in range(3)]
        for e in events:
            bus.publish(e)
        assert bus.history() == events

    def test_history_limit_returns_most_recent(self):
        bus = EventBus()
        events = [Event.create(EventType.SENSOR_DATA, "s1", {"i": i}) for i in range(5)]
        for e in events:
            bus.publish(e)
        assert bus.history(limit=2) == events[-2:]

    def test_history_non_positive_limit_returns_empty(self):
        bus = EventBus()
        bus.publish(Event.create(EventType.SENSOR_DATA, "s1", {}))
        assert bus.history(limit=0) == []
        assert bus.history(limit=-1) == []

    def test_history_returns_a_copy(self):
        bus = EventBus()
        bus.publish(Event.create(EventType.SENSOR_DATA, "s1", {}))
        snapshot = bus.history()
        snapshot.clear()
        assert len(bus.history()) == 1
