"""
Sentinel-X Structured Logging Module
=====================================
Provides centralized, structured logging with rotation support,
JSON formatting, and configurable log levels.
"""

import logging
import logging.handlers
import json
import os
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured log output."""

    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "correlation_id"):
            log_entry["correlation_id"] = record.correlation_id
        return json.dumps(log_entry)


def get_logger(name: str, log_level: str = "INFO") -> logging.Logger:
    """Create and configure a logger with JSON formatting and rotation.

    Args:
        name: Logger name, typically __name__ of the calling module.
        log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR, CRITICAL).

    Returns:
        Configured logging.Logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    if not logger.handlers:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(JSONFormatter())
        logger.addHandler(console_handler)

    return logger
