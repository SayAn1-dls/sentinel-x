# Entry 036

**Module**: CacheLayer
**Status**: ACTIVE

Implemented graph-based money laundering detection using directed acyclic graph analysis of transaction flows.

## Technical Notes
- Algorithm: modified Tarjan SCC for cycle detection
- Graph nodes: 10M+ wallets indexed
- Detection latency: <50ms per query