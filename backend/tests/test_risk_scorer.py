"""Tests for the production risk scorer in backend/utils/risk_scorer.py.

Previously this file re-implemented score_to_label inline and asserted against
that copy, so changes to the real thresholds would never fail these tests.
"""

import pytest

from backend.utils.risk_scorer import THRESHOLDS, compute_risk, score_to_label


class TestScoreToLabel:
    @pytest.mark.parametrize(
        "score,expected",
        [
            (1.0, "CRITICAL"),
            (0.95, "CRITICAL"),
            (0.90, "CRITICAL"),
            (0.8999, "HIGH"),
            (0.80, "HIGH"),
            (0.75, "HIGH"),
            (0.7499, "MEDIUM"),
            (0.60, "MEDIUM"),
            (0.55, "MEDIUM"),
            (0.5499, "LOW"),
            (0.40, "LOW"),
            (0.35, "LOW"),
            (0.3499, "CLEAR"),
            (0.10, "CLEAR"),
            (0.0, "CLEAR"),
        ],
    )
    def test_boundaries(self, score, expected):
        assert score_to_label(score) == expected

    def test_threshold_table_is_ordered(self):
        thresholds = list(THRESHOLDS.values())
        assert thresholds == sorted(thresholds, reverse=True)


class TestComputeRisk:
    def test_base_case_has_no_flags(self):
        r = compute_risk(
            amount=100, model_prob=0.5, node_degree=1,
            is_new_account=False, velocity=1, cross_border=False,
        )
        assert r.score == 0.5
        assert r.label == "LOW"
        assert r.flags == []

    def test_high_amount_boosts_score_and_flags(self):
        r = compute_risk(
            amount=500_000, model_prob=0.5, node_degree=1,
            is_new_account=False, velocity=1, cross_border=False,
        )
        assert r.score == round(0.5 * 1.15, 4)
        assert r.flags == ["HIGH_AMOUNT"]

    def test_score_capped_at_one(self):
        r = compute_risk(
            amount=500_000, model_prob=0.99, node_degree=1,
            is_new_account=True, velocity=20, cross_border=True,
        )
        assert r.score == 1.0
        assert r.label == "CRITICAL"

    def test_all_adjustments_flagged(self):
        r = compute_risk(
            amount=500_000, model_prob=0.5, node_degree=1,
            is_new_account=True, velocity=20, cross_border=True,
        )
        assert set(r.flags) == {"HIGH_AMOUNT", "NEW_ACCOUNT", "HIGH_VELOCITY", "CROSS_BORDER"}

    def test_confidence_highest_at_midpoint(self):
        r = compute_risk(
            amount=100, model_prob=0.5, node_degree=1,
            is_new_account=False, velocity=1, cross_border=False,
        )
        assert r.confidence == 1.0
