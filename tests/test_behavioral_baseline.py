"""Unit tests for the BehavioralBaseline profiling engine.

Note on semantics: evaluate() ingests the event into the profile BEFORE
scoring, so per-user counts include the current event. Country rarity is
checked against PRIOR counts (a first-seen country must flag NEW_COUNTRY);
hour and action checks intentionally include the current event.
"""

from src.modules.behavioral_baseline import (
    BehavioralBaseline,
    BehaviorEvent,
)

HOUR = 3600
DAY = 86400
# 2026-10-26 00:00:00 UTC - a Monday
BASE_TS = 1761696000.0


def _ev(user, ts, action="login", country="IN", duration=None, bytes_=None):
    return BehaviorEvent(user_id=user, timestamp=ts, action=action,
                         country=country, duration_seconds=duration,
                         bytes_transferred=bytes_)


def _trained(n=40, user="u1", **kwargs):
    """Baseline of n events at hour 10 UTC, country IN, action login."""
    bb = BehavioralBaseline(min_samples=10)
    bb.train([_ev(user, BASE_TS + 10 * HOUR + i * DAY, **kwargs) for i in range(n)])
    return bb


class TestTraining:
    def test_train_sorts_events(self):
        bb = BehavioralBaseline(min_samples=10)
        events = [_ev("u1", BASE_TS + 10 * HOUR + i * DAY) for i in range(15)]
        bb.train(list(reversed(events)))
        gaps = bb.profile("u1").gaps
        assert all(0 < g < DAY for g in gaps)

    def test_gaps_over_one_day_ignored(self):
        bb = BehavioralBaseline(min_samples=10)
        bb.train([_ev("u1", BASE_TS), _ev("u1", BASE_TS + 3 * DAY)])
        assert bb.profile("u1").gaps == []

    def test_zero_gap_ignored(self):
        bb = BehavioralBaseline(min_samples=10)
        bb.train([_ev("u1", BASE_TS), _ev("u1", BASE_TS)])
        assert bb.profile("u1").gaps == []

    def test_profiles_are_per_user(self):
        bb = BehavioralBaseline(min_samples=10)
        bb.train([_ev("u1", BASE_TS), _ev("u2", BASE_TS)])
        assert bb.profile("u1").sample_count == 1
        assert bb.profile("u2").sample_count == 1
        assert bb.profile("u3") is None


class TestEvaluateBaseline:
    def test_insufficient_baseline_is_neutral(self):
        bb = BehavioralBaseline(min_samples=10)
        bb.train([_ev("u1", BASE_TS + i * DAY) for i in range(8)])
        report = bb.evaluate(_ev("u1", BASE_TS + 9 * DAY, country="RU"))
        assert report.deviations == ["INSUFFICIENT_BASELINE"]
        assert report.risk_score == 0.0
        assert report.flagged is False

    def test_normal_event_not_flagged(self):
        bb = _trained()
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY))
        assert report.deviations == []
        assert report.risk_score == 0.0

    def test_new_country_flagged(self):
        bb = _trained()
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY, country="RU"))
        assert any(d.startswith("NEW_COUNTRY:RU") for d in report.deviations)
        # prior_pct = 0 -> score contribution 1.0
        assert report.risk_score == 1.0
        assert report.severity == "CRITICAL"

    def test_rare_country_flagged(self):
        bb = BehavioralBaseline(min_samples=10)
        events = [_ev("u1", BASE_TS + 10 * HOUR + i * DAY) for i in range(39)]
        events.append(_ev("u1", BASE_TS + 10 * HOUR + 39 * DAY, country="DE"))
        bb.train(events)
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY, country="DE"))
        assert any(d.startswith("RARE_COUNTRY:DE") for d in report.deviations)

    def test_unusual_hour_flagged(self):
        bb = _trained()  # all activity at hour 10 UTC
        report = bb.evaluate(_ev("u1", BASE_TS + 3 * HOUR + 40 * DAY))
        assert any(d.startswith("UNUSUAL_HOUR:03h") for d in report.deviations)

    def test_common_hour_not_flagged(self):
        bb = _trained()
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY))
        assert not any(d.startswith("UNUSUAL_HOUR") for d in report.deviations)

    def test_abnormal_duration_flagged(self):
        bb = _trained(duration=60.0)
        # Baseline: 40 samples of 60s. A 2-hour session is a strong outlier.
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY, duration=7200.0))
        assert any(d.startswith("ABNORMAL_DURATION") for d in report.deviations)

    def test_normal_duration_not_flagged(self):
        bb = _trained(duration=60.0)
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY, duration=60.0))
        assert not any(d.startswith("ABNORMAL_DURATION") for d in report.deviations)

    def test_high_data_volume_flagged(self):
        bb = _trained(bytes_=1000)
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY, bytes_=5_000_000))
        assert any(d.startswith("HIGH_DATA_VOLUME") for d in report.deviations)

    def test_low_volume_not_flagged(self):
        # Volume check only fires ABOVE baseline (z > threshold, one-sided).
        bb = _trained(bytes_=5_000_000)
        report = bb.evaluate(_ev("u1", BASE_TS + 10 * HOUR + 40 * DAY, bytes_=1))
        assert not any(d.startswith("HIGH_DATA_VOLUME") for d in report.deviations)


class TestScoringInternals:
    def test_z_score_insufficient_samples(self):
        assert BehavioralBaseline._z_score(5.0, [1.0]) is None

    def test_z_score_zero_variance(self):
        assert BehavioralBaseline._z_score(99.0, [7.0, 7.0, 7.0]) == 0.0

    def test_aggregate_empty(self):
        assert BehavioralBaseline._aggregate_score([]) == 0.0

    def test_aggregate_dampened_combination(self):
        # max first, then each extra contributes s * (1 - combined) * 0.5
        assert BehavioralBaseline._aggregate_score([0.5, 0.5]) == 0.625
        assert BehavioralBaseline._aggregate_score([0.2]) == 0.2

    def test_severity_bands(self):
        assert BehavioralBaseline._severity(0.85) == "CRITICAL"
        assert BehavioralBaseline._severity(0.65) == "HIGH"
        assert BehavioralBaseline._severity(0.4) == "MEDIUM"
        assert BehavioralBaseline._severity(0.2) == "LOW"


class TestProfileQueries:
    def test_top_countries(self):
        bb = BehavioralBaseline(min_samples=10)
        events = [_ev("u1", BASE_TS + i * HOUR) for i in range(6)]
        events += [_ev("u1", BASE_TS + (10 + i) * HOUR, country="DE") for i in range(3)]
        events.append(_ev("u1", BASE_TS + 20 * HOUR, country="US"))
        bb.train(events)
        top = bb.top_countries("u1", 2)
        assert top[0][0] == "IN"
        assert top[1][0] == "DE"

    def test_top_countries_unknown_user(self):
        assert BehavioralBaseline().top_countries("nope") == []

    def test_peak_hours(self):
        bb = BehavioralBaseline(min_samples=10)
        events = [_ev("u1", BASE_TS + 10 * HOUR + i * DAY) for i in range(8)]
        events += [_ev("u1", BASE_TS + 11 * HOUR + i * DAY) for i in range(7)]
        events += [_ev("u1", BASE_TS + 3 * HOUR + i * DAY) for i in range(2)]
        bb.train(events)
        # Hours 10 and 11 dominate; hour 3 is below 70% of max.
        assert bb.peak_hours("u1") == [10, 11]

    def test_avg_session_duration(self):
        bb = BehavioralBaseline(min_samples=10)
        bb.train([_ev("u1", BASE_TS + i * HOUR, duration=60.0) for i in range(4)])
        assert bb.avg_session_duration("u1") == 60.0
        assert bb.avg_session_duration("unknown") is None

    def test_evaluate_batch_sorts_by_time(self):
        bb = _trained()
        later = _ev("u1", BASE_TS + 10 * HOUR + 41 * DAY)
        earlier = _ev("u1", BASE_TS + 10 * HOUR + 40 * DAY)
        reports = bb.evaluate_batch([later, earlier])
        assert reports[0].event is earlier
        assert reports[1].event is later
