# Sentinel-X FAQ

## General

*Q: What sensor types does Sentinel-X support?*
A: Cameras (RTSP/MJPEG), motion sensors, temperature probes, and any custom IoT device that can POST JSON over HTTP or MQTT. See docs/sensor-integration.md.

*Q: Does it work offline?*
A: The detection engine and local dashboard work without internet. Cloud alerting (email, Slack) requires connectivity.

*Q: How many sensors can one instance handle?*
A: Benchmarked at 500 concurrent sensors on a 2-core / 4GB RAM machine with <200ms alert latency. Scale horizontally for larger deployments.

## Alerts

*Q: I'm getting too many alerts. How do I reduce noise?*
A: Increase the cooldown window or Z-score threshold for noisy sensors. See docs/threat-model.md for per-detector configuration.

*Q: Can I silence alerts during maintenance windows?*
A: Yes — go to Dashboard → Sensors → select sensor → Schedule Maintenance. Alerts from that sensor are suppressed for the defined window.

## Data & Privacy

*Q: Where is sensor data stored?*
A: MongoDB (self-hosted or Atlas). Raw telemetry is retained for 90 days by default (configurable via TTL index).

*Q: Is camera footage stored?*
A: Sentinel-X does not store video streams. Only metadata (motion detected, occupancy count, timestamp) is persisted.

## Deployment

*Q: Can I run this on a Raspberry Pi?*
A: Yes for small deployments (under 10 sensors). Use the lightweight `low` detection profile in settings.

*Q: Is Docker required?*
A: No, but recommended for easier setup and upgrades.
