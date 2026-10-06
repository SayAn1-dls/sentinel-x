"""
threat_graph.py — Graph-based threat correlation engine for Sentinel-X.

Models entities (IPs, users, devices, domains) as nodes and attack
relationships as directed edges. Enables lateral movement tracing,
pivot node detection, attack chain reconstruction, and blast-radius
estimation — all in pure Python with zero external dependencies.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, Generator, Iterator, List, Optional, Set, Tuple


# ── Enums ────────────────────────────────────────────────────────────────────

class NodeKind(str, Enum):
    IP        = "ip"
    USER      = "user"
    DEVICE    = "device"
    DOMAIN    = "domain"
    PROCESS   = "process"
    FILE      = "file"

class EdgeKind(str, Enum):
    LOGIN           = "login"
    LATERAL_MOVE    = "lateral_move"
    DATA_ACCESS     = "data_access"
    DNS_QUERY       = "dns_query"
    C2_BEACON       = "c2_beacon"
    EXPLOIT         = "exploit"
    EXFIL           = "exfil"
    PRIVILEGE_ESC   = "privilege_esc"
    FILE_DROP       = "file_drop"

# Edge weights — higher = more suspicious
EDGE_WEIGHT: Dict[EdgeKind, float] = {
    EdgeKind.LOGIN:         0.2,
    EdgeKind.LATERAL_MOVE:  0.7,
    EdgeKind.DATA_ACCESS:   0.3,
    EdgeKind.DNS_QUERY:     0.1,
    EdgeKind.C2_BEACON:     0.9,
    EdgeKind.EXPLOIT:       1.0,
    EdgeKind.EXFIL:         0.95,
    EdgeKind.PRIVILEGE_ESC: 0.85,
    EdgeKind.FILE_DROP:     0.75,
}


# ── Core models ───────────────────────────────────────────────────────────────

@dataclass
class Node:
    node_id: str
    kind: NodeKind
    label: str
    risk_score: float = 0.0
    metadata: Dict = field(default_factory=dict)
    first_seen: float = field(default_factory=time.time)
    last_seen:  float = field(default_factory=time.time)

    def touch(self) -> None:
        self.last_seen = time.time()

    def __hash__(self) -> int:
        return hash(self.node_id)

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Node) and self.node_id == other.node_id


@dataclass
class Edge:
    src: str
    dst: str
    kind: EdgeKind
    weight: float
    timestamp: float = field(default_factory=time.time)
    metadata: Dict = field(default_factory=dict)

    @property
    def uid(self) -> str:
        return f"{self.src}→{self.dst}:{self.kind}"


@dataclass
class AttackChain:
    nodes: List[str]          # ordered node_ids
    edges: List[Edge]
    total_weight: float
    max_weight:   float

    @property
    def length(self) -> int:
        return len(self.nodes)

    @property
    def severity(self) -> str:
        if self.total_weight >= 4.0:  return "CRITICAL"
        if self.total_weight >= 2.5:  return "HIGH"
        if self.total_weight >= 1.5:  return "MEDIUM"
        return "LOW"

    @property
    def path_str(self) -> str:
        return " → ".join(self.nodes)


@dataclass
class PivotNode:
    node_id: str
    in_degree:  int
    out_degree: int
    betweenness: float        # how many paths pass through this node
    risk_score: float

    @property
    def pivot_score(self) -> float:
        return round(
            0.4 * self.betweenness +
            0.3 * min(self.in_degree  / 10, 1.0) +
            0.3 * min(self.out_degree / 10, 1.0),
            4
        )


# ── Main engine ───────────────────────────────────────────────────────────────

class ThreatGraph:
    """
    Directed weighted graph for multi-entity attack correlation.

    Quick start
    -----------
    g = ThreatGraph()
    g.add_node("ip:1.2.3.4",  NodeKind.IP,   label="attacker")
    g.add_node("user:alice",  NodeKind.USER,  label="alice")
    g.add_edge("ip:1.2.3.4", "user:alice", EdgeKind.LOGIN)
    chains = g.attack_chains("ip:1.2.3.4")
    pivots = g.pivot_nodes()
    """

    def __init__(self) -> None:
        self._nodes:  Dict[str, Node] = {}
        self._edges:  Dict[str, List[Edge]] = defaultdict(list)  # src → [edges]
        self._redges: Dict[str, List[Edge]] = defaultdict(list)  # dst → [edges] (reverse)
        self._all_edges: List[Edge] = []

    # ── Mutation ─────────────────────────────────────────────────────────────

    def add_node(
        self,
        node_id: str,
        kind: NodeKind,
        label: str = "",
        risk_score: float = 0.0,
        **metadata,
    ) -> Node:
        if node_id not in self._nodes:
            self._nodes[node_id] = Node(
                node_id=node_id, kind=kind,
                label=label or node_id,
                risk_score=risk_score,
                metadata=metadata,
            )
        else:
            self._nodes[node_id].touch()
        return self._nodes[node_id]

    def add_edge(
        self,
        src: str,
        dst: str,
        kind: EdgeKind,
        timestamp: Optional[float] = None,
        **metadata,
    ) -> Edge:
        weight = EDGE_WEIGHT[kind]
        edge = Edge(
            src=src, dst=dst, kind=kind, weight=weight,
            timestamp=timestamp or time.time(),
            metadata=metadata,
        )
        self._edges[src].append(edge)
        self._redges[dst].append(edge)
        self._all_edges.append(edge)
        # propagate risk upward on high-weight edges
        if dst in self._nodes and weight >= 0.7:
            self._nodes[dst].risk_score = min(
                1.0, self._nodes[dst].risk_score + weight * 0.2
            )
        return edge

    def ingest_event(
        self,
        src_id: str, src_kind: NodeKind,
        dst_id: str, dst_kind: NodeKind,
        edge_kind: EdgeKind,
        timestamp: Optional[float] = None,
        **metadata,
    ) -> Tuple[Node, Node, Edge]:
        """One-shot: add both nodes + edge in a single call."""
        src = self.add_node(src_id, src_kind)
        dst = self.add_node(dst_id, dst_kind)
        edge = self.add_edge(src_id, dst_id, edge_kind, timestamp, **metadata)
        return src, dst, edge

    # ── Traversal ────────────────────────────────────────────────────────────

    def neighbors(self, node_id: str) -> List[str]:
        return [e.dst for e in self._edges.get(node_id, [])]

    def predecessors(self, node_id: str) -> List[str]:
        return [e.src for e in self._redges.get(node_id, [])]

    def bfs(self, start: str, max_depth: int = 6) -> Generator[Tuple[str, int], None, None]:
        """Breadth-first traversal. Yields (node_id, depth)."""
        visited: Set[str] = set()
        queue: deque = deque([(start, 0)])
        while queue:
            node_id, depth = queue.popleft()
            if node_id in visited or depth > max_depth:
                continue
            visited.add(node_id)
            yield node_id, depth
            for nbr in self.neighbors(node_id):
                if nbr not in visited:
                    queue.append((nbr, depth + 1))

    def dfs(self, start: str, max_depth: int = 6) -> Generator[str, None, None]:
        """Depth-first traversal."""
        visited: Set[str] = set()
        stack = [(start, 0)]
        while stack:
            node_id, depth = stack.pop()
            if node_id in visited or depth > max_depth:
                continue
            visited.add(node_id)
            yield node_id
            for nbr in reversed(self.neighbors(node_id)):
                stack.append((nbr, depth + 1))

    # ── Attack chain reconstruction ──────────────────────────────────────────

    def attack_chains(
        self,
        origin: str,
        max_depth: int = 8,
        min_weight: float = 0.5,
    ) -> List[AttackChain]:
        """
        Find all attack chains starting from `origin`.
        Returns chains sorted by total weight descending.
        """
        chains: List[AttackChain] = []
        self._dfs_chains(origin, [], [], set(), chains, max_depth, min_weight)
        return sorted(chains, key=lambda c: c.total_weight, reverse=True)

    def _dfs_chains(
        self,
        current: str,
        path: List[str],
        edges: List[Edge],
        visited: Set[str],
        out: List[AttackChain],
        max_depth: int,
        min_weight: float,
    ) -> None:
        path = path + [current]
        visited = visited | {current}

        outgoing = [e for e in self._edges.get(current, [])
                    if e.dst not in visited and e.weight >= min_weight]

        if len(path) > 1:
            total = sum(e.weight for e in edges)
            out.append(AttackChain(
                nodes=list(path),
                edges=list(edges),
                total_weight=round(total, 4),
                max_weight=max(e.weight for e in edges) if edges else 0.0,
            ))

        if len(path) >= max_depth or not outgoing:
            return

        for edge in outgoing:
            self._dfs_chains(
                edge.dst, path, edges + [edge],
                visited, out, max_depth, min_weight,
            )

    # ── Blast radius ─────────────────────────────────────────────────────────

    def blast_radius(self, node_id: str, max_depth: int = 4) -> Set[str]:
        """All nodes reachable from node_id within max_depth hops."""
        return {n for n, _ in self.bfs(node_id, max_depth=max_depth)} - {node_id}

    def impact_score(self, node_id: str) -> float:
        """Weighted sum of risk scores in blast radius."""
        radius = self.blast_radius(node_id)
        if not radius:
            return 0.0
        return round(
            sum(self._nodes[n].risk_score for n in radius if n in self._nodes), 4
        )

    # ── Pivot detection ───────────────────────────────────────────────────────

    def pivot_nodes(self, top_n: int = 10) -> List[PivotNode]:
        """
        Identify nodes that sit on many attack paths (high betweenness).
        Uses approximate betweenness via repeated BFS from each source.
        """
        pass_through: Dict[str, int] = defaultdict(int)
        node_ids = list(self._nodes.keys())

        for src in node_ids:
            visited: Set[str] = set()
            queue: deque = deque([(src, [])])
            while queue:
                curr, path = queue.popleft()
                if curr in visited:
                    continue
                visited.add(curr)
                for mid in path[1:]:       # intermediate nodes only
                    pass_through[mid] += 1
                for nbr in self.neighbors(curr):
                    if nbr not in visited:
                        queue.append((nbr, path + [curr]))

        max_bt = max(pass_through.values(), default=1)
        pivots = []
        for nid, bt in sorted(pass_through.items(), key=lambda x: x[1], reverse=True)[:top_n]:
            node = self._nodes.get(nid)
            pivots.append(PivotNode(
                node_id=nid,
                in_degree=len(self._redges.get(nid, [])),
                out_degree=len(self._edges.get(nid, [])),
                betweenness=bt / max_bt,
                risk_score=node.risk_score if node else 0.0,
            ))
        return sorted(pivots, key=lambda p: p.pivot_score, reverse=True)

    # ── Subgraph isolation ────────────────────────────────────────────────────

    def subgraph(self, root: str, depth: int = 3) -> "ThreatGraph":
        """Extract a sub-graph rooted at `root` up to `depth` hops."""
        sub = ThreatGraph()
        reachable = {n for n, _ in self.bfs(root, max_depth=depth)}
        for nid in reachable:
            node = self._nodes[nid]
            sub.add_node(nid, node.kind, node.label, node.risk_score)
        for edge in self._all_edges:
            if edge.src in reachable and edge.dst in reachable:
                sub.add_edge(edge.src, edge.dst, edge.kind, edge.timestamp)
        return sub

    # ── Suspicious cluster detection ─────────────────────────────────────────

    def suspicious_clusters(self, min_risk: float = 0.5) -> List[Set[str]]:
        """Find connected components where avg node risk ≥ min_risk."""
        visited: Set[str] = set()
        clusters: List[Set[str]] = []

        for start in self._nodes:
            if start in visited:
                continue
            component: Set[str] = set()
            queue = deque([start])
            while queue:
                nid = queue.popleft()
                if nid in component:
                    continue
                component.add(nid)
                visited.add(nid)
                queue.extend(n for n in self.neighbors(nid) + self.predecessors(nid)
                             if n not in component)
            avg_risk = (sum(self._nodes[n].risk_score for n in component if n in self._nodes)
                        / max(len(component), 1))
            if avg_risk >= min_risk:
                clusters.append(component)

        return sorted(clusters, key=len, reverse=True)

    # ── Stats & export ────────────────────────────────────────────────────────

    def stats(self) -> Dict:
        risks = [n.risk_score for n in self._nodes.values()]
        return {
            "nodes": len(self._nodes),
            "edges": len(self._all_edges),
            "avg_risk": round(sum(risks) / max(len(risks), 1), 4),
            "high_risk_nodes": sum(1 for r in risks if r >= 0.7),
            "edge_types": {k.value: sum(1 for e in self._all_edges if e.kind == k)
                           for k in EdgeKind},
        }

    def top_risk_nodes(self, n: int = 5) -> List[Node]:
        return sorted(self._nodes.values(), key=lambda x: x.risk_score, reverse=True)[:n]

    def __repr__(self) -> str:
        return (f"ThreatGraph(nodes={len(self._nodes)}, "
                f"edges={len(self._all_edges)})")
