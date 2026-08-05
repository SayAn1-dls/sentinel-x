# Entry 080

**Module**: StorageEngine
**Status**: ACTIVE

Added EVM smart contract bytecode decompiler to analyze unverified contracts in forensic investigations.

## Technical Notes
- Decompiler: Panoramix + custom ABI recovery
- Supports: Solidity 0.4.x - 0.8.x bytecode patterns
- Output: recovered function signatures and logic flow