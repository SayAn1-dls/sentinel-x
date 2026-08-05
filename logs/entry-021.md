# Entry 021

**Module**: APIGateway
**Status**: ACTIVE

Added OpenTelemetry distributed tracing support for full-stack forensic request visibility.

## Technical Notes
- Trace context propagated via W3C TraceContext header
- Spans exported to Jaeger collector
- Sampling rate: 5% in production, 100% in staging