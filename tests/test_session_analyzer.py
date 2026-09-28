"""Tests for SessionAnalyzer — src/modules/session_analyzer.py"""

import time
import pytest
from src.modules.session_analyzer import SessionAnalyzer, SessionEvent


# ── Fixtures ────────────────────────────────────────────────────────────────

def make_event(session_id="s1", user_id="u1", action="view",
               ip="1.2.3.4", user_agent="Chrome/120", country_code="IN",
               device_fingerprint="fp-abc", ts=None):
    return SessionEvent(
        session_id=session_id,
        user_id=user_id,
        timestamp=ts or time.time(),
        ip=ip,
        user_agent=user_agent,
        action=action,
        country_code=country_code,
        device_fingerprint=device_fingerprint,
    )


# ── UA shift ────────────────────────────────────────────────────────────────

def test_ua_shift_detected():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120"))
    anomalies = a.ingest(make_event(user_agent="Firefox/119"))
    types = [x.anomaly_type for x in anomalies]
    assert "UA_SHIFT" in types

def test_same_ua_no_anomaly():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120"))
    anomalies = a.ingest(make_event(user_agent="Chrome/120"))
    assert not any(x.anomaly_type == "UA_SHIFT" for x in anomalies)


# ── Country shift ────────────────────────────────────────────────────────────

def test_country_shift_detected():
    a = SessionAnalyzer()
    a.ingest(make_event(country_code="IN"))
    anomalies = a.ingest(make_event(country_code="RU"))
    assert any(x.anomaly_type == "IP_COUNTRY_SHIFT" for x in anomalies)

def test_same_country_no_anomaly():
    a = SessionAnalyzer()
    a.ingest(make_event(country_code="IN"))
    anomalies = a.ingest(make_event(country_code="IN"))
    assert not any(x.anomaly_type == "IP_COUNTRY_SHIFT" for x in anomalies)


# ── Fingerprint change ───────────────────────────────────────────────────────

def test_fingerprint_change_detected():
    a = SessionAnalyzer()
    a.ingest(make_event(device_fingerprint="fp-aaa"))
    anomalies = a.ingest(make_event(device_fingerprint="fp-bbb"))
    assert any(x.anomaly_type == "FINGERPRINT_CHANGE" for x in anomalies)


# ── Hijack composite rule ────────────────────────────────────────────────────

def test_hijack_suspected_on_ua_and_country_shift():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120", country_code="IN"))
    a.ingest(make_event(user_agent="Firefox/119", country_code="IN"))   # UA shift
    anomalies = a.ingest(make_event(user_agent="Firefox/119", country_code="RU"))  # country shift
    all_types = {x.anomaly_type for x in a.anomalies_for_session("s1")}
    assert "HIJACK_SUSPECTED" in all_types

def test_hijack_not_fired_without_both_signals():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120", country_code="IN"))
    anomalies = a.ingest(make_event(user_agent="Firefox/119", country_code="IN"))
    assert not any(x.anomaly_type == "HIJACK_SUSPECTED" for x in anomalies)

def test_hijack_not_duplicated():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120", country_code="IN"))
    a.ingest(make_event(user_agent="Firefox/119", country_code="RU"))
    a.ingest(make_event(user_agent="Firefox/119", country_code="US"))
    hijacks = [x for x in a.anomalies_for_session("s1") if x.anomaly_type == "HIJACK_SUSPECTED"]
    assert len(hijacks) == 1


# ── Concurrent sessions ──────────────────────────────────────────────────────

def test_concurrent_sessions_flagged():
    a = SessionAnalyzer(concurrent_ip_threshold=1)
    a.ingest(make_event(session_id="s1", user_id="u1", ip="1.1.1.1"))
    a.ingest(make_event(session_id="s2", user_id="u1", ip="2.2.2.2"))
    anomalies = a.ingest(make_event(session_id="s3", user_id="u1", ip="3.3.3.3"))
    assert any(x.anomaly_type == "CONCURRENT_SESSION" for x in anomalies)

def test_single_session_no_concurrent_flag():
    a = SessionAnalyzer()
    anomalies = a.ingest(make_event(session_id="s1", user_id="u1", ip="1.1.1.1"))
    assert not any(x.anomaly_type == "CONCURRENT_SESSION" for x in anomalies)


# ── Rapid burst ──────────────────────────────────────────────────────────────

def test_rapid_burst_detected():
    a = SessionAnalyzer(burst_threshold=3, burst_window=60)
    now = time.time()
    for i in range(5):
        a.ingest(make_event(action="view", ts=now + i))
    assert any(x.anomaly_type == "RAPID_BURST" for x in a.anomalies_for_session("s1"))

def test_no_burst_below_threshold():
    a = SessionAnalyzer(burst_threshold=10, burst_window=60)
    now = time.time()
    for i in range(5):
        a.ingest(make_event(action="view", ts=now + i))
    assert not any(x.anomaly_type == "RAPID_BURST" for x in a.anomalies_for_session("s1"))


# ── Off-hours ─────────────────────────────────────────────────────────────────

def test_off_hours_sensitive_action_flagged():
    a = SessionAnalyzer()
    midnight_ts = 0.0  # Unix 0 = Thursday midnight UTC
    anomalies = a.ingest(make_event(action="transfer", ts=midnight_ts))
    assert any(x.anomaly_type == "OFF_HOURS_ACTIVITY" for x in anomalies)

def test_non_sensitive_action_not_flagged_off_hours():
    a = SessionAnalyzer()
    anomalies = a.ingest(make_event(action="view", ts=0.0))
    assert not any(x.anomaly_type == "OFF_HOURS_ACTIVITY" for x in anomalies)


# ── Severity and score ────────────────────────────────────────────────────────

def test_hijack_is_critical():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120", country_code="IN"))
    a.ingest(make_event(user_agent="Firefox/119", country_code="RU"))
    a.ingest(make_event(user_agent="Firefox/119", country_code="US"))
    hijack = next(x for x in a.anomalies_for_session("s1") if x.anomaly_type == "HIJACK_SUSPECTED")
    assert hijack.severity == "CRITICAL"
    assert hijack.score >= 0.9

def test_all_scores_in_range():
    a = SessionAnalyzer(burst_threshold=2, burst_window=60, concurrent_ip_threshold=1)
    now = time.time()
    a.ingest(make_event(session_id="s1", user_id="u1", ip="1.1.1.1", ts=now))
    a.ingest(make_event(session_id="s2", user_id="u1", ip="2.2.2.2", ts=now+1))
    a.ingest(make_event(session_id="s1", user_id="u1", ua="Firefox", ts=now+2))
    for anomaly in a._anomalies:
        assert 0.0 <= anomaly.score <= 1.0


# ── Summary and query ─────────────────────────────────────────────────────────

def test_summary_empty():
    a = SessionAnalyzer()
    assert a.summary() == {"total": 0}

def test_summary_has_correct_total():
    a = SessionAnalyzer()
    a.ingest(make_event(user_agent="Chrome/120", country_code="IN"))
    a.ingest(make_event(user_agent="Firefox/119", country_code="RU"))
    s = a.summary()
    assert s["total"] >= 1
    assert "by_type" in s
    assert "by_severity" in s

def test_top_anomalies_ordered():
    a = SessionAnalyzer(burst_threshold=2, burst_window=60)
    now = time.time()
    for i in range(4):
        a.ingest(make_event(action="transfer", ts=now + i))
    top = a.top_anomalies(n=3)
    for i in range(len(top) - 1):
        assert top[i].score >= top[i+1].score

def test_batch_ingest_same_as_sequential():
    a1, a2 = SessionAnalyzer(), SessionAnalyzer()
    events = [
        make_event(session_id="s1", user_agent="Chrome/120", country_code="IN", ts=1000.0),
        make_event(session_id="s1", user_agent="Firefox/119", country_code="RU", ts=1001.0),
    ]
    for e in events:
        a1.ingest(e)
    a2.ingest_batch(events)
    assert len(a1._anomalies) == len(a2._anomalies)
