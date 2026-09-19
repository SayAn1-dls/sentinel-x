from typing import Optional

class NodeRiskAggregator:
    def __init__(self):
        self._scores: dict[str, list[float]] = {}

    def record(self, node_id: str, score: float):
        self._scores.setdefault(node_id, []).append(score)
        if len(self._scores[node_id]) > 100:
            self._scores[node_id] = self._scores[node_id][-100:]

    def average(self, node_id: str) -> Optional[float]:
        scores = self._scores.get(node_id)
        if not scores:
            return None
        return round(sum(scores) / len(scores), 4)

    def peak(self, node_id: str) -> Optional[float]:
        scores = self._scores.get(node_id)
        return max(scores) if scores else None

    def top_k(self, k: int = 10) -> list[tuple[str, float]]:
        avgs = [(n, self.average(n)) for n in self._scores if self.average(n) is not None]
        return sorted(avgs, key=lambda x: x[1], reverse=True)[:k]
