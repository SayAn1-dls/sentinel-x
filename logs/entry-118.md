# Entry 118

**Module**: StorageEngine
**Status**: ACTIVE

Added rug pull pre-detection heuristics to warn investigators of DeFi protocols showing exit scam indicators.

## Technical Notes
- Indicators: LP lock expiry, team token unlock cliff, admin key concentration
- Risk scoring: weighted composite of 12 on-chain signals
- Early warning window: average 4.2 hours before historical rug pulls