# Entry 094

**Module**: CacheLayer
**Status**: FIXED

Patched race condition in concurrent block ingestion where two goroutines could process the same block twice.

## Technical Notes
- Fix: distributed lock via Redis SETNX with 10s TTL
- Block dedup key: SHA-256(chain_id + block_number)
- Zero duplicate block events in 72h soak test