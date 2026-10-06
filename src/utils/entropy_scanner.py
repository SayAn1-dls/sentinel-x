"""
Sentinel-X Entropy Scanner
===========================
Sliding-window Shannon entropy analysis for files and byte buffers.
High-entropy regions often indicate packed executables, encrypted
payloads or ransomware-encrypted files; this utility locates them and
classifies the overall file profile.
"""

import math
import os
from dataclasses import dataclass, field
from typing import Iterable, List, NamedTuple, Optional


class EntropyWindow(NamedTuple):
    """Entropy measured over one window of bytes."""
    offset: int
    size: int
    entropy: float


@dataclass
class EntropyRegion:
    """Contiguous run of windows above the high-entropy threshold."""
    start: int
    end: int
    mean_entropy: float

    @property
    def length(self) -> int:
        return self.end - self.start


@dataclass
class EntropyReport:
    """Summary of an entropy scan."""
    path: Optional[str]
    total_bytes: int
    overall_entropy: float
    high_entropy_ratio: float
    classification: str
    regions: List[EntropyRegion] = field(default_factory=list)


class EntropyScanner:
    """Computes byte entropy profiles and flags suspicious regions."""

    def __init__(self, window_size: int = 4096, step: Optional[int] = None,
                 high_threshold: float = 7.2, low_threshold: float = 4.0):
        if window_size <= 0:
            raise ValueError("window_size must be positive")
        self.window_size = window_size
        self.step = step or window_size
        self.high_threshold = high_threshold
        self.low_threshold = low_threshold

    @staticmethod
    def byte_entropy(data: bytes) -> float:
        """Shannon entropy in bits per byte (0..8)."""
        if not data:
            return 0.0
        counts = [0] * 256
        for b in data:
            counts[b] += 1
        n = len(data)
        return -sum((c / n) * math.log2(c / n) for c in counts if c)

    @staticmethod
    def chi_square(data: bytes) -> float:
        """Chi-square statistic vs. uniform distribution (low => random/encrypted)."""
        if not data:
            return 0.0
        counts = [0] * 256
        for b in data:
            counts[b] += 1
        expected = len(data) / 256
        return sum((c - expected) ** 2 / expected for c in counts)

    def windows(self, data: bytes) -> Iterable[EntropyWindow]:
        """Yield entropy for each sliding window over the buffer."""
        for off in range(0, max(len(data) - self.window_size + 1, 1), self.step):
            chunk = data[off:off + self.window_size]
            yield EntropyWindow(off, len(chunk), round(self.byte_entropy(chunk), 4))

    def find_regions(self, wins: List[EntropyWindow]) -> List[EntropyRegion]:
        """Merge consecutive high-entropy windows into regions."""
        regions: List[EntropyRegion] = []
        run: List[EntropyWindow] = []
        for w in wins + [EntropyWindow(-1, 0, 0.0)]:
            if w.entropy >= self.high_threshold:
                run.append(w)
                continue
            if run:
                mean = sum(x.entropy for x in run) / len(run)
                regions.append(EntropyRegion(run[0].offset, run[-1].offset + run[-1].size, round(mean, 4)))
                run = []
        return regions

    def classify(self, overall: float, high_ratio: float, chi: float) -> str:
        """Label the buffer based on its entropy profile."""
        if overall >= 7.9 and chi < 300:
            return "encrypted_or_random"
        if overall >= self.high_threshold or high_ratio > 0.6:
            return "compressed_or_packed"
        if high_ratio > 0.1:
            return "mixed_with_embedded_payload"
        if overall <= self.low_threshold:
            return "plaintext_or_sparse"
        return "structured_binary"

    def scan_bytes(self, data: bytes, path: Optional[str] = None) -> EntropyReport:
        """Scan an in-memory buffer and return a report."""
        wins = list(self.windows(data))
        high = sum(1 for w in wins if w.entropy >= self.high_threshold)
        ratio = high / len(wins) if wins else 0.0
        overall = round(self.byte_entropy(data), 4)
        label = self.classify(overall, ratio, self.chi_square(data))
        return EntropyReport(path, len(data), overall, round(ratio, 4), label, self.find_regions(wins))

    def scan_file(self, path: str, max_bytes: int = 32 * 1024 * 1024) -> EntropyReport:
        """Read up to max_bytes of a file and scan it."""
        with open(path, "rb") as fh:
            data = fh.read(max_bytes)
        return self.scan_bytes(data, path)

    def scan_directory(self, root: str, min_size: int = 1024) -> List[EntropyReport]:
        """Scan every regular file under root and return suspicious ones."""
        flagged = []
        for dirpath, _, files in os.walk(root):
            for name in files:
                full = os.path.join(dirpath, name)
                try:
                    if os.path.getsize(full) < min_size:
                        continue
                    rep = self.scan_file(full)
                except OSError:
                    continue
                if rep.classification in ("encrypted_or_random", "mixed_with_embedded_payload"):
                    flagged.append(rep)
        return flagged
