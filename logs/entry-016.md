# Entry 016

**Module**: ThreatIntel
**Status**: ACTIVE

Implemented rate limiting on high-frequency scan endpoints to prevent abuse and ensure platform stability.

## Technical Notes
- Rate limit: 1000 req/min per API key
- Sliding window algorithm
- Headers: X-RateLimit-Remaining, X-RateLimit-Reset