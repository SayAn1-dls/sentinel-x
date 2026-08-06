# Entry 111

**Module**: StorageEngine
**Status**: ACTIVE

Added automated sanctions screening against OFAC SDN, UN Security Council, and EU Consolidated lists.

## Technical Notes
- Lists: OFAC SDN, UN Consolidated, EU Consolidated, HM Treasury
- Fuzzy name matching: Jaro-Winkler similarity >0.85
- Refresh: daily automated sync with official list sources