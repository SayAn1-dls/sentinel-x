# Entry 041

**Module**: RiskEngine
**Status**: ACTIVE

Added IP geolocation enrichment to tag transaction origins with country, city, and risk score.

## Technical Notes
- Provider: MaxMind GeoIP2
- Lookup latency: <1ms (in-memory DB)
- High-risk countries: auto-flagged with OFAC screening