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
