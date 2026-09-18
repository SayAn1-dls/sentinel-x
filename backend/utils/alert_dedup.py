import hashlib
import time
from typing import Optional

class AlertDeduplicator:
    """
    Prevents duplicate alerts for the same transaction/node combo
    within a configurable TTL window.
    """
    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self._seen: dict[str, float] = {}

    def _key(self, tx_id: str, alert_type: str) -> str:
        raw = f'{tx_id}:{alert_type}'
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    def is_duplicate(self, tx_id: str, alert_type: str) -> bool:
        k = self._key(tx_id, alert_type)
        now = time.time()
        if k in self._seen:
            if now - self._seen[k] < self.ttl:
                return True
        self._seen[k] = now
        return False

    def clear_expired(self):
        now = time.time()
        self._seen = {k: t for k, t in self._seen.items() if now - t < self.ttl}
