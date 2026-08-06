# Entry 110

**Module**: CacheLayer
**Status**: ACTIVE

Implemented Anycast routing via Cloudflare for global forensic API latency reduction across 6 continents.

## Technical Notes
- CDN: Cloudflare Workers at edge (200+ PoPs)
- API latency p50: 23ms globally (was 180ms)
- Edge caching: forensic public datasets cached at edge for 60s