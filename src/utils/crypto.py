"""
Sentinel-X Cryptographic Utilities
====================================
Provides hashing, token generation, and data integrity
verification functions used across the platform.
"""

import hashlib
import hmac
import secrets
import base64
from typing import Optional


def generate_api_key(prefix: str = "sk", length: int = 32) -> str:
    """Generate a cryptographically secure API key.

    Args:
        prefix: Key prefix for identification (e.g., 'sk' for secret key).
        length: Number of random bytes to generate.

    Returns:
        Formatted API key string like 'sk_a1b2c3d4...'
    """
    random_bytes = secrets.token_bytes(length)
    key_body = base64.urlsafe_b64encode(random_bytes).decode("ascii").rstrip("=")
    return f"{prefix}_{key_body}"


def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    """Hash a password using PBKDF2-SHA256 with a random salt.

    Args:
        password: The plaintext password.
        salt: Optional salt bytes; generated if not provided.

    Returns:
        Formatted hash string: 'pbkdf2:sha256:iterations$salt$hash'
    """
    if salt is None:
        salt = secrets.token_bytes(16)
    iterations = 260000
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    salt_hex = salt.hex()
    hash_hex = dk.hex()
    return f"pbkdf2:sha256:{iterations}${salt_hex}${hash_hex}"


def verify_password(password: str, hash_string: str) -> bool:
    """Verify a password against a stored hash.

    Args:
        password: Plaintext password to verify.
        hash_string: Stored hash in 'pbkdf2:sha256:iterations$salt$hash' format.

    Returns:
        True if the password matches.
    """
    try:
        _, _, rest = hash_string.split(":", 2)
        iterations_str, salt_hex, expected_hash = rest.split("$")
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(dk.hex(), expected_hash)
    except (ValueError, AttributeError):
        return False


def compute_hmac(message: str, secret: str) -> str:
    """Compute HMAC-SHA256 for message integrity verification.

    Args:
        message: The message to sign.
        secret: The shared secret key.

    Returns:
        Hex-encoded HMAC digest.
    """
    return hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_hmac(message: str, secret: str, signature: str) -> bool:
    """Verify an HMAC signature.

    Args:
        message: The original message.
        secret: The shared secret key.
        signature: The HMAC signature to verify.

    Returns:
        True if signature is valid.
    """
    expected = compute_hmac(message, secret)
    return hmac.compare_digest(expected, signature)


def generate_session_token(length: int = 48) -> str:
    """Generate a secure session token.

    Args:
        length: Number of random bytes.

    Returns:
        URL-safe base64 encoded token.
    """
    return secrets.token_urlsafe(length)
