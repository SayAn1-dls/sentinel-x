"""
Unit Tests for the Entropy Scanner
====================================
Contract tests for byte entropy, chi-square, sliding-window coverage,
region merging, and classification.
"""

import os
import pytest
from src.utils.entropy_scanner import (
    EntropyScanner,
    EntropyWindow,
    EntropyRegion,
)


class TestByteEntropy:
    """Shannon entropy contract (0..8 bits per byte)."""

    def test_empty_is_zero(self):
        assert EntropyScanner.byte_entropy(b"") == 0.0

    def test_single_repeated_byte_is_zero(self):
        assert EntropyScanner.byte_entropy(b"\x00" * 1000) == 0.0

    def test_two_symbols_even_split_is_one_bit(self):
        data = b"\x00" * 500 + b"\xff" * 500
        assert EntropyScanner.byte_entropy(data) == pytest.approx(1.0)

    def test_uniform_alphabet_is_eight_bits(self):
        assert EntropyScanner.byte_entropy(bytes(range(256))) == pytest.approx(8.0)


class TestChiSquare:
    """Chi-square vs uniform distribution."""

    def test_empty_is_zero(self):
        assert EntropyScanner.chi_square(b"") == 0.0

    def test_exactly_uniform_is_zero(self):
        assert EntropyScanner.chi_square(bytes(range(256)) * 4) == pytest.approx(0.0)

    def test_skewed_data_is_large(self):
        assert EntropyScanner.chi_square(b"\x00" * 2560) > 1000


class TestWindows:
    """Sliding-window coverage contract."""

    def test_exact_multiple_gives_full_windows(self):
        s = EntropyScanner(window_size=1024)
        wins = list(s.windows(b"\x00" * 2048))
        assert [w.offset for w in wins] == [0, 1024]
        assert all(w.size == 1024 for w in wins)

    def test_short_buffer_yields_single_partial_window(self):
        s = EntropyScanner(window_size=4096)
        wins = list(s.windows(b"abc"))
        assert len(wins) == 1
        assert wins[0].offset == 0
        assert wins[0].size == 3

    def test_trailing_partial_window_is_scanned(self):
        """Regression: the tail beyond the last full window used to be
        dropped entirely - an appended high-entropy payload went unseen."""
        s = EntropyScanner(window_size=4096)
        wins = list(s.windows(b"A" * 4096 + b"B" * 904))
        assert len(wins) == 2
        assert wins[1].offset == 4096
        assert wins[1].size == 904

    def test_every_byte_covered_with_default_step(self):
        s = EntropyScanner(window_size=256)
        data = os.urandom(1000)
        wins = list(s.windows(data))
        assert wins[-1].offset + wins[-1].size == len(data)

    def test_overlapping_step_advances_offsets(self):
        s = EntropyScanner(window_size=100, step=50)
        wins = list(s.windows(b"\x00" * 300))
        assert [w.offset for w in wins][:3] == [0, 50, 100]

    def test_zero_and_negative_step_rejected(self):
        with pytest.raises(ValueError):
            EntropyScanner(window_size=100, step=-1)

    def test_zero_window_size_rejected(self):
        with pytest.raises(ValueError):
            EntropyScanner(window_size=0)


class TestFindRegions:
    """Region merging contract."""

    def make_scanner(self):
        return EntropyScanner(window_size=100)

    def test_empty_input_no_regions(self):
        assert self.make_scanner().find_regions([]) == []

    def test_single_high_window_becomes_region(self):
        s = self.make_scanner()
        regions = s.find_regions([EntropyWindow(0, 100, 7.5)])
        assert len(regions) == 1
        assert regions[0].start == 0
        assert regions[0].end == 100
        assert regions[0].mean_entropy == pytest.approx(7.5)

    def test_consecutive_high_windows_merge(self):
        s = self.make_scanner()
        wins = [EntropyWindow(0, 100, 7.5), EntropyWindow(100, 100, 7.7)]
        regions = s.find_regions(wins)
        assert len(regions) == 1
        assert regions[0].end == 200
        assert regions[0].length == 200

    def test_low_window_splits_regions(self):
        s = self.make_scanner()
        wins = [
            EntropyWindow(0, 100, 7.5),
            EntropyWindow(100, 100, 2.0),
            EntropyWindow(200, 100, 7.9),
        ]
        regions = s.find_regions(wins)
        assert len(regions) == 2
        assert regions[1].start == 200

    def test_trailing_run_is_flushed(self):
        s = self.make_scanner()
        regions = s.find_regions([EntropyWindow(0, 100, 7.9), EntropyWindow(100, 100, 7.8)])
        assert len(regions) == 1


class TestClassify:
    """Classification thresholds."""

    def test_encrypted_or_random(self):
        s = EntropyScanner()
        assert s.classify(overall=7.95, high_ratio=1.0, chi=100.0) == "encrypted_or_random"

    def test_compressed_or_packed(self):
        s = EntropyScanner()
        assert s.classify(overall=7.3, high_ratio=0.9, chi=500.0) == "compressed_or_packed"

    def test_mixed_payload(self):
        s = EntropyScanner()
        assert s.classify(overall=5.0, high_ratio=0.2, chi=500.0) == "mixed_with_embedded_payload"

    def test_plaintext_or_sparse(self):
        s = EntropyScanner()
        assert s.classify(overall=1.0, high_ratio=0.0, chi=900.0) == "plaintext_or_sparse"

    def test_structured_binary(self):
        s = EntropyScanner()
        assert s.classify(overall=5.5, high_ratio=0.05, chi=500.0) == "structured_binary"


class TestScanBytes:
    """End-to-end scan contract."""

    def test_plaintext_buffer(self):
        s = EntropyScanner()
        rep = s.scan_bytes(b"A" * 8192)
        assert rep.total_bytes == 8192
        assert rep.high_entropy_ratio == 0.0
        assert rep.regions == []
        assert rep.classification == "plaintext_or_sparse"

    def test_uniform_buffer_looks_random(self):
        s = EntropyScanner(window_size=1024)
        rep = s.scan_bytes(bytes(range(256)) * 32)
        assert rep.classification == "encrypted_or_random"

    def test_appended_payload_tail_is_detected(self):
        """Regression: with the tail-drop bug this buffer reported zero
        high-entropy windows and classified as plaintext."""
        s = EntropyScanner()
        rep = s.scan_bytes(b"A" * 4096 + os.urandom(904))
        assert rep.high_entropy_ratio > 0
        assert any(r.end == 5000 for r in rep.regions)
        assert rep.classification != "plaintext_or_sparse"

    def test_path_recorded_in_report(self):
        s = EntropyScanner()
        rep = s.scan_bytes(b"data", path="/tmp/x.bin")
        assert rep.path == "/tmp/x.bin"


class TestScanFile:
    """File scanning."""

    def test_scan_file_round_trip(self, tmp_path):
        f = tmp_path / "sample.bin"
        f.write_bytes(b"\x00" * 8192)
        s = EntropyScanner()
        rep = s.scan_file(str(f))
        assert rep.total_bytes == 8192
        assert rep.path == str(f)

    def test_max_bytes_cap(self, tmp_path):
        f = tmp_path / "big.bin"
        f.write_bytes(b"\x00" * 10000)
        s = EntropyScanner()
        rep = s.scan_file(str(f), max_bytes=4096)
        assert rep.total_bytes == 4096


UNIFORM = bytes(range(256)) * 16          # 4096 bytes, 8.0 bits/byte, chi-square 0
MIXED = UNIFORM + b"\x00" * (4096 * 5)    # 1 of 6 windows is high entropy


class TestScanDirectory:
    """Directory sweep: returns only suspicious files, skips tiny and unreadable ones."""

    def test_flags_encrypted_file(self, tmp_path):
        (tmp_path / "blob.enc").write_bytes(UNIFORM * 2)
        reports = EntropyScanner().scan_directory(str(tmp_path))
        assert [r.classification for r in reports] == ["encrypted_or_random"]
        assert reports[0].path == str(tmp_path / "blob.enc")

    def test_flags_mixed_with_embedded_payload(self, tmp_path):
        (tmp_path / "doc.bin").write_bytes(MIXED)
        reports = EntropyScanner().scan_directory(str(tmp_path))
        assert [r.classification for r in reports] == ["mixed_with_embedded_payload"]

    def test_ignores_plaintext_and_structured_files(self, tmp_path):
        (tmp_path / "plain.txt").write_bytes(b"A" * 8192)
        (tmp_path / "text.txt").write_bytes((b"hello world, sentinel-x. " * 400))
        assert EntropyScanner().scan_directory(str(tmp_path)) == []

    def test_walks_subdirectories(self, tmp_path):
        sub = tmp_path / "a" / "b"
        sub.mkdir(parents=True)
        (sub / "deep.enc").write_bytes(UNIFORM * 2)
        reports = EntropyScanner().scan_directory(str(tmp_path))
        assert [r.path for r in reports] == [str(sub / "deep.enc")]

    def test_min_size_boundary(self, tmp_path):
        # Smaller than min_size is skipped; exactly min_size is scanned.
        (tmp_path / "small.bin").write_bytes(UNIFORM[:1023])
        (tmp_path / "exact.bin").write_bytes(UNIFORM[:1024])
        reports = EntropyScanner().scan_directory(str(tmp_path), min_size=1024)
        assert [os.path.basename(r.path) for r in reports] == ["exact.bin"]

    def test_custom_min_size(self, tmp_path):
        (tmp_path / "tiny.bin").write_bytes(UNIFORM[:512])
        s = EntropyScanner()
        assert s.scan_directory(str(tmp_path)) == []
        assert len(s.scan_directory(str(tmp_path), min_size=256)) == 1

    def test_missing_root_returns_empty(self, tmp_path):
        assert EntropyScanner().scan_directory(str(tmp_path / "nope")) == []

    def test_empty_directory_returns_empty(self, tmp_path):
        assert EntropyScanner().scan_directory(str(tmp_path)) == []

    def test_broken_symlink_is_skipped_not_raised(self, tmp_path):
        (tmp_path / "good.enc").write_bytes(UNIFORM * 2)
        os.symlink(str(tmp_path / "missing"), str(tmp_path / "dangling"))
        reports = EntropyScanner().scan_directory(str(tmp_path))
        assert [os.path.basename(r.path) for r in reports] == ["good.enc"]

    def test_unreadable_file_is_skipped(self, tmp_path):
        if os.geteuid() == 0:
            pytest.skip("root can read anything")
        locked = tmp_path / "locked.enc"
        locked.write_bytes(UNIFORM * 2)
        (tmp_path / "ok.enc").write_bytes(UNIFORM * 2)
        os.chmod(locked, 0)
        try:
            reports = EntropyScanner().scan_directory(str(tmp_path))
        finally:
            os.chmod(locked, 0o644)
        assert [os.path.basename(r.path) for r in reports] == ["ok.enc"]

    def test_uses_scanner_thresholds(self, tmp_path):
        # A stricter high_threshold turns the MIXED file's high window into a normal one.
        (tmp_path / "doc.bin").write_bytes(MIXED)
        strict = EntropyScanner(high_threshold=8.5)
        assert strict.scan_directory(str(tmp_path)) == []
