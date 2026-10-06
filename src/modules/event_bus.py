"""
Sentinel-X Event Bus
=====================
Internal publish/subscribe event bus for decoupled
communication between system components.
"""

from typing import Callable, Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid


class EventType(Enum):
    """System event types."""
    SENSOR_DATA = "sensor.data"
    ANOMALY_DETECTED = "anomaly.detected"
    ALERT_TRIGGERED = "alert.triggered"
    ALERT_ACKNOWLEDGED = "alert.acknowledged"
    ALERT_RESOLVED = "alert.resolved"
    SYSTEM_HEALTH = "system.health"
    CONFIG_UPDATED = "config.updated"
    USER_ACTION = "user.action"


@dataclass
class Event:
    """Represents a system event."""
    event_id: str
    event_type: EventType
    source: str
    timestamp: datetime
    payload: Dict[str, Any]
    correlation_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def create(cls, event_type: EventType, source: str, payload: Dict[str, Any],
               correlation_id: Optional[str] = None) -> "Event":
        """Factory method to create a new event with auto-generated ID."""
        return cls(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            source=source,
            timestamp=datetime.utcnow(),
            payload=payload,
            correlation_id=correlation_id,
        )


class EventBus:
    """In-process publish/subscribe event bus.

    Components register handlers for specific event types.
    When an event is published, all matching handlers are invoked
    synchronously in registration order.

    Attributes:
        _subscribers: Mapping of event types to handler lists.
        _event_log: History of published events (bounded).
    """

    def __init__(self, max_history: int = 1000):
        self._subscribers: Dict[EventType, List[Callable]] = {}
        self._event_log: List[Event] = []
        self._max_history = max_history

    def subscribe(self, event_type: EventType, handler: Callable[[Event], None]) -> None:
        """Register a handler for a specific event type.

        Args:
            event_type: The type of events to listen for.
            handler: Callable that processes the event.
        """
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)

    def unsubscribe(self, event_type: EventType, handler: Callable) -> bool:
        """Remove a handler subscription.

        Args:
            event_type: The event type to unsubscribe from.
            handler: The handler to remove.

        Returns:
            True if the handler was found and removed.
        """
        if event_type in self._subscribers:
            try:
                self._subscribers[event_type].remove(handler)
                return True
            except ValueError:
                return False
        return False

    def publish(self, event: Event) -> int:
        """Publish an event to all registered handlers.

        Args:
            event: The event to publish.

        Returns:
            Number of handlers that processed the event.
        """
        self._event_log.append(event)
        if len(self._event_log) > self._max_history:
            self._event_log = self._event_log[-self._max_history:]

        handlers = self._subscribers.get(event.event_type, [])
        processed = 0
        for handler in handlers:
            try:
                handler(event)
                processed += 1
            except Exception:
                pass  # Log error but don't break the chain
        return processed
