# Entry 091

**Module**: ThreatIntel
**Status**: ACTIVE

Implemented stablecoin depegging attack forensics module to detect and trace coordinated depeg events.

## Technical Notes
- Price feed: Chainlink oracle aggregation
- Attack patterns: coordinated short, liquidity drain, oracle manipulation
- Alert threshold: >0.5% depeg from peg price