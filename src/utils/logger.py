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


class CorrelationFilter(logging.Filter):
    """Attach correlation IDs to log records for request tracing."""

    def __init__(self, correlation_id: str = ""):
        super().__init__()
        self.correlation_id = correlation_id

    def filter(self, record):
        record.correlation_id = self.correlation_id
        return True


def setup_file_handler(
    logger: logging.Logger,
    log_dir: str = "logs",
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 5,
) -> None:
    """Add rotating file handler to an existing logger.

    Args:
        logger: Target logger instance.
        log_dir: Directory for log files.
        max_bytes: Maximum size per log file before rotation (default 10MB).
        backup_count: Number of rotated files to keep.
    """
    os.makedirs(log_dir, exist_ok=True)
    file_path = os.path.join(log_dir, f"{logger.name}.log")

    file_handler = logging.handlers.RotatingFileHandler(
        file_path,
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)


def setup_timed_rotation(
    logger: logging.Logger,
    log_dir: str = "logs",
    when: str = "midnight",
    interval: int = 1,
    backup_count: int = 30,
) -> None:
    """Add time-based rotating file handler.

    Args:
        logger: Target logger instance.
        log_dir: Directory for log files.
        when: Rotation interval type ('midnight', 'h', 'd', 'w0'-'w6').
        interval: Number of intervals between rotations.
        backup_count: Number of rotated files to keep.
    """
    os.makedirs(log_dir, exist_ok=True)
    file_path = os.path.join(log_dir, f"{logger.name}.timed.log")

    handler = logging.handlers.TimedRotatingFileHandler(
        file_path,
        when=when,
        interval=interval,
        backupCount=backup_count,
        encoding="utf-8",
    )
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
