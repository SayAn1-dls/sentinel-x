"""
Sentinel-X Date & Time Utilities
==================================
Consistent timezone handling, ISO formatting, and
time window calculations for the platform.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple


# IST timezone offset
IST = timezone(timedelta(hours=5, minutes=30))
UTC = timezone.utc


def now_utc() -> datetime:
    """Get current UTC datetime with timezone info."""
    return datetime.now(UTC)


def now_ist() -> datetime:
    """Get current IST datetime with timezone info."""
    return datetime.now(IST)


def to_utc(dt: datetime) -> datetime:
    """Convert a datetime to UTC.

    Args:
        dt: Input datetime (timezone-aware or naive).

    Returns:
        UTC datetime. Naive datetimes are assumed to be UTC.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt.astimezone(UTC)


def to_ist(dt: datetime) -> datetime:
    """Convert a datetime to IST.

    Args:
        dt: Input datetime.

    Returns:
        IST datetime.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(IST)


def format_iso(dt: datetime) -> str:
    """Format datetime as ISO 8601 string.

    Args:
        dt: Input datetime.

    Returns:
        ISO 8601 formatted string.
    """
    return dt.isoformat()


def parse_iso(iso_string: str) -> datetime:
    """Parse an ISO 8601 datetime string.

    Args:
        iso_string: ISO formatted datetime string.

    Returns:
        Parsed datetime object.

    Raises:
        ValueError: If the string cannot be parsed.
    """
    # Handle 'Z' suffix
    if iso_string.endswith("Z"):
        iso_string = iso_string[:-1] + "+00:00"
    return datetime.fromisoformat(iso_string)


def time_window(
    center: Optional[datetime] = None,
    minutes: int = 60,
) -> Tuple[datetime, datetime]:
    """Calculate a time window centered around a datetime.

    Args:
        center: Center of the window (default: now UTC).
        minutes: Total window duration in minutes.

    Returns:
        Tuple of (start, end) datetimes.
    """
    if center is None:
        center = now_utc()
    half = timedelta(minutes=minutes / 2)
    return center - half, center + half


def human_readable_delta(delta: timedelta) -> str:
    """Format a timedelta as a human-readable string.

    Args:
        delta: Time difference.

    Returns:
        String like '2h 30m' or '45s'.
    """
    total_seconds = int(delta.total_seconds())
    if total_seconds < 0:
        total_seconds = abs(total_seconds)
        prefix = "-"
    else:
        prefix = ""

    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)

    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if seconds > 0 or not parts:
        parts.append(f"{seconds}s")

    return prefix + " ".join(parts)
