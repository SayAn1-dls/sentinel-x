import pytest

def score_to_label(score):
    if score >= 0.90: return 'CRITICAL'
    if score >= 0.75: return 'HIGH'
    if score >= 0.55: return 'MEDIUM'
    if score >= 0.35: return 'LOW'
    return 'CLEAR'

def test_critical(): assert score_to_label(0.95) == 'CRITICAL'
def test_high(): assert score_to_label(0.80) == 'HIGH'
def test_clear(): assert score_to_label(0.10) == 'CLEAR'
def test_medium(): assert score_to_label(0.60) == 'MEDIUM'
