"""
Unit Tests for Geolocation Utilities
======================================
Contract tests for distance, impossible-travel detection,
geo risk scoring, and location clustering.
"""

import pytest
from src.utils.geo_utils import (
    GeoLocation,
    haversine_km,
    impossible_travel,
    geo_risk_score,
    classify_geo_risk,
    cluster_by_country,
    dominant_country,
    outlier_locations,
    HIGH_RISK_COUNTRIES,
    TOR_ASN_PREFIXES,
)


DELHI = GeoLocation("1.1.1.1", "IN", "India", "Delhi", 28.6139, 77.2090)
MUMBAI = GeoLocation("1.1.1.2", "IN", "India", "Mumbai", 19.0760, 72.8777)
NYC = GeoLocation("2.2.2.2", "US", "USA", "New York", 40.7128, -74.0060)
LONDON = GeoLocation("3.3.3.3", "GB", "UK", "London", 51.5074, -0.1278)


class TestHaversine:
    """Great-circle distance contract."""

    def test_known_distance_delhi_mumbai(self):
        # Documented doctest value: ~1153 km
        assert haversine_km(28.6139, 77.2090, 19.0760, 72.8777) == pytest.approx(1148.1, abs=0.5)

    def test_zero_distance_same_point(self):
        assert haversine_km(28.6, 77.2, 28.6, 77.2) == pytest.approx(0.0, abs=1e-9)

    def test_symmetry(self):
        d1 = haversine_km(DELHI.latitude, DELHI.longitude, NYC.latitude, NYC.longitude)
        d2 = haversine_km(NYC.latitude, NYC.longitude, DELHI.latitude, DELHI.longitude)
        assert d1 == pytest.approx(d2)

    def test_antipodal_points(self):
        # Half the Earth's circumference ~ 20015 km
        d = haversine_km(0.0, 0.0, 0.0, 180.0)
        assert d == pytest.approx(20015.0, rel=0.01)


class TestImpossibleTravel:
    """Impossible-travel detection contract."""

    def test_one_minute_delhi_to_nyc_is_impossible(self):
        assert impossible_travel(DELHI, NYC, elapsed_seconds=60) is True

    def test_thirty_hours_delhi_to_nyc_is_possible(self):
        assert impossible_travel(DELHI, NYC, elapsed_seconds=30 * 3600) is False

    def test_same_location_is_never_impossible(self):
        assert impossible_travel(DELHI, DELHI, elapsed_seconds=0) is False
        assert impossible_travel(DELHI, DELHI, elapsed_seconds=1) is False

    def test_zero_elapsed_with_positive_distance_is_impossible(self):
        """Simultaneous presence in two distant places is the clearest
        impossible-travel signal: required speed is infinite."""
        assert impossible_travel(DELHI, NYC, elapsed_seconds=0) is True

    def test_negative_elapsed_with_positive_distance_is_impossible(self):
        """Clock-skewed or corrupted timestamps must not mask the signal."""
        assert impossible_travel(DELHI, NYC, elapsed_seconds=-30) is True

    def test_short_hop_within_window_is_possible(self):
        # Delhi -> Mumbai (~1150 km) in 3 hours = ~384 km/h, under the 900 km/h cap
        assert impossible_travel(DELHI, MUMBAI, elapsed_seconds=3 * 3600) is False

    def test_custom_speed_cap_respected(self):
        # 1150 km in 3 hours is impossible under a 300 km/h cap
        assert impossible_travel(DELHI, MUMBAI, elapsed_seconds=3 * 3600, max_speed_kmh=300.0) is True


class TestGeoRiskScore:
    """Geo risk scoring contract."""

    def test_benign_location_scores_zero(self):
        assert geo_risk_score(DELHI) == 0.0

    def test_high_risk_country(self):
        loc = GeoLocation("9.9.9.9", "KP", "North Korea", "Pyongyang", 39.0, 125.7)
        assert "KP" in HIGH_RISK_COUNTRIES
        assert geo_risk_score(loc) == pytest.approx(0.40)

    def test_country_mismatch_vs_baseline(self):
        assert geo_risk_score(NYC, baseline_country="IN") == pytest.approx(0.20)
        assert geo_risk_score(DELHI, baseline_country="IN") == 0.0

    def test_score_capped_at_one(self):
        loc = GeoLocation(
            "9.9.9.9", "KP", "North Korea", "Pyongyang", 39.0, 125.7,
            asn=next(iter(TOR_ASN_PREFIXES)), is_vpn=True, is_proxy=True, is_tor=True,
        )
        assert geo_risk_score(loc, baseline_country="IN") == 1.0


class TestClassifyGeoRisk:
    """Severity label thresholds."""

    @pytest.mark.parametrize("score,label", [
        (0.0, "NOMINAL"),
        (0.1, "LOW"),
        (0.25, "MEDIUM"),
        (0.5, "HIGH"),
        (0.75, "CRITICAL"),
        (1.0, "CRITICAL"),
    ])
    def test_thresholds(self, score, label):
        assert classify_geo_risk(score) == label


class TestClustering:
    """Clustering and outlier helpers."""

    def test_cluster_by_country_groups(self):
        groups = cluster_by_country([DELHI, MUMBAI, NYC])
        assert set(groups) == {"IN", "US"}
        assert len(groups["IN"]) == 2

    def test_dominant_country(self):
        assert dominant_country([DELHI, MUMBAI, NYC]) == "IN"

    def test_dominant_country_empty(self):
        assert dominant_country([]) is None

    def test_outlier_locations_flags_distant_point(self):
        # Two India-area points and one NYC point; NYC is far from the centroid
        agra = GeoLocation("1.1.1.3", "IN", "India", "Agra", 27.1767, 78.0081)
        outliers = outlier_locations([DELHI, agra, NYC], radius_km=6000.0)
        assert NYC in outliers
        assert DELHI not in outliers
        assert agra not in outliers

    def test_outlier_locations_empty(self):
        assert outlier_locations([]) == []
