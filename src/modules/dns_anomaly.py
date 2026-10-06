"""
Sentinel-X DNS Anomaly Detector
================================
Detects suspicious DNS activity such as DGA-generated domains,
DNS tunneling (long / high-entropy labels, excessive TXT queries)
and NXDOMAIN storms from a single client.
"""

import math
import time
from collections import Counter, defaultdict, deque
from dataclasses import dataclass, field
from typing import Deque, Dict, List, Optional


@dataclass
class DnsQuery:
    """A single observed DNS query."""
    client_ip: str
    qname: str
    qtype: str = "A"
    rcode: str = "NOERROR"
    timestamp: float = field(default_factory=time.time)


@dataclass
class DnsFinding:
    """A detected DNS anomaly."""
    client_ip: str
    qname: str
    reason: str
    score: float
    timestamp: float = field(default_factory=time.time)


@dataclass
class DnsAnomalyConfig:
    """Thresholds for DNS anomaly detection."""
    entropy_threshold: float = 3.6
    max_label_length: int = 40
    max_qname_length: int = 120
    consonant_ratio_threshold: float = 0.72
    nxdomain_window_seconds: float = 60.0
    nxdomain_threshold: int = 25
    txt_ratio_threshold: float = 0.4
    min_queries_for_ratio: int = 20


VOWELS = set("aeiou")


class DnsAnomalyDetector:
    """Stateful detector for DGA, tunneling and NXDOMAIN storms."""

    def __init__(self, config: Optional[DnsAnomalyConfig] = None):
        self.config = config or DnsAnomalyConfig()
        self._nx_history: Dict[str, Deque[float]] = defaultdict(deque)
        self._qtype_counts: Dict[str, Counter] = defaultdict(Counter)
        self.findings: List[DnsFinding] = []

    @staticmethod
    def shannon_entropy(text: str) -> float:
        """Compute Shannon entropy (bits per character) of a string."""
        if not text:
            return 0.0
        counts = Counter(text)
        length = len(text)
        return -sum((c / length) * math.log2(c / length) for c in counts.values())

    @staticmethod
    def registered_label(qname: str) -> str:
        """Return the second-level label (e.g. 'example' for a.b.example.com)."""
        parts = [p for p in qname.lower().strip(".").split(".") if p]
        if len(parts) >= 2:
            return parts[-2]
        return parts[0] if parts else ""

    def consonant_ratio(self, label: str) -> float:
        """Ratio of consonant letters to all letters in a label."""
        letters = [ch for ch in label if ch.isalpha()]
        if not letters:
            return 0.0
        consonants = sum(1 for ch in letters if ch not in VOWELS)
        return consonants / len(letters)

    def dga_score(self, qname: str) -> float:
        """Heuristic 0..1 score that a domain was algorithmically generated."""
        label = self.registered_label(qname)
        if len(label) < 6:
            return 0.0
        entropy = self.shannon_entropy(label)
        digits = sum(ch.isdigit() for ch in label) / len(label)
        score = 0.0
        if entropy >= self.config.entropy_threshold:
            score += 0.4
        if self.consonant_ratio(label) >= self.config.consonant_ratio_threshold:
            score += 0.3
        if digits > 0.25:
            score += 0.2
        if len(label) > 15:
            score += 0.1
        return min(score, 1.0)

    def tunneling_score(self, qname: str) -> float:
        """Heuristic 0..1 score for data being smuggled in DNS labels."""
        labels = [p for p in qname.strip(".").split(".") if p]
        if not labels:
            return 0.0
        longest = max(len(l) for l in labels)
        score = 0.0
        if longest > self.config.max_label_length:
            score += 0.5
        if len(qname) > self.config.max_qname_length:
            score += 0.3
        sub = "".join(labels[:-2])
        if sub and self.shannon_entropy(sub) > 4.0:
            score += 0.2
        return min(score, 1.0)

    def _check_nxdomain_storm(self, q: DnsQuery) -> Optional[DnsFinding]:
        if q.rcode != "NXDOMAIN":
            return None
        window = self._nx_history[q.client_ip]
        window.append(q.timestamp)
        cutoff = q.timestamp - self.config.nxdomain_window_seconds
        while window and window[0] < cutoff:
            window.popleft()
        if len(window) >= self.config.nxdomain_threshold:
            return DnsFinding(q.client_ip, q.qname, "nxdomain_storm",
                              min(1.0, len(window) / (2 * self.config.nxdomain_threshold)),
                              q.timestamp)
        return None

    def _check_txt_ratio(self, q: DnsQuery) -> Optional[DnsFinding]:
        counts = self._qtype_counts[q.client_ip]
        counts[q.qtype.upper()] += 1
        total = sum(counts.values())
        if total < self.config.min_queries_for_ratio:
            return None
        ratio = counts["TXT"] / total
        if ratio >= self.config.txt_ratio_threshold:
            return DnsFinding(q.client_ip, q.qname, "excessive_txt", round(ratio, 3), q.timestamp)
        return None

    def inspect(self, q: DnsQuery) -> List[DnsFinding]:
        """Inspect a query and return any anomalies it triggers."""
        found: List[DnsFinding] = []
        dga = self.dga_score(q.qname)
        if dga >= 0.7:
            found.append(DnsFinding(q.client_ip, q.qname, "dga_domain", dga, q.timestamp))
        tun = self.tunneling_score(q.qname)
        if tun >= 0.5:
            found.append(DnsFinding(q.client_ip, q.qname, "dns_tunneling", tun, q.timestamp))
        for check in (self._check_nxdomain_storm, self._check_txt_ratio):
            result = check(q)
            if result:
                found.append(result)
        self.findings.extend(found)
        return found

    def top_offenders(self, limit: int = 5) -> List[tuple]:
        """Return clients ranked by cumulative anomaly score."""
        totals: Dict[str, float] = defaultdict(float)
        for f in self.findings:
            totals[f.client_ip] += f.score
        return sorted(totals.items(), key=lambda kv: kv[1], reverse=True)[:limit]
