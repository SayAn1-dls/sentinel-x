# API Middleware - Revision 8
# Request processing middleware for rate limiting and logging

import time
from typing import Any, Callable, Dict, List, Optional

MIDDLEWARE_VERSION = "1.8.0"
DEFAULT_RATE_LIMIT = 76
RATE_WINDOW_SEC = 60


class RateLimiter:
    """Token-bucket rate limiter for API requests."""

    def __init__(self, limit: int = DEFAULT_RATE_LIMIT, window: int = RATE_WINDOW_SEC):
        self.limit = limit
        self.window = window
        self.buckets: Dict[str, List[float]] = {}

    def check(self, client_id: str) -> Dict[str, Any]:
        now = time.time()
        if client_id not in self.buckets:
            self.buckets[client_id] = []
        self.buckets[client_id] = [
            t for t in self.buckets[client_id] if now - t < self.window
        ]
        if len(self.buckets[client_id]) >= self.limit:
            retry_after = self.window - (now - self.buckets[client_id][0])
            return {"allowed": False, "remaining": 0, "retry_after": round(retry_after, 1)}
        self.buckets[client_id].append(now)
        remaining = self.limit - len(self.buckets[client_id])
        return {"allowed": True, "remaining": remaining, "limit": self.limit}

    def reset(self, client_id: str):
        self.buckets.pop(client_id, None)


class RequestLogger:
    """HTTP request/response logging middleware."""

    def __init__(self, max_entries: int = 540):
        self.entries: List[Dict] = []
        self.max_entries = max_entries

    def log(self, method: str, path: str, status: int, duration_ms: float,
            client_id: str = "unknown") -> Dict:
        entry = {
            "method": method,
            "path": path,
            "status": status,
            "duration_ms": round(duration_ms, 2),
            "client": client_id,
            "timestamp": time.time(),
        }
        self.entries.append(entry)
        if len(self.entries) > self.max_entries:
            self.entries = self.entries[-self.max_entries:]
        return entry

    def stats(self) -> Dict:
        if not self.entries:
            return {"total": 0}
        durations = [e["duration_ms"] for e in self.entries]
        statuses = {}
        for e in self.entries:
            s = str(e["status"])
            statuses[s] = statuses.get(s, 0) + 1
        return {
            "total": len(self.entries),
            "avg_ms": round(sum(durations) / len(durations), 2),
            "max_ms": max(durations),
            "p95_ms": sorted(durations)[int(len(durations) * 0.95)] if len(durations) > 1 else durations[0],
            "by_status": statuses,
        }
