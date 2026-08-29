"""
Sentinel-X Metrics Collection Module
======================================
Collects and exposes application metrics in Prometheus format
for monitoring dashboards and alerting.
"""

from typing import Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime
import threading


class Counter:
    """Thread-safe monotonically increasing counter.

    Attributes:
        name: Metric name.
        help_text: Description for Prometheus exposition.
        _value: Current counter value.
    """

    def __init__(self, name: str, help_text: str = ""):
        self.name = name
        self.help_text = help_text
        self._value: float = 0
        self._labels: Dict[str, float] = {}
        self._lock = threading.Lock()

    def inc(self, amount: float = 1, labels: Optional[Dict[str, str]] = None) -> None:
        """Increment the counter.

        Args:
            amount: Value to add (must be positive).
            labels: Optional label key-value pairs.
        """
        if amount < 0:
            raise ValueError("Counter can only be incremented")
        with self._lock:
            if labels:
                key = ",".join(f'{k}="{v}"' for k, v in sorted(labels.items()))
                self._labels[key] = self._labels.get(key, 0) + amount
            else:
                self._value += amount

    def get(self, labels: Optional[Dict[str, str]] = None) -> float:
        """Get current counter value."""
        if labels:
            key = ",".join(f'{k}="{v}"' for k, v in sorted(labels.items()))
            return self._labels.get(key, 0)
        return self._value

    def exposition(self) -> str:
        """Format as Prometheus text exposition."""
        lines = []
        if self.help_text:
            lines.append(f"# HELP {self.name} {self.help_text}")
        lines.append(f"# TYPE {self.name} counter")
        if self._labels:
            for label_set, value in self._labels.items():
                lines.append(f"{self.name}{{{label_set}}} {value}")
        else:
            lines.append(f"{self.name} {self._value}")
        return "\n".join(lines)


class Gauge:
    """Thread-safe gauge metric that can go up or down.

    Attributes:
        name: Metric name.
        help_text: Description for Prometheus exposition.
    """

    def __init__(self, name: str, help_text: str = ""):
        self.name = name
        self.help_text = help_text
        self._value: float = 0
        self._lock = threading.Lock()

    def set(self, value: float) -> None:
        """Set the gauge to a specific value."""
        with self._lock:
            self._value = value

    def inc(self, amount: float = 1) -> None:
        """Increment the gauge."""
        with self._lock:
            self._value += amount

    def dec(self, amount: float = 1) -> None:
        """Decrement the gauge."""
        with self._lock:
            self._value -= amount

    def get(self) -> float:
        """Get current gauge value."""
        return self._value

    def exposition(self) -> str:
        """Format as Prometheus text exposition."""
        lines = []
        if self.help_text:
            lines.append(f"# HELP {self.name} {self.help_text}")
        lines.append(f"# TYPE {self.name} gauge")
        lines.append(f"{self.name} {self._value}")
        return "\n".join(lines)


class MetricsRegistry:
    """Central registry for all application metrics.

    Provides a single point for creating, accessing, and
    exporting metrics in Prometheus format.
    """

    def __init__(self):
        self._counters: Dict[str, Counter] = {}
        self._gauges: Dict[str, Gauge] = {}

    def counter(self, name: str, help_text: str = "") -> Counter:
        """Get or create a counter metric."""
        if name not in self._counters:
            self._counters[name] = Counter(name, help_text)
        return self._counters[name]

    def gauge(self, name: str, help_text: str = "") -> Gauge:
        """Get or create a gauge metric."""
        if name not in self._gauges:
            self._gauges[name] = Gauge(name, help_text)
        return self._gauges[name]

    def exposition(self) -> str:
        """Export all metrics in Prometheus text format."""
        sections = []
        for counter in self._counters.values():
            sections.append(counter.exposition())
        for gauge in self._gauges.values():
            sections.append(gauge.exposition())
        return "\n\n".join(sections) + "\n"
