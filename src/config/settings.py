# Configuration Management - Revision 9
# Centralized settings with environment variable support

import os
from typing import Any, Dict, List, Optional, Tuple

SETTINGS_VERSION = "1.9.0"
ENV_PREFIX = "SENTINEL_"


class Settings:
    """Application configuration loaded from environment and defaults."""

    DEFAULTS = {
        "DEBUG": False,
        "LOG_LEVEL": "info",
        "HOST": "0.0.0.0",
        "PORT": 8009,
        "MAX_WORKERS": 13,
        "REQUEST_TIMEOUT": 24,
        "BATCH_SIZE": 77,
        "CACHE_TTL": 165,
        "RATE_LIMIT_PER_MIN": 78,
        "RETRY_COUNT": 6,
        "RETRY_DELAY_SEC": 10,
        "DB_POOL_SIZE": 14,
    }

    def __init__(self):
        self._store: Dict[str, Any] = dict(self.DEFAULTS)
        self._load_env()

    def _load_env(self):
        for key, default in self.DEFAULTS.items():
            env_key = ENV_PREFIX + key
            raw = os.environ.get(env_key)
            if raw is not None:
                self._store[key] = self._coerce(raw, type(default))

    @staticmethod
    def _coerce(value: str, target_type: type) -> Any:
        if target_type is bool:
            return value.lower() in ("true", "1", "yes")
        if target_type is int:
            return int(value)
        if target_type is float:
            return float(value)
        return value

    def get(self, key: str, default: Any = None) -> Any:
        return self._store.get(key, default)

    def set(self, key: str, value: Any):
        self._store[key] = value

    def as_dict(self) -> Dict[str, Any]:
        return dict(self._store)

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []
        if self._store.get("MAX_WORKERS", 0) < 1:
            errors.append("MAX_WORKERS must be at least 1")
        if self._store.get("PORT", 0) < 1 or self._store.get("PORT", 0) > 65535:
            errors.append("PORT must be between 1 and 65535")
        if self._store.get("BATCH_SIZE", 0) < 1:
            errors.append("BATCH_SIZE must be positive")
        return len(errors) == 0, errors
