"""
Sentinel-X Input Validation Module
====================================
Provides comprehensive input validation for API requests,
configuration values, and sensor data payloads.
"""

import re
from typing import Any, Optional, List, Dict


class ValidationError(Exception):
    """Raised when input validation fails."""

    def __init__(self, field: str, message: str, value: Any = None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"Validation failed for '{field}': {message}")


def validate_email(email: str) -> bool:
    """Validate email address format.

    Args:
        email: Email address string to validate.

    Returns:
        True if valid, raises ValidationError otherwise.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("email", "Invalid email format", email)
    return True


def validate_ip_address(ip: str) -> bool:
    """Validate IPv4 address format.

    Args:
        ip: IP address string to validate.

    Returns:
        True if valid, raises ValidationError otherwise.
    """
    parts = ip.split(".")
    if len(parts) != 4:
        raise ValidationError("ip_address", "Must have 4 octets", ip)
    for part in parts:
        try:
            num = int(part)
            if num < 0 or num > 255:
                raise ValidationError("ip_address", f"Octet {part} out of range", ip)
        except ValueError:
            raise ValidationError("ip_address", f"Non-numeric octet: {part}", ip)
    return True


def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Sanitize user input string by removing dangerous characters.

    Args:
        value: Raw input string.
        max_length: Maximum allowed length.

    Returns:
        Sanitized string.
    """
    if len(value) > max_length:
        value = value[:max_length]
    # Remove null bytes and control characters
    value = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', value)
    return value.strip()


def validate_sensor_payload(payload: Dict[str, Any]) -> bool:
    """Validate incoming sensor data payload structure.

    Expected format:
        {
            "sensor_id": "string (uuid format)",
            "timestamp": "ISO 8601 string",
            "readings": [{"type": "string", "value": float}],
            "metadata": {"location": "string", ...}
        }

    Args:
        payload: Dictionary representing sensor data.

    Returns:
        True if valid.

    Raises:
        ValidationError: If any required field is missing or malformed.
    """
    required_fields = ["sensor_id", "timestamp", "readings"]
    for field in required_fields:
        if field not in payload:
            raise ValidationError(field, f"Required field '{field}' is missing")

    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    if not re.match(uuid_pattern, payload["sensor_id"], re.IGNORECASE):
        raise ValidationError("sensor_id", "Must be a valid UUID", payload["sensor_id"])

    if not isinstance(payload["readings"], list):
        raise ValidationError("readings", "Must be a list of reading objects")

    for i, reading in enumerate(payload["readings"]):
        if "type" not in reading or "value" not in reading:
            raise ValidationError(
                f"readings[{i}]", "Each reading must have 'type' and 'value'"
            )
        if not isinstance(reading["value"], (int, float)):
            raise ValidationError(
                f"readings[{i}].value", "Value must be numeric", reading["value"]
            )

    return True


def validate_alert_config(config: Dict[str, Any]) -> bool:
    """Validate alert configuration parameters.

    Args:
        config: Alert configuration dictionary.

    Returns:
        True if valid.

    Raises:
        ValidationError: If configuration is invalid.
    """
    valid_severities = ["low", "medium", "high", "critical"]
    if "severity" in config:
        if config["severity"] not in valid_severities:
            raise ValidationError(
                "severity",
                f"Must be one of {valid_severities}",
                config["severity"],
            )

    valid_channels = ["email", "webhook", "sms", "slack"]
    if "channels" in config:
        for ch in config["channels"]:
            if ch not in valid_channels:
                raise ValidationError("channels", f"Unknown channel: {ch}", ch)

    if "threshold" in config:
        if not isinstance(config["threshold"], (int, float)) or config["threshold"] < 0:
            raise ValidationError(
                "threshold", "Must be a non-negative number", config["threshold"]
            )

    return True
