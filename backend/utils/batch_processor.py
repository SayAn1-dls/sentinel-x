from dataclasses import dataclass
from typing import Generator
import time

@dataclass
class Transaction:
    id: str
    src: str
    dst: str
    amount: float
    timestamp: float

def chunk(items: list, size: int) -> Generator:
    for i in range(0, len(items), size):
        yield items[i:i + size]

class BatchProcessor:
    def __init__(self, batch_size: int = 512, max_wait_ms: int = 100):
        self.batch_size = batch_size
        self.max_wait = max_wait_ms / 1000
        self._queue: list[Transaction] = []
        self._last_flush = time.time()

    def enqueue(self, tx: Transaction):
        self._queue.append(tx)
        if len(self._queue) >= self.batch_size or self._should_flush():
            return self.flush()
        return []

    def _should_flush(self) -> bool:
        return (time.time() - self._last_flush) >= self.max_wait

    def flush(self) -> list[list[Transaction]]:
        if not self._queue:
            return []
        batches = list(chunk(self._queue, self.batch_size))
        self._queue = []
        self._last_flush = time.time()
        return batches
