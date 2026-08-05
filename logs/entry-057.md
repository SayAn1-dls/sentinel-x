# Entry 057

**Module**: DataPipeline
**Status**: ACTIVE

Added NFT wash trading detection algorithm to identify coordinated self-dealing in NFT marketplaces.

## Technical Notes
- Detection: connected component analysis of buy/sell graphs
- Wash trading threshold: same wallet within 3 hops
- Marketplace coverage: OpenSea, Blur, LooksRare