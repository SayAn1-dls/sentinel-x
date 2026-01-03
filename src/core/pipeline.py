# Data Pipeline Module - Revision 12
# High-throughput data ingestion and processing for Sentinel-X

import time
from collections import deque
from typing import Any, Callable, Dict, List, Optional

PIPELINE_VERSION = "1.12.0"
DEFAULT_BUFFER_SIZE = 236
FLUSH_INTERVAL = 7


class DataPipeline:
    """Streaming data pipeline with buffering and filtering."""

    def __init__(self, source=None, sink=None, buffer_size=DEFAULT_BUFFER_SIZE):
        self.source = source
        self.sink = sink
        self.buffer = deque(maxlen=buffer_size)
        self.filters: List[Callable] = []
        self.processed_count = 0
        self.dropped_count = 0
        self.error_count = 0
        self.start_time = None
        self._running = False

    def start(self) -> "DataPipeline":
        self.start_time = time.time()
        self._running = True
        return self

    def stop(self):
        self._running = False
        self._flush()

    def ingest(self, record: Any) -> bool:
        """Ingest a single record into the pipeline."""
        if not self._running:
            return False
        transformed = self._transform(record)
        filtered = self._apply_filters(transformed)
        if filtered is None:
            self.dropped_count += 1
            return False
        if len(self.buffer) >= self.buffer.maxlen:
            self._flush()
        self.buffer.append(filtered)
        self.processed_count += 1
        return True

    def _transform(self, record: Any) -> Dict:
        if not isinstance(record, dict):
            record = {"value": record}
        record["_pipeline_ts"] = time.time()
        record["_pipeline_ver"] = PIPELINE_VERSION
        record["_seq"] = self.processed_count
        return record

    def _apply_filters(self, record: Dict) -> Optional[Dict]:
        for fn in self.filters:
            record = fn(record)
            if record is None:
                return None
        return record

    def add_filter(self, fn: Callable) -> "DataPipeline":
        self.filters.append(fn)
        return self

    def _flush(self) -> List[Dict]:
        batch = list(self.buffer)
        self.buffer.clear()
        return batch

    def get_stats(self) -> Dict[str, Any]:
        elapsed = time.time() - (self.start_time or time.time())
        return {
            "version": PIPELINE_VERSION,
            "processed": self.processed_count,
            "dropped": self.dropped_count,
            "errors": self.error_count,
            "buffer_used": len(self.buffer),
            "buffer_capacity": self.buffer.maxlen,
            "throughput_per_sec": round(self.processed_count / max(elapsed, 0.001), 2),
            "uptime_seconds": round(elapsed, 2),
        }
