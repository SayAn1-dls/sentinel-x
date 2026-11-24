"""
Unit Tests for Date & Time Utilities
======================================
Contract tests for timezone handling, ISO round-trips,
time windows, and human-readable deltas.
"""

from datetime import datetime, timedelta, timezone
import pytest
from src.utils.date_utils import (
    IST,
    UTC,
    now_utc,
    now_ist,
    to_utc,
    to_ist,
    format_iso,
    parse_iso,
    time_window,
    human_readable_delta,
)


class TestTimezoneConstants:
    def test_utc_is_utc(self):
        assert UTC == timezone.utc

    def test_ist_offset(self):
        assert IST.utcoffset(None) == timedelta(hours=5, minutes=30)


class TestNow:
    def test_now_utc_is_aware_utc(self):
        n = now_utc()
        assert n.tzinfo is not None
        assert n.utcoffset() == timedelta(0)

    def test_now_ist_is_aware_ist(self):
        n = now_ist()
        assert n.utcoffset() == timedelta(hours=5, minutes=30)

    def test_now_pair_same_instant(self):
        u = now_utc()
        i = now_ist()
        assert abs((u - i.astimezone(UTC)).total_seconds()) < 1.0


class TestToUtc:
    def test_naive_assumed_utc(self):
        dt = datetime(2026, 1, 15, 10, 30)
        out = to_utc(dt)
        assert out.tzinfo == UTC
        assert (out.hour, out.minute) == (10, 30)

    def test_aware_ist_converted(self):
        dt = datetime(2026, 1, 15, 12, 0, tzinfo=IST)
        out = to_utc(dt)
        assert out.hour == 6
        assert out.minute == 30

    def test_already_utc_unchanged_instant(self):
        dt = datetime(2026, 1, 15, 10, 30, tzinfo=UTC)
        assert to_utc(dt) == dt


class TestToIst:
    def test_naive_assumed_utc_then_converted(self):
        dt = datetime(2026, 1, 15, 0, 0)
        out = to_ist(dt)
        assert out.tzinfo == IST
        assert out.hour == 5
        assert out.minute == 30

    def test_aware_utc_converted(self):
        dt = datetime(2026, 1, 15, 18, 45, tzinfo=UTC)
        out = to_ist(dt)
        assert (out.hour, out.minute) == (0, 15)
        assert out.day == 16


class TestIsoRoundTrip:
    def test_format_parse_round_trip_aware(self):
        dt = datetime(2026, 3, 9, 14, 22, 8, tzinfo=IST)
        assert parse_iso(format_iso(dt)) == dt

    def test_parse_z_suffix(self):
        dt = parse_iso("2026-01-15T10:30:00Z")
        assert dt.tzinfo is not None
        assert dt.utcoffset() == timedelta(0)
        assert (dt.hour, dt.minute) == (10, 30)

    def test_parse_explicit_offset(self):
        dt = parse_iso("2026-01-15T10:30:00+05:30")
        assert dt.utcoffset() == timedelta(hours=5, minutes=30)

    def test_parse_naive_string(self):
        dt = parse_iso("2026-01-15T10:30:00")
        assert dt.tzinfo is None

    def test_parse_invalid_raises(self):
        with pytest.raises(ValueError):
            parse_iso("not a date")


class TestTimeWindow:
    def test_centered_window(self):
        center = datetime(2026, 1, 15, 12, 0, tzinfo=UTC)
        start, end = time_window(center, minutes=60)
        assert start == datetime(2026, 1, 15, 11, 30, tzinfo=UTC)
        assert end == datetime(2026, 1, 15, 12, 30, tzinfo=UTC)

    def test_odd_minutes_split_evenly(self):
        center = datetime(2026, 1, 15, 12, 0, tzinfo=UTC)
        start, end = time_window(center, minutes=7)
        assert (center - start) == timedelta(minutes=3.5)
        assert (end - center) == timedelta(minutes=3.5)

    def test_default_center_is_now(self):
        before = now_utc()
        start, end = time_window(minutes=60)
        after = now_utc()
        assert start <= before
        assert end >= after


class TestHumanReadableDelta:
    @pytest.mark.parametrize("delta,expected", [
        (timedelta(seconds=45), "45s"),
        (timedelta(seconds=0), "0s"),
        (timedelta(minutes=5), "5m"),
        (timedelta(hours=1), "1h"),
        (timedelta(hours=2, minutes=30), "2h 30m"),
        (timedelta(hours=2, seconds=15), "2h 15s"),
        (timedelta(minutes=90), "1h 30m"),
    ])
    def test_positive_deltas(self, delta, expected):
        assert human_readable_delta(delta) == expected

    def test_negative_delta_gets_minus_prefix(self):
        assert human_readable_delta(timedelta(minutes=-90)) == "-1h 30m"
        assert human_readable_delta(timedelta(seconds=-45)) == "-45s"
