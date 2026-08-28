"""
Sentinel-X Configuration Management
=====================================
Centralized configuration with environment variable support,
validation, and sensible defaults for all system components.
"""

import os
from typing import Any, Dict, Optional, List
from dataclasses import dataclass, field


@dataclass
class DatabaseConfig:
    """Database connection configuration."""
    host: str = "localhost"
    port: int = 27017
    name: str = "sentinel_x"
    username: str = ""
    password: str = ""
    connection_pool_size: int = 10
    timeout_ms: int = 5000
    ssl_enabled: bool = True

    @classmethod
    def from_env(cls) -> "DatabaseConfig":
        """Load database config from environment variables."""
        return cls(
            host=os.getenv("SENTINEL_DB_HOST", "localhost"),
            port=int(os.getenv("SENTINEL_DB_PORT", "27017")),
            name=os.getenv("SENTINEL_DB_NAME", "sentinel_x"),
            username=os.getenv("SENTINEL_DB_USER", ""),
            password=os.getenv("SENTINEL_DB_PASSWORD", ""),
            connection_pool_size=int(os.getenv("SENTINEL_DB_POOL_SIZE", "10")),
            timeout_ms=int(os.getenv("SENTINEL_DB_TIMEOUT", "5000")),
            ssl_enabled=os.getenv("SENTINEL_DB_SSL", "true").lower() == "true",
        )


@dataclass
class RedisConfig:
    """Redis cache configuration."""
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: str = ""
    max_connections: int = 20
    key_prefix: str = "sentinel:"
    ttl_seconds: int = 3600

    @classmethod
    def from_env(cls) -> "RedisConfig":
        """Load Redis config from environment variables."""
        return cls(
            host=os.getenv("SENTINEL_REDIS_HOST", "localhost"),
            port=int(os.getenv("SENTINEL_REDIS_PORT", "6379")),
            db=int(os.getenv("SENTINEL_REDIS_DB", "0")),
            password=os.getenv("SENTINEL_REDIS_PASSWORD", ""),
            max_connections=int(os.getenv("SENTINEL_REDIS_MAX_CONN", "20")),
            key_prefix=os.getenv("SENTINEL_REDIS_PREFIX", "sentinel:"),
            ttl_seconds=int(os.getenv("SENTINEL_REDIS_TTL", "3600")),
        )


@dataclass
class AlertConfig:
    """Alert system configuration."""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    webhook_url: str = ""
    webhook_secret: str = ""
    slack_webhook_url: str = ""
    cooldown_minutes: int = 5
    max_alerts_per_hour: int = 100
    escalation_timeout_minutes: int = 30

    @classmethod
    def from_env(cls) -> "AlertConfig":
        """Load alert config from environment variables."""
        return cls(
            smtp_host=os.getenv("SENTINEL_SMTP_HOST", "smtp.gmail.com"),
            smtp_port=int(os.getenv("SENTINEL_SMTP_PORT", "587")),
            smtp_user=os.getenv("SENTINEL_SMTP_USER", ""),
            smtp_password=os.getenv("SENTINEL_SMTP_PASSWORD", ""),
            webhook_url=os.getenv("SENTINEL_WEBHOOK_URL", ""),
            webhook_secret=os.getenv("SENTINEL_WEBHOOK_SECRET", ""),
            slack_webhook_url=os.getenv("SENTINEL_SLACK_WEBHOOK", ""),
            cooldown_minutes=int(os.getenv("SENTINEL_ALERT_COOLDOWN", "5")),
            max_alerts_per_hour=int(os.getenv("SENTINEL_MAX_ALERTS_HOUR", "100")),
            escalation_timeout_minutes=int(os.getenv("SENTINEL_ESCALATION_TIMEOUT", "30")),
        )
