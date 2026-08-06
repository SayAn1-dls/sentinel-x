# Entry 097

**Module**: WebSocket
**Status**: ACTIVE

Implemented DeFi flash loan attack detection pipeline with sub-block analysis and profit tracing.

## Technical Notes
- Detection: single-transaction borrow+exploit+repay pattern
- Profit threshold: >$10,000 USD equivalent
- Protocols monitored: Aave, Compound, dYdX, Euler, Morpho