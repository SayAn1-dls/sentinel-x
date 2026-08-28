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


@dataclass
class SecurityConfig:
    """Security and authentication settings."""
    jwt_secret: str = ""
    jwt_expiry_hours: int = 24
    bcrypt_rounds: int = 12
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60
    cors_origins: List[str] = field(default_factory=lambda: ["http://localhost:3000"])
    api_key_header: str = "X-API-Key"
    enable_audit_log: bool = True

    @classmethod
    def from_env(cls) -> "SecurityConfig":
        """Load security config from environment variables."""
        origins = os.getenv("SENTINEL_CORS_ORIGINS", "http://localhost:3000")
        return cls(
            jwt_secret=os.getenv("SENTINEL_JWT_SECRET", ""),
            jwt_expiry_hours=int(os.getenv("SENTINEL_JWT_EXPIRY", "24")),
            bcrypt_rounds=int(os.getenv("SENTINEL_BCRYPT_ROUNDS", "12")),
            rate_limit_requests=int(os.getenv("SENTINEL_RATE_LIMIT", "100")),
            rate_limit_window_seconds=int(os.getenv("SENTINEL_RATE_WINDOW", "60")),
            cors_origins=origins.split(","),
            api_key_header=os.getenv("SENTINEL_API_KEY_HEADER", "X-API-Key"),
            enable_audit_log=os.getenv("SENTINEL_AUDIT_LOG", "true").lower() == "true",
        )


@dataclass
class AppConfig:
    """Root application configuration aggregating all sub-configs."""
    app_name: str = "Sentinel-X"
    version: str = "2.0.0-alpha"
    environment: str = "development"
    debug: bool = False
    log_level: str = "INFO"
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    redis: RedisConfig = field(default_factory=RedisConfig)
    alert: AlertConfig = field(default_factory=AlertConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)

    @classmethod
    def from_env(cls) -> "AppConfig":
        """Build complete application config from environment."""
        return cls(
            app_name=os.getenv("SENTINEL_APP_NAME", "Sentinel-X"),
            version=os.getenv("SENTINEL_VERSION", "2.0.0-alpha"),
            environment=os.getenv("SENTINEL_ENV", "development"),
            debug=os.getenv("SENTINEL_DEBUG", "false").lower() == "true",
            log_level=os.getenv("SENTINEL_LOG_LEVEL", "INFO"),
            database=DatabaseConfig.from_env(),
            redis=RedisConfig.from_env(),
            alert=AlertConfig.from_env(),
            security=SecurityConfig.from_env(),
        )

    def validate(self) -> List[str]:
        """Validate configuration and return list of warnings.

        Returns:
            List of warning messages for misconfigured values.
        """
        warnings = []
        if not self.security.jwt_secret:
            warnings.append("JWT secret is not set — using empty string is insecure")
        if self.debug and self.environment == "production":
            warnings.append("Debug mode is enabled in production")
        if self.security.bcrypt_rounds < 10:
            warnings.append(f"bcrypt rounds ({self.security.bcrypt_rounds}) is below recommended minimum of 10")
        if self.redis.ttl_seconds < 60:
            warnings.append(f"Redis TTL ({self.redis.ttl_seconds}s) is very low")
        return warnings
