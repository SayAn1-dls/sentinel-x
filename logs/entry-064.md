# Entry 064

**Module**: CacheLayer
**Status**: ACTIVE

Implemented block header caching to reduce redundant RPC calls to Ethereum nodes by 94%.

## Technical Notes
- Cache: LRU with 10,000 block capacity
- RPC calls reduced from 2.1M/day to 126K/day
- Cost savings: ~$840/month in Infura credits