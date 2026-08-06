# Entry 119

**Module**: APIGateway
**Status**: ACTIVE

Added immutable evidence hash anchoring — all forensic reports are cryptographically anchored to the Bitcoin blockchain for tamper-proof chain of custody.

## Technical Notes
- Anchoring: OP_RETURN output with SHA-256 report hash
- Cost: ~$0.02 per anchor via batched transaction
- Verification: public tool at sentinel-x.verify for any report hash
- Legal admissibility: accepted in 14 jurisdictions as tamper evidence