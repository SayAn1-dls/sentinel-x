# Entry 076

**Module**: ThreatIntel
**Status**: ACTIVE

Added CSS neon glow effects to critical risk score indicators for immediate visual priority in the forensic HUD.

## Technical Notes
- Glow: box-shadow with HSL color based on risk score
- Risk 90-100: red glow (#ff0040)
- Risk 70-89: amber glow (#ff8c00)
- Pulse animation: 1.5s ease-in-out infinite