"""
Unit Tests for Retry Utilities
================================
Contract tests for backoff calculation, the retry decorator,
and the circuit breaker state machine.
"""

import time
import pytest
from src.utils import retry as retry_mod
from src.utils.retry import (
    RetryConfig,
    calculate_backoff,
    retry,
    CircuitBreaker,
)


class TestCalculateBackoff:
    """Backoff delay contract."""

    def test_attempt_zero_is_base_delay(self):
        assert calculate_backoff(0, base_delay=1.0, jitter=False) == 1.0

    def test_exponential_growth(self):
        assert calculate_backoff(1, base_delay=1.0, jitter=False) == 2.0
        assert calculate_backoff(2, base_delay=1.0, jitter=False) == 4.0
        assert calculate_backoff(3, base_delay=1.0, jitter=False) == 8.0

    def test_max_delay_cap(self):
        assert calculate_backoff(10, base_delay=1.0, max_delay=60.0, jitter=False) == 60.0

    def test_jitter_stays_within_half_to_full_delay(self):
        for _ in range(200):
            d = calculate_backoff(2, base_delay=1.0, jitter=True)
            assert 2.0 <= d <= 4.0

    def test_huge_attempt_saturates_at_max_delay(self):
        """Regression: computing the raw power for a large attempt used to
        raise OverflowError before the max_delay cap could apply."""
        assert calculate_backoff(2000, base_delay=1.0, max_delay=60.0, jitter=False) == 60.0
        assert calculate_backoff(10**6, base_delay=2.0, max_delay=30.0, jitter=True) <= 30.0

    def test_custom_exponential_base(self):
        assert calculate_backoff(2, base_delay=1.0, exponential_base=3.0, jitter=False) == 9.0


class TestRetryDecorator:
    """Decorator retry semantics."""

    def test_success_first_try_no_sleep(self, monkeypatch):
        sleeps = []
        monkeypatch.setattr(retry_mod.time, "sleep", sleeps.append)
        calls = []

        @retry(RetryConfig(max_retries=3))
        def fn():
            calls.append(1)
            return "ok"

        assert fn() == "ok"
        assert len(calls) == 1
        assert sleeps == []

    def test_retries_until_success(self, monkeypatch):
        sleeps = []
        monkeypatch.setattr(retry_mod.time, "sleep", sleeps.append)
        state = {"n": 0}

        @retry(RetryConfig(max_retries=3))
        def fn():
            state["n"] += 1
            if state["n"] < 3:
                raise ValueError("boom")
            return "ok"

        assert fn() == "ok"
        assert state["n"] == 3
        assert len(sleeps) == 2

    def test_exhausts_and_raises_last_exception(self, monkeypatch):
        monkeypatch.setattr(retry_mod.time, "sleep", lambda s: None)
        state = {"n": 0}

        @retry(RetryConfig(max_retries=2))
        def fn():
            state["n"] += 1
            raise ValueError(f"fail {state['n']}")

        with pytest.raises(ValueError, match="fail 3"):
            fn()
        assert state["n"] == 3  # 1 initial + 2 retries

    def test_non_retryable_exception_propagates_immediately(self, monkeypatch):
        monkeypatch.setattr(retry_mod.time, "sleep", lambda s: None)
        state = {"n": 0}

        @retry(RetryConfig(max_retries=3, retryable_exceptions=[ValueError]))
        def fn():
            state["n"] += 1
            raise KeyError("not retryable")

        with pytest.raises(KeyError):
            fn()
        assert state["n"] == 1

    def test_zero_max_retries_means_single_attempt(self, monkeypatch):
        monkeypatch.setattr(retry_mod.time, "sleep", lambda s: None)
        state = {"n": 0}

        @retry(RetryConfig(max_retries=0))
        def fn():
            state["n"] += 1
            raise ValueError("x")

        with pytest.raises(ValueError):
            fn()
        assert state["n"] == 1

    def test_default_config_retries_generic_exception(self, monkeypatch):
        monkeypatch.setattr(retry_mod.time, "sleep", lambda s: None)
        state = {"n": 0}

        @retry()
        def fn():
            state["n"] += 1
            raise RuntimeError("x")

        with pytest.raises(RuntimeError):
            fn()
        assert state["n"] == 4  # default max_retries=3


class TestCircuitBreaker:
    """Circuit breaker state machine contract."""

    def test_starts_closed_and_allows_calls(self):
        cb = CircuitBreaker()
        assert cb.state == CircuitBreaker.CLOSED
        assert cb.can_execute() is True

    def test_opens_at_failure_threshold(self):
        cb = CircuitBreaker(failure_threshold=3)
        for _ in range(3):
            cb.record_failure()
        assert cb.state == CircuitBreaker.OPEN
        assert cb.can_execute() is False

    def test_stays_closed_below_threshold(self):
        cb = CircuitBreaker(failure_threshold=3)
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.CLOSED

    def test_half_open_after_recovery_timeout(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=30.0)
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.OPEN
        cb._last_failure_time = time.monotonic() - 31.0
        assert cb.state == CircuitBreaker.HALF_OPEN
        assert cb.can_execute() is True

    def test_closes_after_success_threshold_in_half_open(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=30.0, success_threshold=2)
        cb.record_failure()
        cb.record_failure()
        cb._last_failure_time = time.monotonic() - 31.0
        assert cb.state == CircuitBreaker.HALF_OPEN
        cb.record_success()
        assert cb.state == CircuitBreaker.HALF_OPEN
        cb.record_success()
        assert cb.state == CircuitBreaker.CLOSED
        assert cb._failure_count == 0

    def test_failure_in_half_open_reopens_immediately(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=30.0)
        cb.record_failure()
        cb.record_failure()
        cb._last_failure_time = time.monotonic() - 31.0
        assert cb.state == CircuitBreaker.HALF_OPEN
        cb.record_failure()
        assert cb.state == CircuitBreaker.OPEN
        assert cb.can_execute() is False

    def test_success_decays_failure_count_when_closed(self):
        cb = CircuitBreaker(failure_threshold=5)
        cb.record_failure()
        cb.record_failure()
        cb.record_success()
        assert cb._failure_count == 1

    def test_recovery_timeout_resets_half_open_successes(self):
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=30.0, success_threshold=2)
        cb.record_failure()
        cb.record_failure()
        cb._last_failure_time = time.monotonic() - 31.0
        assert cb.state == CircuitBreaker.HALF_OPEN
        assert cb._success_count == 0
