"""
Unit Tests for Sentinel-X Input Validation Module
===================================================
Tests for email, IP, sensor payload, and alert config validators.
"""

import pytest
from src.utils.validator import (
    validate_email,
    validate_ip_address,
    sanitize_string,
    validate_sensor_payload,
    validate_alert_config,
    ValidationError,
)


class TestEmailValidation:
    """Test suite for email address validation."""

    def test_valid_email(self):
        assert validate_email("user@example.com") is True

    def test_valid_email_with_subdomain(self):
        assert validate_email("admin@mail.sentinel-x.io") is True

    def test_valid_email_with_plus(self):
        assert validate_email("user+tag@example.com") is True

    def test_invalid_email_no_at(self):
        with pytest.raises(ValidationError) as exc_info:
            validate_email("invalid-email")
        assert exc_info.value.field == "email"

    def test_invalid_email_no_domain(self):
        with pytest.raises(ValidationError):
            validate_email("user@")

    def test_invalid_email_no_tld(self):
        with pytest.raises(ValidationError):
            validate_email("user@localhost")

    def test_empty_email(self):
        with pytest.raises(ValidationError):
            validate_email("")


class TestIPValidation:
    """Test suite for IPv4 address validation."""

    def test_valid_ip(self):
        assert validate_ip_address("192.168.1.1") is True

    def test_valid_ip_zeros(self):
        assert validate_ip_address("0.0.0.0") is True

    def test_valid_ip_max(self):
        assert validate_ip_address("255.255.255.255") is True

    def test_invalid_ip_too_few_octets(self):
        with pytest.raises(ValidationError):
            validate_ip_address("192.168.1")

    def test_invalid_ip_too_many_octets(self):
        with pytest.raises(ValidationError):
            validate_ip_address("192.168.1.1.1")

    def test_invalid_ip_octet_out_of_range(self):
        with pytest.raises(ValidationError):
            validate_ip_address("192.168.1.256")

    def test_invalid_ip_negative_octet(self):
        with pytest.raises(ValidationError):
            validate_ip_address("192.168.-1.1")

    def test_invalid_ip_non_numeric(self):
        with pytest.raises(ValidationError):
            validate_ip_address("192.168.abc.1")


class TestSanitizeString:
    """Test suite for string sanitization."""

    def test_normal_string_unchanged(self):
        assert sanitize_string("Hello, World!") == "Hello, World!"

    def test_strips_whitespace(self):
        assert sanitize_string("  hello  ") == "hello"

    def test_removes_null_bytes(self):
        assert sanitize_string("hello\x00world") == "helloworld"

    def test_removes_control_characters(self):
        result = sanitize_string("hello\x01\x02world")
        assert "\x01" not in result
        assert "\x02" not in result

    def test_truncates_long_string(self):
        long_str = "a" * 2000
        result = sanitize_string(long_str, max_length=100)
        assert len(result) == 100

    def test_preserves_newlines_and_tabs(self):
        result = sanitize_string("line1\nline2\ttab")
        assert "\n" in result
        assert "\t" in result


class TestSensorPayloadValidation:
    """Test suite for sensor payload validation."""

    def test_valid_payload(self):
        payload = {
            "sensor_id": "550e8400-e29b-41d4-a716-446655440000",
            "timestamp": "2026-08-28T10:30:00Z",
            "readings": [{"type": "temperature", "value": 25.0}],
        }
        assert validate_sensor_payload(payload) is True

    def test_missing_sensor_id(self):
        payload = {
            "timestamp": "2026-08-28T10:30:00Z",
            "readings": [{"type": "temperature", "value": 25.0}],
        }
        with pytest.raises(ValidationError):
            validate_sensor_payload(payload)

    def test_invalid_uuid_format(self):
        payload = {
            "sensor_id": "not-a-uuid",
            "timestamp": "2026-08-28T10:30:00Z",
            "readings": [{"type": "temperature", "value": 25.0}],
        }
        with pytest.raises(ValidationError):
            validate_sensor_payload(payload)

    def test_reading_without_value(self):
        payload = {
            "sensor_id": "550e8400-e29b-41d4-a716-446655440000",
            "timestamp": "2026-08-28T10:30:00Z",
            "readings": [{"type": "temperature"}],
        }
        with pytest.raises(ValidationError):
            validate_sensor_payload(payload)

    def test_non_numeric_reading_value(self):
        payload = {
            "sensor_id": "550e8400-e29b-41d4-a716-446655440000",
            "timestamp": "2026-08-28T10:30:00Z",
            "readings": [{"type": "temperature", "value": "hot"}],
        }
        with pytest.raises(ValidationError):
            validate_sensor_payload(payload)


class TestAlertConfigValidation:
    """Test suite for alert configuration validation."""

    def test_valid_config(self):
        config = {
            "severity": "high",
            "channels": ["email", "webhook"],
            "threshold": 10.0,
        }
        assert validate_alert_config(config) is True

    def test_invalid_severity(self):
        with pytest.raises(ValidationError):
            validate_alert_config({"severity": "extreme"})

    def test_invalid_channel(self):
        with pytest.raises(ValidationError):
            validate_alert_config({"channels": ["carrier_pigeon"]})

    def test_negative_threshold(self):
        with pytest.raises(ValidationError):
            validate_alert_config({"threshold": -5.0})
