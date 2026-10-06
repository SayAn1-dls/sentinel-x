from dataclasses import dataclass
from typing import Optional
import math

@dataclass
class RiskScore:
    score: float  # 0.0 to 1.0
    label: str    # CLEAR, LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    flags: list[str]

THRESHOLDS = {
    'CRITICAL': 0.90,
    'HIGH':     0.75,
    'MEDIUM':   0.55,
    'LOW':      0.35,
    'CLEAR':    0.0,
}

def score_to_label(score: float) -> str:
    for label, threshold in THRESHOLDS.items():
        if score >= threshold:
            return label
    return 'CLEAR'

def compute_risk(
    amount: float,
    model_prob: float,
    node_degree: int,
    is_new_account: bool,
    velocity: int,
    cross_border: bool,
) -> RiskScore:
    flags = []
    adjusted = model_prob

    if amount > 100_000:
        adjusted = min(1.0, adjusted * 1.15)
        flags.append('HIGH_AMOUNT')
    if is_new_account:
        adjusted = min(1.0, adjusted * 1.10)
        flags.append('NEW_ACCOUNT')
    if velocity > 10:
        adjusted = min(1.0, adjusted * 1.12)
        flags.append('HIGH_VELOCITY')
    if cross_border:
        adjusted = min(1.0, adjusted * 1.08)
        flags.append('CROSS_BORDER')

    confidence = 1.0 - abs(adjusted - 0.5) * 2
    return RiskScore(
        score=round(adjusted, 4),
        label=score_to_label(adjusted),
        confidence=round(confidence, 4),
        flags=flags,
    )
