"""
Sentinel-X Rate Limiter
========================
Token bucket and sliding window rate limiting for API endpoints
and sensor telemetry ingestion.
"""

import time
from typing import Dict, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class RateLimitResult:
    """Result of a rate limit check."""
    allowed: bool
    remaining: int
    limit: int
    reset_at: float
    retry_after: Optional[float] = None


class TokenBucketLimiter:
    """Token bucket rate limiter for smooth request throttling.

    Each client gets a bucket that refills at a constant rate.
    Requests consume tokens; when the bucket is empty, requests
    are rejected until tokens refill.

    Attributes:
        capacity: Maximum number of tokens per bucket.
        refill_rate: Tokens added per second.
    """

    def __init__(self, capacity: int = 100, refill_rate: float = 10.0):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self._buckets: Dict[str, Tuple[float, float]] = {}

    def _refill(self, key: str) -> float:
        """Calculate current token count after refill.

        Args:
            key: Client identifier.

        Returns:
            Current token count.
        """
        now = time.monotonic()
        tokens, last_refill = self._buckets.get(key, (self.capacity, now))
        elapsed = now - last_refill
        tokens = min(self.capacity, tokens + elapsed * self.refill_rate)
        self._buckets[key] = (tokens, now)
        return tokens

    def consume(self, key: str, tokens: int = 1) -> RateLimitResult:
        """Attempt to consume tokens from a client's bucket.

        Args:
            key: Client identifier (e.g., API key, IP address).
            tokens: Number of tokens to consume.

        Returns:
            RateLimitResult indicating if the request is allowed.
        """
        current_tokens = self._refill(key)

        if current_tokens >= tokens:
            self._buckets[key] = (current_tokens - tokens, time.monotonic())
            return RateLimitResult(
                allowed=True,
                remaining=int(current_tokens - tokens),
                limit=self.capacity,
                reset_at=time.monotonic() + (self.capacity - current_tokens + tokens) / self.refill_rate,
            )
        else:
            wait_time = (tokens - current_tokens) / self.refill_rate
            return RateLimitResult(
                allowed=False,
                remaining=0,
                limit=self.capacity,
                reset_at=time.monotonic() + wait_time,
                retry_after=wait_time,
            )
