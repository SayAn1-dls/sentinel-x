# Entry 067

**Module**: WebSocket
**Status**: FIXED

Corrected elevated false positive rate in high-velocity trading detection module.

## Technical Notes
- Root cause: velocity threshold too aggressive for DeFi arbitrage bots
- Fix: separate thresholds for CEX vs DeFi transaction types
- False positive rate reduced from 2.1% to 0.3%