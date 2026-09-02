# Sensor Integration Guide

This guide covers how to connect sensors and IoT devices to Sentinel-X.

## Supported Sensor Types

| Type              | Protocol         | Format  |
|-------------------|------------------|---------|
| IP Camera         | RTSP / HTTP MJPEG| Binary  |
| Motion Sensor     | HTTP POST        | JSON    |
| Temperature Probe | MQTT / HTTP POST | JSON    |
| Custom IoT Device | HTTP POST        | JSON    |

## Ingestion Endpoint

```
POST /api/v1/ingest
Authorization: Bearer <sensor-api-key>
Content-Type: application/json
```

### Payload Format

```json
{
  "sensor_id": "temp-lab-01",
  "sensor_type": "temperature",
  "timestamp": "2026-09-02T12:00:00Z",
  "value": 38.5,
  "unit": "celsius",
  "location": "Lab A"
}
```

### Field Reference

| Field        | Type   | Required | Description                          |
|--------------|--------|----------|--------------------------------------|
| sensor_id    | string | ✅       | Unique sensor identifier             |
| sensor_type  | string | ✅       | camera / motion / temperature / custom |
| timestamp    | string | ✅       | ISO 8601 UTC                         |
| value        | number | ✅       | Reading value                        |
| unit         | string | ❌       | Unit of measurement                  |
| location     | string | ❌       | Human-readable location label        |
| metadata     | object | ❌       | Any additional key-value pairs       |

## Registering a Sensor

1. Go to Dashboard → Sensors → Add Sensor
2. Enter the sensor name, type, and location
3. Copy the generated API key — it won't be shown again
4. Configure your device to POST to `/api/v1/ingest` with the API key in the Authorization header

## MQTT Support

For MQTT-capable devices, publish to:
```
topic: sentinel-x/ingest/{sensor_id}
broker: <your-sentinel-x-host>:1883
```

Payload format is identical to the HTTP POST JSON schema above.

## Rate Limits

- Default: 60 readings/minute per sensor
- Burst: up to 10 readings/second for 5 seconds
- Exceeding limits returns HTTP 429; implement exponential backoff
