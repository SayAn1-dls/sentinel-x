"""Unit tests for the untested network/auth anomaly detectors.

Covers C2BeaconDetector, CredentialStuffingDetector and
DnsAnomalyDetector from src/modules/.
"""

from src.modules.c2_beacon_detector import (
    BeaconConfig,
    C2BeaconDetector,
    ConnectionRecord,
)
from src.modules.credential_stuffing_detector import (
    CredentialStuffingDetector,
    LoginAttempt,
    StuffingConfig,
)
from src.modules.dns_anomaly import DnsAnomalyDetector, DnsQuery


def _records(src, host, port, gaps, size=100):
    """Build connection records from a list of inter-arrival gaps."""
    ts, out = 0.0, []
    for g in [0.0] + list(gaps):
        ts += g
        out.append(ConnectionRecord(src, host, port, ts, size))
    return out


class TestC2BeaconDetector:
    def test_ignores_allowlisted_hosts(self):
        d = C2BeaconDetector()
        d.ingest(ConnectionRecord("10.0.0.1", "time.windows.com", 123, 0.0, 48))
        assert d.ingest_many([]) == 0
        assert d.analyze() == []

    def test_regular_beacon_scores_high(self):
        d = C2BeaconDetector()
        d.ingest_many(_records("10.0.0.1", "evil.example.com", 443, [60.0] * 19))
        results = d.analyze()
        assert len(results) == 1
        cand = results[0]
        assert cand.src_ip == "10.0.0.1"
        assert cand.interval_cv == 0.0
        assert cand.score == 0.89  # 0.6 regularity + 0.25 uniform size + 0.04 volume
        assert cand.reasons

    def test_irregular_traffic_not_flagged(self):
        d = C2BeaconDetector()
        gaps = [3, 900, 2, 1200, 5, 700, 1, 1500, 4, 800, 2, 2000, 6, 400, 3, 1100, 2, 900, 5]
        recs = _records("10.0.0.2", "cdn.example.com", 443, gaps)
        for i, r in enumerate(recs):
            r.bytes_out = 100 + (i % 7) * 500
        d.ingest_many(recs)
        assert d.analyze() == []

    def test_too_few_connections_returns_none(self):
        d = C2BeaconDetector()
        d.ingest_many(_records("10.0.0.3", "x.example.com", 443, [60.0] * 6))
        assert d.analyze() == []

    def test_intervals_below_minimum_returns_none(self):
        d = C2BeaconDetector()
        d.ingest_many(_records("10.0.0.4", "y.example.com", 443, [2.0] * 19))
        assert d.analyze() == []

    def test_coefficient_of_variation_edge_cases(self):
        assert C2BeaconDetector.coefficient_of_variation([]) == float("inf")
        assert C2BeaconDetector.coefficient_of_variation([5.0]) == float("inf")
        assert C2BeaconDetector.coefficient_of_variation([0.0, 0.0]) == float("inf")
        assert C2BeaconDetector.coefficient_of_variation([10.0, 10.0, 10.0]) == 0.0

    def test_trim_outliers_only_for_ten_plus(self):
        values = list(range(1, 10))
        assert C2BeaconDetector.trim_outliers(values) == values
        twenty = list(range(1, 21))
        assert C2BeaconDetector.trim_outliers(twenty) == list(range(3, 19))

    def test_reset_clears_channels(self):
        d = C2BeaconDetector()
        d.ingest_many(_records("10.0.0.1", "evil.example.com", 443, [60.0] * 19))
        d.reset()
        assert d.analyze() == []


class TestCredentialStuffingDetector:
    def _attempt(self, ip, user, success=False, ua="ua-1", ts=1000.0):
        return LoginAttempt(ip, user, success, ua, ts)

    def test_stuffing_alert_at_threshold(self):
        d = CredentialStuffingDetector()
        alerts = []
        for i in range(15):
            alerts.extend(d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i)))
        assert len(alerts) == 1
        assert alerts[0].pattern == "credential_stuffing"
        assert alerts[0].distinct_users == 15

    def test_below_user_threshold_no_alert(self):
        d = CredentialStuffingDetector()
        alerts = []
        for i in range(14):
            alerts.extend(d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i)))
        assert alerts == []

    def test_low_failure_ratio_no_alert(self):
        d = CredentialStuffingDetector()
        alerts = []
        for i in range(20):
            # Successes arrive first: 5 successes then 15 failures -> ratio 0.75 < 0.8.
            # (The detector is streaming: an alert fires the moment thresholds hold,
            # so ordering matters.)
            alerts.extend(d.observe(self._attempt("1.2.3.4", f"user{i}", success=(i < 5), ts=1000.0 + i)))
        assert alerts == []

    def test_cooldown_suppresses_repeat_alert(self):
        d = CredentialStuffingDetector()
        for i in range(15):
            d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i))
        second = []
        for i in range(15, 30):
            second.extend(d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i)))
        # Stuffing is on cooldown; reaching 30 users legitimately fires spray instead.
        assert not any(a.pattern == "credential_stuffing" for a in second)

    def test_spray_pattern_detected(self):
        # Raise the stuffing bar so only the spray check can fire.
        d = CredentialStuffingDetector(StuffingConfig(stuffing_min_users=1000))
        alerts = []
        for i in range(30):
            alerts.extend(d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i)))
        assert [a.pattern for a in alerts] == ["password_spray"]

    def test_distributed_attack_detected(self):
        d = CredentialStuffingDetector()
        alerts = []
        for i in range(20):
            alerts.extend(d.observe(self._attempt(f"10.0.0.{i}", f"user{i}", ua="same-agent", ts=1000.0 + i)))
        assert len(alerts) == 1
        assert alerts[0].pattern == "distributed_stuffing"
        # Distributed alerts carry an aggregate label, not a blockable IP.
        assert d.blocklist_candidates() == []

    def test_window_eviction_drops_old_attempts(self):
        d = CredentialStuffingDetector()
        for i in range(14):
            d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i))
        # 400s later the window (300s) has expired; one new attempt is not enough.
        alerts = d.observe(self._attempt("1.2.3.4", "user-new", ts=1401.0))
        assert alerts == []

    def test_blocklist_candidates_filters_confidence(self):
        d = CredentialStuffingDetector()
        for i in range(15):
            d.observe(self._attempt("1.2.3.4", f"user{i}", ts=1000.0 + i))
        # 15 users, all failures -> confidence 0.667, so the boundary is pinned.
        assert d.blocklist_candidates(min_confidence=0.6) == ["1.2.3.4"]
        assert d.blocklist_candidates(min_confidence=0.7) == []


class TestDnsAnomalyDetector:
    def test_shannon_entropy(self):
        assert DnsAnomalyDetector.shannon_entropy("") == 0.0
        assert DnsAnomalyDetector.shannon_entropy("aaaa") == 0.0
        assert DnsAnomalyDetector.shannon_entropy("ab") == 1.0

    def test_registered_label(self):
        assert DnsAnomalyDetector.registered_label("a.b.example.com") == "example"
        assert DnsAnomalyDetector.registered_label("example.com") == "example"
        assert DnsAnomalyDetector.registered_label("localhost") == "localhost"

    def test_consonant_ratio_no_letters(self):
        d = DnsAnomalyDetector()
        assert d.consonant_ratio("12345") == 0.0

    def test_dga_domain_flagged(self):
        d = DnsAnomalyDetector()
        found = d.inspect(DnsQuery("10.0.0.1", "xkcdqzwvbnmrp.com", timestamp=1000.0))
        assert [f.reason for f in found] == ["dga_domain"]
        assert found[0].score >= 0.7

    def test_benign_domain_not_flagged(self):
        d = DnsAnomalyDetector()
        assert d.inspect(DnsQuery("10.0.0.1", "google.com", timestamp=1000.0)) == []

    def test_short_label_never_dga(self):
        d = DnsAnomalyDetector()
        assert d.dga_score("xkcd.com") == 0.0

    def test_long_label_flagged_as_tunneling(self):
        d = DnsAnomalyDetector()
        qname = "a" * 50 + ".example.com"
        found = d.inspect(DnsQuery("10.0.0.1", qname, timestamp=1000.0))
        assert any(f.reason == "dns_tunneling" for f in found)

    def test_nxdomain_storm_at_threshold(self):
        d = DnsAnomalyDetector()
        for i in range(24):
            assert d.inspect(DnsQuery("10.0.0.9", f"miss{i}.example.com", rcode="NXDOMAIN", timestamp=1000.0 + i)) == []
        found = d.inspect(DnsQuery("10.0.0.9", "miss24.example.com", rcode="NXDOMAIN", timestamp=1024.0))
        assert [f.reason for f in found] == ["nxdomain_storm"]

    def test_nxdomain_storm_window_expiry(self):
        d = DnsAnomalyDetector()
        for i in range(24):
            d.inspect(DnsQuery("10.0.0.9", f"miss{i}.example.com", rcode="NXDOMAIN", timestamp=1000.0 + i * 10))
        # Spaced 10s apart over 240s; the 60s window never holds 25.
        found = d.inspect(DnsQuery("10.0.0.9", "miss24.example.com", rcode="NXDOMAIN", timestamp=1240.0))
        assert found == []

    def test_excessive_txt_ratio(self):
        d = DnsAnomalyDetector()
        for i in range(19):
            qtype = "TXT" if i < 7 else "A"
            assert d.inspect(DnsQuery("10.0.0.5", f"q{i}.example.com", qtype=qtype, timestamp=1000.0 + i)) == []
        # 20th query, 8 TXT of 20 total -> ratio 0.4 hits the threshold.
        found = d.inspect(DnsQuery("10.0.0.5", "q19.example.com", qtype="TXT", timestamp=1019.0))
        assert any(f.reason == "excessive_txt" for f in found)

    def test_top_offenders_ranked_by_cumulative_score(self):
        d = DnsAnomalyDetector()
        d.inspect(DnsQuery("10.0.0.1", "xkcdqzwvbnmrp.com", timestamp=1000.0))
        for i in range(25):
            d.inspect(DnsQuery("10.0.0.9", f"miss{i}.example.com", rcode="NXDOMAIN", timestamp=1000.0 + i))
        offenders = d.top_offenders()
        # DGA score 0.7 outranks the storm's 0.5 cumulative score.
        assert offenders[0][0] == "10.0.0.1"
        assert offenders[1][0] == "10.0.0.9"
        assert len(offenders) == 2
