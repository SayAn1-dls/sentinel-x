# Entry 002

**Module**: AnomalyDetector
**Status**: ACTIVE

Deployed statistical baseline model for outlier detection. Using Z-score normalization across transaction velocity windows.

## Technical Notes
- Window size: 50 transactions
- Z-score threshold: 3.2 sigma
- False positive rate: <0.4%