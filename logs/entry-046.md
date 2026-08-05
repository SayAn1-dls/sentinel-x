# Entry 046

**Module**: ThreatIntel
**Status**: ACTIVE

Migrated scikit-learn fraud detection models to ONNX runtime for 8x inference speedup.

## Technical Notes
- ONNX runtime: v1.17.0
- Inference time: 0.8ms (down from 6.4ms)
- Model quantization: INT8 for edge deployment