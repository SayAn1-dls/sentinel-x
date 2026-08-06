# Entry 095

**Module**: StorageEngine
**Status**: ACTIVE

Added Bitcoin Lightning Network forensics to trace off-chain payment channel flows.

## Technical Notes
- Data source: LN node gossip protocol + 1ML.com API
- Channel capacity indexed: 5,200+ BTC
- Routing path reconstruction: Dijkstra on channel graph