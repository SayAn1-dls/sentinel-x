"""
Sentinel-X Retry Utilities
=============================
Configurable retry logic with exponential backoff, jitter,
and circuit breaker pattern for resilient external calls.
"""

import time
import random
from typing import Callable, TypeVar, Optional, List, Type
from functools import wraps
from dataclasses import dataclass


T = TypeVar("T")


@dataclass
class RetryConfig:
    """Configuration for retry behavior."""
    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0
    exponential_base: float = 2.0
    jitter: bool = True
    retryable_exceptions: List[Type[Exception]] = None

    def __post_init__(self):
        if self.retryable_exceptions is None:
            self.retryable_exceptions = [Exception]


def calculate_backoff(
    attempt: int,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
) -> float:
    """Calculate delay for a retry attempt with exponential backoff.

    Args:
        attempt: Current attempt number (0-indexed).
        base_delay: Initial delay in seconds.
        max_delay: Maximum delay cap.
        exponential_base: Base for exponential growth.
        jitter: Whether to add random jitter.

    Returns:
        Delay in seconds before the next retry.
    """
    delay = min(base_delay * (exponential_base ** attempt), max_delay)
    if jitter:
        delay = delay * (0.5 + random.random() * 0.5)
    return delay


def retry(config: Optional[RetryConfig] = None):
    """Decorator for automatic retry with configurable backoff.

    Args:
        config: RetryConfig instance. Uses defaults if not provided.

    Returns:
        Decorated function with retry behavior.

    Example:
        @retry(RetryConfig(max_retries=5, base_delay=2.0))
        def call_external_api():
            ...
    """
    if config is None:
        config = RetryConfig()

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            for attempt in range(config.max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except tuple(config.retryable_exceptions) as e:
                    last_exception = e
                    if attempt < config.max_retries:
                        delay = calculate_backoff(
                            attempt,
                            config.base_delay,
                            config.max_delay,
                            config.exponential_base,
                            config.jitter,
                        )
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator


class CircuitBreaker:
    """Circuit breaker pattern for protecting external service calls.

    States:
    - CLOSED: Normal operation, calls pass through.
    - OPEN: Too many failures, calls are rejected immediately.
    - HALF_OPEN: Testing recovery, allowing limited calls.

    Attributes:
        failure_threshold: Failures before opening the circuit.
        recovery_timeout: Seconds before transitioning to half-open.
        success_threshold: Successes in half-open before closing.
    """

    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        success_threshold: int = 2,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self._state = self.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: Optional[float] = None

    @property
    def state(self) -> str:
        """Get current circuit state, checking for timeout transitions."""
        if self._state == self.OPEN and self._last_failure_time:
            if time.monotonic() - self._last_failure_time >= self.recovery_timeout:
                self._state = self.HALF_OPEN
                self._success_count = 0
        return self._state

    def record_success(self) -> None:
        """Record a successful call."""
        if self.state == self.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self.success_threshold:
                self._state = self.CLOSED
                self._failure_count = 0
        elif self.state == self.CLOSED:
            self._failure_count = max(0, self._failure_count - 1)

    def record_failure(self) -> None:
        """Record a failed call."""
        self._failure_count += 1
        self._last_failure_time = time.monotonic()
        if self._failure_count >= self.failure_threshold:
            self._state = self.OPEN

    def can_execute(self) -> bool:
        """Check if a call is allowed through the circuit."""
        return self.state != self.OPEN
