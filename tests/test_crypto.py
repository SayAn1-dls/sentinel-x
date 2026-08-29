"""
Unit Tests for Cryptographic Utilities
========================================
"""

import pytest
from src.utils.crypto import (
    generate_api_key,
    hash_password,
    verify_password,
    compute_hmac,
    verify_hmac,
    generate_session_token,
)


class TestAPIKeyGeneration:
    """Test API key generation."""

    def test_default_prefix(self):
        key = generate_api_key()
        assert key.startswith("sk_")

    def test_custom_prefix(self):
        key = generate_api_key(prefix="pk")
        assert key.startswith("pk_")

    def test_unique_keys(self):
        keys = {generate_api_key() for _ in range(100)}
        assert len(keys) == 100

    def test_key_length(self):
        key = generate_api_key(length=16)
        assert len(key) > 5  # prefix + underscore + encoded bytes


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_and_verify(self):
        password = "secure_password_123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_wrong_password_fails(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_hash_format(self):
        hashed = hash_password("test")
        assert hashed.startswith("pbkdf2:sha256:")
        parts = hashed.split("$")
        assert len(parts) == 3

    def test_different_salts_produce_different_hashes(self):
        h1 = hash_password("same_password")
        h2 = hash_password("same_password")
        assert h1 != h2

    def test_invalid_hash_returns_false(self):
        assert verify_password("test", "invalid_hash") is False


class TestHMAC:
    """Test HMAC computation and verification."""

    def test_compute_and_verify(self):
        message = "webhook payload"
        secret = "webhook_secret_key"
        sig = compute_hmac(message, secret)
        assert verify_hmac(message, secret, sig) is True

    def test_tampered_message_fails(self):
        sig = compute_hmac("original", "secret")
        assert verify_hmac("tampered", "secret", sig) is False

    def test_wrong_secret_fails(self):
        sig = compute_hmac("message", "correct_secret")
        assert verify_hmac("message", "wrong_secret", sig) is False

    def test_deterministic(self):
        sig1 = compute_hmac("message", "secret")
        sig2 = compute_hmac("message", "secret")
        assert sig1 == sig2


class TestSessionToken:
    """Test session token generation."""

    def test_token_not_empty(self):
        token = generate_session_token()
        assert len(token) > 0

    def test_tokens_unique(self):
        tokens = {generate_session_token() for _ in range(100)}
        assert len(tokens) == 100
