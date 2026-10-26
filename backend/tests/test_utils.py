"""Unit tests for the untested backend/utils modules.

Covers alert_dedup, batch_processor, edge_validator, graph_metrics and
node_risk. risk_scorer has its own suite in test_risk_scorer.py.
"""

from datetime import datetime, timedelta

from backend.utils.alert_dedup import AlertDeduplicator
from backend.utils.batch_processor import BatchProcessor, Transaction, chunk
from backend.utils.edge_validator import EdgeValidator
from backend.utils.graph_metrics import (
    calculate_centrality,
    density,
    find_high_risk_nodes,
)
from backend.utils.node_risk import NodeRiskAggregator


class TestAlertDeduplicator:
    def test_first_alert_is_not_duplicate(self):
        d = AlertDeduplicator(ttl_seconds=300)
        assert d.is_duplicate("tx1", "FRAUD") is False

    def test_repeat_within_ttl_is_duplicate(self):
        d = AlertDeduplicator(ttl_seconds=300)
        d.is_duplicate("tx1", "FRAUD")
        assert d.is_duplicate("tx1", "FRAUD") is True

    def test_different_type_or_tx_not_duplicate(self):
        d = AlertDeduplicator(ttl_seconds=300)
        d.is_duplicate("tx1", "FRAUD")
        assert d.is_duplicate("tx1", "VELOCITY") is False
        assert d.is_duplicate("tx2", "FRAUD") is False

    def test_zero_ttl_never_deduplicates(self):
        d = AlertDeduplicator(ttl_seconds=0)
        d.is_duplicate("tx1", "FRAUD")
        assert d.is_duplicate("tx1", "FRAUD") is False

    def test_clear_expired_drops_old_entries(self):
        d = AlertDeduplicator(ttl_seconds=0)
        d.is_duplicate("tx1", "FRAUD")
        d.clear_expired()
        assert len(d._seen) == 0


class TestChunk:
    def test_even_split(self):
        assert list(chunk([1, 2, 3, 4], 2)) == [[1, 2], [3, 4]]

    def test_remainder_batch(self):
        assert list(chunk([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]]

    def test_empty_input(self):
        assert list(chunk([], 3)) == []


class TestBatchProcessor:
    def _tx(self, i):
        return Transaction(id=str(i), src="a", dst="b", amount=1.0, timestamp=0.0)

    def test_flush_at_batch_size(self):
        p = BatchProcessor(batch_size=2, max_wait_ms=100_000)
        assert p.enqueue(self._tx(1)) == []
        batches = p.enqueue(self._tx(2))
        assert [[t.id for t in b] for b in batches] == [["1", "2"]]
        assert p._queue == []

    def test_no_flush_below_batch_size(self):
        p = BatchProcessor(batch_size=10, max_wait_ms=100_000)
        assert p.enqueue(self._tx(1)) == []
        assert len(p._queue) == 1

    def test_zero_wait_flushes_every_enqueue(self):
        p = BatchProcessor(batch_size=100, max_wait_ms=0)
        assert len(p.enqueue(self._tx(1))) == 1

    def test_flush_empty_returns_empty(self):
        p = BatchProcessor()
        assert p.flush() == []

    def test_oversized_queue_splits_into_batches(self):
        p = BatchProcessor(batch_size=2, max_wait_ms=100_000)
        p._queue = [self._tx(i) for i in range(5)]
        batches = p.flush()
        assert [len(b) for b in batches] == [2, 2, 1]


class TestEdgeValidator:
    def setup_method(self):
        self.v = EdgeValidator(max_amount=1_000, velocity_window_sec=3600)
        self.ts = datetime(2026, 10, 26, 12, 0, 0)

    def test_valid_transaction(self):
        r = self.v.validate("a", "b", 100, self.ts)
        assert r == {"valid": True, "errors": [], "warnings": []}

    def test_zero_and_negative_amounts_rejected(self):
        for amount in (0, -5):
            r = self.v.validate("a", "b", amount, self.ts)
            assert r["valid"] is False
            assert "INVALID_AMOUNT_ZERO_OR_NEGATIVE" in r["errors"]

    def test_amount_above_limit_rejected(self):
        r = self.v.validate("a", "b", 1001, self.ts)
        assert "AMOUNT_EXCEEDS_LIMIT" in r["errors"]
        assert r["valid"] is False

    def test_self_loop_rejected(self):
        r = self.v.validate("a", "a", 100, self.ts)
        assert "SELF_LOOP_DETECTED" in r["errors"]

    def test_velocity_warning_after_six_recent(self):
        for _ in range(6):
            r = self.v.validate("a", "b", 100, self.ts)
            assert "HIGH_VELOCITY_EDGE" not in r["warnings"]
        r = self.v.validate("a", "b", 100, self.ts)
        assert "HIGH_VELOCITY_EDGE" in r["warnings"]

    def test_old_transactions_do_not_count_toward_velocity(self):
        old = self.ts - timedelta(hours=2)
        for _ in range(10):
            self.v.validate("a", "b", 100, old)
        r = self.v.validate("a", "b", 100, self.ts)
        assert "HIGH_VELOCITY_EDGE" not in r["warnings"]


class TestNodeRiskAggregator:
    def test_unknown_node_returns_none(self):
        agg = NodeRiskAggregator()
        assert agg.average("x") is None
        assert agg.peak("x") is None

    def test_average_and_peak(self):
        agg = NodeRiskAggregator()
        for s in (0.2, 0.4, 0.6):
            agg.record("n1", s)
        assert agg.average("n1") == 0.4
        assert agg.peak("n1") == 0.6

    def test_history_capped_at_100(self):
        agg = NodeRiskAggregator()
        for i in range(150):
            agg.record("n1", float(i))
        assert len(agg._scores["n1"]) == 100
        assert agg.peak("n1") == 149.0

    def test_top_k_orders_by_average(self):
        agg = NodeRiskAggregator()
        agg.record("low", 0.1)
        agg.record("high", 0.9)
        agg.record("mid", 0.5)
        assert agg.top_k(2) == [("high", 0.9), ("mid", 0.5)]


class TestGraphMetrics:
    def test_centrality(self):
        adj = {"a": {"b", "c"}, "b": {"a"}, "c": {"a"}}
        c = calculate_centrality(adj)
        assert c["a"] == 1.0
        assert c["b"] == 0.5
        assert c["c"] == 0.5

    def test_centrality_single_node(self):
        assert calculate_centrality({"a": set()}) == {"a": 0.0}

    def test_density(self):
        assert density(3, 3) == 1.0
        assert density(4, 3) == 0.5
        assert density(1, 0) == 0.0

    def test_find_high_risk_nodes_threshold(self):
        scores = {"a": 0.9, "b": 0.75, "c": 0.5}
        assert find_high_risk_nodes(scores) == ["a", "b"]
        assert find_high_risk_nodes(scores, threshold=0.95) == []
