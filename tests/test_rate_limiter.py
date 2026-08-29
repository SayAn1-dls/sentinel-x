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
