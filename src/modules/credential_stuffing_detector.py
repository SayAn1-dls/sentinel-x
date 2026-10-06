"""
Sentinel-X Credential Stuffing Detector
========================================
Detects credential stuffing and password spraying against login
endpoints by correlating failed authentications across source IPs,
usernames and user agents within sliding time windows.
"""

import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Deque, Dict, List, Optional, Set


@dataclass
class LoginAttempt:
    """A single authentication attempt."""
    source_ip: str
    username: str
    success: bool
    user_agent: str = ""
    timestamp: float = field(default_factory=time.time)


@dataclass
class StuffingAlert:
    """Alert describing a suspected attack pattern."""
    pattern: str
    source_ip: str
    distinct_users: int
    failures: int
    confidence: float
    sample_users: List[str] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)


@dataclass
class StuffingConfig:
    """Detection thresholds."""
    window_seconds: float = 300.0
    stuffing_min_users: int = 15
    stuffing_min_failure_ratio: float = 0.8
    spray_min_users: int = 30
    spray_max_attempts_per_user: int = 2
    distributed_min_ips: int = 20
    alert_cooldown_seconds: float = 600.0


class CredentialStuffingDetector:
    """Sliding-window correlation of login attempts."""

    def __init__(self, config: Optional[StuffingConfig] = None):
        self.config = config or StuffingConfig()
        self._by_ip: Dict[str, Deque[LoginAttempt]] = defaultdict(deque)
        self._global: Deque[LoginAttempt] = deque()
        self._last_alert: Dict[str, float] = {}
        self.alerts: List[StuffingAlert] = []

    def _evict(self, buf: Deque[LoginAttempt], now: float) -> None:
        cutoff = now - self.config.window_seconds
        while buf and buf[0].timestamp < cutoff:
            buf.popleft()

    def _cooldown_ok(self, key: str, now: float) -> bool:
        last = self._last_alert.get(key)
        if last is not None and now - last < self.config.alert_cooldown_seconds:
            return False
        self._last_alert[key] = now
        return True

    def check_stuffing(self, ip: str, now: float) -> Optional[StuffingAlert]:
        """Many distinct usernames with mostly failures from a single IP."""
        attempts = self._by_ip[ip]
        users = {a.username for a in attempts}
        if len(users) < self.config.stuffing_min_users:
            return None
        failures = sum(1 for a in attempts if not a.success)
        ratio = failures / len(attempts)
        if ratio < self.config.stuffing_min_failure_ratio:
            return None
        if not self._cooldown_ok(f"stuff:{ip}", now):
            return None
        conf = min(1.0, 0.5 * ratio + 0.5 * min(1.0, len(users) / (3 * self.config.stuffing_min_users)))
        return StuffingAlert("credential_stuffing", ip, len(users), failures, round(conf, 3), sorted(users)[:5], now)

    def check_spray(self, ip: str, now: float) -> Optional[StuffingAlert]:
        """Few attempts per user across a very wide set of users (password spraying)."""
        per_user: Dict[str, int] = defaultdict(int)
        for a in self._by_ip[ip]:
            if not a.success:
                per_user[a.username] += 1
        if len(per_user) < self.config.spray_min_users:
            return None
        if max(per_user.values()) > self.config.spray_max_attempts_per_user:
            return None
        if not self._cooldown_ok(f"spray:{ip}", now):
            return None
        conf = min(1.0, len(per_user) / (2 * self.config.spray_min_users))
        return StuffingAlert("password_spray", ip, len(per_user), sum(per_user.values()),
                             round(conf, 3), sorted(per_user)[:5], now)

    def check_distributed(self, now: float) -> Optional[StuffingAlert]:
        """Botnet-style attack: same user agent failing from many IPs."""
        ips_by_agent: Dict[str, Set[str]] = defaultdict(set)
        users_by_agent: Dict[str, Set[str]] = defaultdict(set)
        for a in self._global:
            if not a.success and a.user_agent:
                ips_by_agent[a.user_agent].add(a.source_ip)
                users_by_agent[a.user_agent].add(a.username)
        for agent, ips in ips_by_agent.items():
            if len(ips) >= self.config.distributed_min_ips and self._cooldown_ok(f"dist:{agent}", now):
                conf = min(1.0, len(ips) / (2 * self.config.distributed_min_ips))
                return StuffingAlert("distributed_stuffing", f"{len(ips)} ips", len(users_by_agent[agent]),
                                     len(ips), round(conf, 3), sorted(users_by_agent[agent])[:5], now)
        return None

    def observe(self, attempt: LoginAttempt) -> List[StuffingAlert]:
        """Record an attempt and return any new alerts."""
        now = attempt.timestamp
        self._by_ip[attempt.source_ip].append(attempt)
        self._global.append(attempt)
        self._evict(self._by_ip[attempt.source_ip], now)
        self._evict(self._global, now)
        new = [a for a in (self.check_stuffing(attempt.source_ip, now),
                           self.check_spray(attempt.source_ip, now),
                           self.check_distributed(now)) if a]
        self.alerts.extend(new)
        return new

    def blocklist_candidates(self, min_confidence: float = 0.7) -> List[str]:
        """Source IPs whose alerts exceed the given confidence."""
        return sorted({a.source_ip for a in self.alerts
                       if a.confidence >= min_confidence and "ips" not in a.source_ip})
