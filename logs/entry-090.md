# Entry 090

**Module**: NetworkMonitor
**Status**: ACTIVE

Added TOR exit node detection to identify transaction submissions routed through anonymization networks.

## Technical Notes
- TOR exit node list: updated hourly from dan.me.uk/torlist
- VPN detection: IPQualityScore API integration
- Flags: TOR, VPN, Datacenter, Residential proxy