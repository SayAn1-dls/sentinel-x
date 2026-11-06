"""
Unit Tests for Rate Limiter Module
=====================================
"""

import pytest
from src.modules.rate_limiter import TokenBucketLimiter, RateLimitResult


class TestTokenBucketLimiter:
    """Test suite for token bucket rate limiter."""

    def test_initial_request_allowed(self):
        limiter = TokenBucketLimiter(capacity=10, refill_rate=1.0)
        result = limiter.consume("client_1")
        assert result.allowed is True
        assert result.remaining == 9

    def test_exhaust_bucket(self):
        limiter = TokenBucketLimiter(capacity=3, refill_rate=0.1)
        for _ in range(3):
            result = limiter.consume("client_1")
            assert result.allowed is True
        result = limiter.consume("client_1")
        assert result.allowed is False
        assert result.remaining == 0
        assert result.retry_after is not None

    def test_different_clients_independent(self):
        limiter = TokenBucketLimiter(capacity=2, refill_rate=0.1)
        limiter.consume("client_a")
        limiter.consume("client_a")
        # Client B should still have full capacity
        result = limiter.consume("client_b")
        assert result.allowed is True
        assert result.remaining == 1

    def test_consume_multiple_tokens(self):
        limiter = TokenBucketLimiter(capacity=10, refill_rate=1.0)
        result = limiter.consume("client_1", tokens=5)
        assert result.allowed is True
        assert result.remaining == 5

    def test_consume_more_than_available(self):
        limiter = TokenBucketLimiter(capacity=3, refill_rate=0.1)
        result = limiter.consume("client_1", tokens=5)
        assert result.allowed is False

    def test_result_has_limit(self):
        limiter = TokenBucketLimiter(capacity=100)
        result = limiter.consume("client_1")
        assert result.limit == 100


class TestConsumeValidation:
    """consume() must reject non-positive token counts (regression:
    negative tokens used to inflate the bucket past capacity)."""

    def test_negative_tokens_rejected(self):
        limiter = TokenBucketLimiter(capacity=10, refill_rate=1.0)
        with pytest.raises(ValueError):
            limiter.consume("client_1", tokens=-5)

    def test_zero_tokens_rejected(self):
        limiter = TokenBucketLimiter(capacity=10, refill_rate=1.0)
        with pytest.raises(ValueError):
            limiter.consume("client_1", tokens=0)

    def test_negative_tokens_do_not_inflate_bucket(self):
        limiter = TokenBucketLimiter(capacity=10, refill_rate=0.01)
        with pytest.raises(ValueError):
            limiter.consume("client_1", tokens=-5)
        limiter.consume("client_1")
        result = limiter.consume("client_1")
        # Bucket still honours capacity: 10 - 2 consumed = 8, never 15+
        assert result.remaining <= 8


class TestResetClock:
    """reset_at is an external-facing absolute timestamp and must use
    the UNIX epoch, not the process-local monotonic clock."""

    def test_reset_at_is_unix_epoch_on_allow(self):
        limiter = TokenBucketLimiter(capacity=10, refill_rate=1.0)
        result = limiter.consume("client_1")
        assert result.reset_at > 1_000_000_000  # epoch seconds, not monotonic

    def test_reset_at_is_unix_epoch_on_reject(self):
        limiter = TokenBucketLimiter(capacity=1, refill_rate=0.1)
        limiter.consume("client_1")
        result = limiter.consume("client_1")
        assert result.allowed is False
        assert result.reset_at > 1_000_000_000

    def test_retry_after_is_relative_seconds(self):
        limiter = TokenBucketLimiter(capacity=1, refill_rate=10.0)
        limiter.consume("client_1")
        result = limiter.consume("client_1")
        assert result.allowed is False
        assert 0 < result.retry_after <= 0.2  # ~0.1s to refill 1 token at 10/s


class TestRefill:
    """Token bucket refills over time, capped at capacity."""

    def test_bucket_refills_over_time(self):
        import time
        limiter = TokenBucketLimiter(capacity=2, refill_rate=100.0)
        assert limiter.consume("client_1").allowed
        assert limiter.consume("client_1").allowed
        assert not limiter.consume("client_1").allowed
        time.sleep(0.03)  # ~3 tokens refill, capped at 2
        assert limiter.consume("client_1").allowed

    def test_refill_capped_at_capacity(self):
        import time
        limiter = TokenBucketLimiter(capacity=3, refill_rate=1000.0)
        limiter.consume("client_1")
        time.sleep(0.02)  # way more than enough to refill fully
        result = limiter.consume("client_1")
        assert result.remaining == 2  # capped at capacity - 1, not beyond
