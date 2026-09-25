"""
geo_utils.py — Sentinel-X Geolocation Utilities
Helpers for IP-to-location mapping, distance calculations,
and geographic anomaly detection.
"""

from __future__ import annotations
import math
from dataclasses import dataclass
from typing import Optional, Tuple

# Known high-risk country codes (ISO 3166-1 alpha-2)
HIGH_RISK_COUNTRIES = frozenset({
    "KP", "IR", "SY", "CU", "SD", "MM", "BY", "RU", "VE",
})

# Known Tor exit node ASN prefixes (illustrative — extend with live feed)
TOR_ASN_PREFIXES = frozenset({"AS60729", "AS44925", "AS208323"})

EARTH_RADIUS_KM = 6371.0


@dataclass
class GeoLocation:
    ip: str
    country_code: str
    country_name: str
    city: str
    latitude: float
    longitude: float
    asn: str = ""
    isp: str = ""
    is_vpn: bool = False
    is_proxy: bool = False
    is_tor: bool = False


# ── Distance ────────────────────────────────────────────────────────────────

def haversine_km(lat1: float, lon1: float,
                 lat2: float, lon2: float) -> float:
    """
    Great-circle distance between two coordinates (Haversine formula).

    >>> round(haversine_km(28.6139, 77.2090, 19.0760, 72.8777), 1)
    1153.3
    """
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def impossible_travel(loc_a: GeoLocation, loc_b: GeoLocation,
                      elapsed_seconds: float,
                      max_speed_kmh: float = 900.0) -> bool:
    """
    Return True if moving from loc_a to loc_b in elapsed_seconds would
    require exceeding max_speed_kmh (default 900 km/h ≈ commercial jet).

    >>> from dataclasses import replace
    >>> a = GeoLocation("1.1.1.1","IN","India","Delhi",28.6,77.2)
    >>> b = GeoLocation("2.2.2.2","US","USA","NYC",40.7,-74.0)
    >>> impossible_travel(a, b, elapsed_seconds=60)  # 1 minute
    True
    """
    if elapsed_seconds <= 0:
        return False
    dist_km = haversine_km(loc_a.latitude, loc_a.longitude,
                           loc_b.latitude, loc_b.longitude)
    required_kmh = (dist_km / elapsed_seconds) * 3600
    return required_kmh > max_speed_kmh


# ── Risk scoring ────────────────────────────────────────────────────────────

def geo_risk_score(loc: GeoLocation,
                   baseline_country: Optional[str] = None) -> float:
    """
    Return a 0.0–1.0 risk score for a geolocation.

    Factors:
      +0.40  High-risk country
      +0.30  VPN detected
      +0.25  Proxy detected
      +0.45  Tor exit node
      +0.20  Country mismatch vs baseline
      +0.15  Known malicious ASN prefix
    """
    score = 0.0
    if loc.country_code in HIGH_RISK_COUNTRIES:
        score += 0.40
    if loc.is_vpn:
        score += 0.30
    if loc.is_proxy:
        score += 0.25
    if loc.is_tor or loc.asn in TOR_ASN_PREFIXES:
        score += 0.45
    if baseline_country and loc.country_code != baseline_country:
        score += 0.20
    if any(loc.asn.startswith(p) for p in TOR_ASN_PREFIXES):
        score += 0.15
    return round(min(score, 1.0), 4)


def classify_geo_risk(score: float) -> str:
    """Map a geo risk score to a severity label."""
    if score >= 0.75:
        return "CRITICAL"
    if score >= 0.50:
        return "HIGH"
    if score >= 0.25:
        return "MEDIUM"
    if score > 0.0:
        return "LOW"
    return "NOMINAL"


# ── Cluster detection ───────────────────────────────────────────────────────

def cluster_by_country(locations: list[GeoLocation]) -> dict[str, list[GeoLocation]]:
    """Group a list of GeoLocations by country code."""
    groups: dict[str, list[GeoLocation]] = {}
    for loc in locations:
        groups.setdefault(loc.country_code, []).append(loc)
    return groups


def dominant_country(locations: list[GeoLocation]) -> Optional[str]:
    """Return the most frequent country code in a list of locations."""
    if not locations:
        return None
    groups = cluster_by_country(locations)
    return max(groups, key=lambda c: len(groups[c]))


def outlier_locations(locations: list[GeoLocation],
                      radius_km: float = 500.0) -> list[GeoLocation]:
    """
    Return locations that are more than `radius_km` away from the
    centroid of the full set — useful for spotting geographic outliers.
    """
    if not locations:
        return []
    avg_lat = sum(l.latitude for l in locations) / len(locations)
    avg_lon = sum(l.longitude for l in locations) / len(locations)
    return [
        loc for loc in locations
        if haversine_km(loc.latitude, loc.longitude, avg_lat, avg_lon) > radius_km
    ]
