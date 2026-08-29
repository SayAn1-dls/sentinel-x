"""
Unit Tests for Metrics Collection Module
==========================================
"""

import pytest
from src.modules.metrics import Counter, Gauge, MetricsRegistry


class TestCounter:
    """Test suite for Counter metric."""

    def test_initial_value_zero(self):
        c = Counter("test_counter")
        assert c.get() == 0

    def test_increment(self):
        c = Counter("test_counter")
        c.inc()
        assert c.get() == 1

    def test_increment_by_amount(self):
        c = Counter("test_counter")
        c.inc(5)
        assert c.get() == 5

    def test_negative_increment_raises(self):
        c = Counter("test_counter")
        with pytest.raises(ValueError):
            c.inc(-1)

    def test_labeled_counter(self):
        c = Counter("requests_total")
        c.inc(1, labels={"method": "GET"})
        c.inc(3, labels={"method": "POST"})
        assert c.get(labels={"method": "GET"}) == 1
        assert c.get(labels={"method": "POST"}) == 3

    def test_exposition_format(self):
        c = Counter("test_total", "Test counter help")
        c.inc(42)
        output = c.exposition()
        assert "# HELP test_total Test counter help" in output
        assert "# TYPE test_total counter" in output
        assert "test_total 42" in output


class TestGauge:
    """Test suite for Gauge metric."""

    def test_initial_value_zero(self):
        g = Gauge("test_gauge")
        assert g.get() == 0

    def test_set_value(self):
        g = Gauge("test_gauge")
        g.set(42.5)
        assert g.get() == 42.5

    def test_increment(self):
        g = Gauge("test_gauge")
        g.inc(10)
        assert g.get() == 10

    def test_decrement(self):
        g = Gauge("test_gauge")
        g.set(100)
        g.dec(30)
        assert g.get() == 70

    def test_exposition_format(self):
        g = Gauge("active_connections", "Current connections")
        g.set(15)
        output = g.exposition()
        assert "# TYPE active_connections gauge" in output
        assert "active_connections 15" in output


class TestMetricsRegistry:
    """Test suite for MetricsRegistry."""

    def test_create_counter(self):
        reg = MetricsRegistry()
        c = reg.counter("req_total", "Total requests")
        c.inc(5)
        assert c.get() == 5

    def test_get_existing_counter(self):
        reg = MetricsRegistry()
        c1 = reg.counter("req_total")
        c2 = reg.counter("req_total")
        assert c1 is c2

    def test_create_gauge(self):
        reg = MetricsRegistry()
        g = reg.gauge("temp_celsius")
        g.set(22.5)
        assert g.get() == 22.5

    def test_full_exposition(self):
        reg = MetricsRegistry()
        reg.counter("http_requests_total", "Total HTTP requests").inc(100)
        reg.gauge("active_users", "Active user count").set(42)
        output = reg.exposition()
        assert "http_requests_total" in output
        assert "active_users" in output
