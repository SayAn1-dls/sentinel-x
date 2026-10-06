from typing import Optional
from datetime import datetime, timedelta

class EdgeValidator:
    def __init__(self, max_amount: float = 1_000_000, velocity_window_sec: int = 3600):
        self.max_amount = max_amount
        self.velocity_window = timedelta(seconds=velocity_window_sec)
        self._tx_log: dict[str, list[datetime]] = {}

    def validate(self, src: str, dst: str, amount: float, ts: datetime) -> dict:
        errors = []
        warnings = []

        if amount <= 0:
            errors.append('INVALID_AMOUNT_ZERO_OR_NEGATIVE')
        if amount > self.max_amount:
            errors.append('AMOUNT_EXCEEDS_LIMIT')
        if src == dst:
            errors.append('SELF_LOOP_DETECTED')

        key = f'{src}:{dst}'
        history = self._tx_log.get(key, [])
        cutoff = ts - self.velocity_window
        recent = [t for t in history if t > cutoff]
        if len(recent) > 5:
            warnings.append('HIGH_VELOCITY_EDGE')

        self._tx_log[key] = recent + [ts]

        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
        }
