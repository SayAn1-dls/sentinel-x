"""Unit tests for the ThreatGraph correlation engine."""

import time

from src.modules.threat_graph import (
    AttackChain,
    Edge,
    EdgeKind,
    Node,
    NodeKind,
    ThreatGraph,
)


def _lateral_movement_graph() -> ThreatGraph:
    """attacker IP -> alice (login) -> db (data access) + c2 beacon."""
    g = ThreatGraph()
    g.add_node("ip:1.2.3.4", NodeKind.IP, label="attacker", risk_score=0.5)
    g.add_node("user:alice", NodeKind.USER, label="alice")
    g.add_node("host:db1", NodeKind.DEVICE, label="db1")
    g.ingest_event("ip:1.2.3.4", NodeKind.IP, "user:alice", NodeKind.USER,
                   EdgeKind.LOGIN)
    g.add_edge("user:alice", "host:db1", EdgeKind.DATA_ACCESS)
    g.add_edge("host:db1", "ip:9.9.9.9", EdgeKind.C2_BEACON)
    return g


class TestMutationAndRiskPropagation:
    def test_add_node_is_idempotent_and_keeps_original(self):
        g = ThreatGraph()
        first = g.add_node("user:bob", NodeKind.USER, label="bob", risk_score=0.3)
        second = g.add_node("user:bob", NodeKind.USER, label="renamed")
        assert first is second
        assert second.label == "bob"
        assert second.risk_score == 0.3

    def test_high_weight_edge_propagates_risk_to_destination(self):
        g = ThreatGraph()
        g.add_node("a", NodeKind.IP)
        g.add_node("b", NodeKind.DEVICE)
        g.add_edge("a", "b", EdgeKind.EXPLOIT)  # weight 1.0 >= 0.7
        assert abs(g.top_risk_nodes(1)[0].risk_score - 0.2) < 1e-9

    def test_low_weight_edge_does_not_propagate_risk(self):
        g = ThreatGraph()
        g.add_node("a", NodeKind.IP)
        g.add_node("b", NodeKind.DEVICE)
        g.add_edge("a", "b", EdgeKind.DNS_QUERY)  # weight 0.1 < 0.7
        node_b = [n for n in g._nodes.values() if n.node_id == "b"][0]
        assert node_b.risk_score == 0.0


class TestTraversal:
    def test_bfs_respects_max_depth(self):
        g = _lateral_movement_graph()
        depths = dict(g.bfs("ip:1.2.3.4", max_depth=1))
        assert depths == {"ip:1.2.3.4": 0, "user:alice": 1}

    def test_blast_radius_excludes_origin(self):
        g = _lateral_movement_graph()
        radius = g.blast_radius("ip:1.2.3.4", max_depth=2)
        assert "ip:1.2.3.4" not in radius
        assert radius == {"user:alice", "host:db1"}

    def test_impact_score_sums_risk_in_radius(self):
        g = _lateral_movement_graph()
        expected = sum(
            n.risk_score for n in g._nodes.values() if n.node_id != "ip:1.2.3.4"
        )
        assert g.impact_score("ip:1.2.3.4") == round(expected, 4)


class TestAttackChains:
    def test_chains_sorted_by_total_weight_descending(self):
        g = _lateral_movement_graph()
        chains = g.attack_chains("ip:1.2.3.4", min_weight=0.0)
        weights = [c.total_weight for c in chains]
        assert weights == sorted(weights, reverse=True)
        assert len(chains) > 0

    def test_chains_respect_min_weight(self):
        g = _lateral_movement_graph()
        chains = g.attack_chains("host:db1", min_weight=0.5)
        # Only the C2_BEACON edge (0.9) qualifies from host:db1.
        assert len(chains) == 1
        assert chains[0].nodes == ["host:db1", "ip:9.9.9.9"]

    def test_no_cycles_in_chains(self):
        g = ThreatGraph()
        g.add_edge("a", "b", EdgeKind.LATERAL_MOVE)
        g.add_edge("b", "a", EdgeKind.LATERAL_MOVE)
        chains = g.attack_chains("a")
        for chain in chains:
            assert len(chain.nodes) == len(set(chain.nodes))


class TestSubgraph:
    def test_subgraph_preserves_risk_scores(self):
        g = ThreatGraph()
        g.add_node("ip:1.2.3.4", NodeKind.IP, risk_score=0.5)
        g.add_node("host:web1", NodeKind.DEVICE)
        g.add_edge("ip:1.2.3.4", "host:web1", EdgeKind.EXPLOIT)
        parent_risk = g._nodes["host:web1"].risk_score
        sub = g.subgraph("ip:1.2.3.4", depth=1)
        assert sub._nodes["host:web1"].risk_score == parent_risk

    def test_subgraph_preserves_edge_metadata(self):
        g = ThreatGraph()
        g.add_node("a", NodeKind.IP)
        g.add_node("b", NodeKind.DEVICE)
        g.add_edge("a", "b", EdgeKind.EXFIL, note="500MB out")
        sub = g.subgraph("a", depth=1)
        assert sub._all_edges[0].metadata == {"note": "500MB out"}

    def test_subgraph_limited_to_depth(self):
        g = _lateral_movement_graph()
        sub = g.subgraph("ip:1.2.3.4", depth=1)
        assert set(sub._nodes) == {"ip:1.2.3.4", "user:alice"}
        assert len(sub._all_edges) == 1

    def test_subgraph_does_not_mutate_parent(self):
        g = _lateral_movement_graph()
        edges_before = len(g._all_edges)
        nodes_before = len(g._nodes)
        g.subgraph("ip:1.2.3.4", depth=2)
        assert len(g._all_edges) == edges_before
        assert len(g._nodes) == nodes_before


class TestStats:
    def test_stats_counts(self):
        g = _lateral_movement_graph()
        s = g.stats()
        assert s["nodes"] == 3
        assert s["edges"] == 3
        assert s["edge_types"]["login"] == 1
        assert s["edge_types"]["c2_beacon"] == 1


class TestExplicitTimestamp:
    def test_epoch_zero_timestamp_preserved(self):
        # Regression: `timestamp or time.time()` conflated falsy 0.0 with
        # the None default and silently re-stamped epoch-0 events to now.
        g = ThreatGraph()
        edge = g.add_edge("a", "b", EdgeKind.LOGIN, timestamp=0.0)
        assert edge.timestamp == 0.0

    def test_none_timestamp_defaults_to_now(self):
        g = ThreatGraph()
        before = time.time()
        edge = g.add_edge("a", "b", EdgeKind.LOGIN)
        assert before <= edge.timestamp <= time.time()


class TestModelContracts:
    def test_node_touch_updates_last_seen_only(self):
        node = Node(node_id="n1", kind=NodeKind.IP, label="x",
                    risk_score=0.5, first_seen=100.0, last_seen=100.0)
        node.touch()
        assert node.last_seen > 100.0
        assert node.first_seen == 100.0

    def test_node_identity_by_node_id(self):
        a = Node(node_id="n1", kind=NodeKind.IP, label="a")
        b = Node(node_id="n1", kind=NodeKind.USER, label="b")
        c = Node(node_id="n2", kind=NodeKind.IP, label="a")
        assert a == b and hash(a) == hash(b)
        assert a != c and a != "n1"

    def test_edge_uid_format(self):
        e = Edge(src="s", dst="d", kind=EdgeKind.LOGIN, weight=0.2)
        assert e.uid == f"s→d:{EdgeKind.LOGIN}"

    def test_chain_length_and_path_str(self):
        chain = AttackChain(nodes=["a", "b", "c"], edges=[],
                            total_weight=1.0, max_weight=0.5)
        assert chain.length == 3
        assert chain.path_str == "a → b → c"

    def test_chain_severity_thresholds(self):
        def sev(total):
            return AttackChain(nodes=["a", "b"], edges=[],
                               total_weight=total, max_weight=0.0).severity
        assert sev(4.0) == "CRITICAL"
        assert sev(2.5) == "HIGH"
        assert sev(1.5) == "MEDIUM"
        assert sev(1.4) == "LOW"


class TestDfsTraversal:
    def test_dfs_visits_all_reachable_once(self):
        g = ThreatGraph()
        for s, d in [("a", "b"), ("b", "c"), ("a", "c"), ("c", "d")]:
            g.add_edge(s, d, EdgeKind.LOGIN)
        assert sorted(g.dfs("a")) == ["a", "b", "c", "d"]

    def test_dfs_respects_max_depth(self):
        g = ThreatGraph()
        g.add_edge("a", "b", EdgeKind.LOGIN)
        g.add_edge("b", "c", EdgeKind.LOGIN)
        assert sorted(g.dfs("a", max_depth=1)) == ["a", "b"]

    def test_dfs_matches_bfs_reachability(self):
        g = ThreatGraph()
        for s, d in [("a", "b"), ("b", "c"), ("a", "d"), ("d", "e")]:
            g.add_edge(s, d, EdgeKind.LOGIN)
        bfs_nodes = {n for n, _ in g.bfs("a")}
        assert set(g.dfs("a")) == bfs_nodes


class TestScoreAndStatsEdges:
    def test_impact_score_zero_for_isolated_node(self):
        g = ThreatGraph()
        g.add_node("lonely", NodeKind.IP, risk_score=0.9)
        assert g.impact_score("lonely") == 0.0

    def test_pivot_nodes_ranks_intermediate_node(self):
        g = ThreatGraph()
        for nid in ("a", "b", "m", "c", "d"):
            g.add_node(nid, NodeKind.IP)
        for s, d in [("a", "m"), ("b", "m"), ("m", "c"), ("m", "d")]:
            g.add_edge(s, d, EdgeKind.LOGIN)
        pivots = g.pivot_nodes()
        assert pivots[0].node_id == "m"
        assert pivots[0].pivot_score > 0

    def test_suspicious_clusters_groups_connected_high_risk(self):
        g = ThreatGraph()
        g.add_node("x", NodeKind.IP, risk_score=0.9)
        g.add_node("y", NodeKind.USER, risk_score=0.9)
        g.add_edge("x", "y", EdgeKind.C2_BEACON)
        g.add_node("z", NodeKind.IP, risk_score=0.0)
        clusters = g.suspicious_clusters(min_risk=0.5)
        assert clusters == [{"x", "y"}]

    def test_top_risk_nodes_orders_descending(self):
        g = ThreatGraph()
        g.add_node("low", NodeKind.IP, risk_score=0.1)
        g.add_node("high", NodeKind.IP, risk_score=0.9)
        assert [n.node_id for n in g.top_risk_nodes(1)] == ["high"]

    def test_repr_shows_counts(self):
        g = ThreatGraph()
        g.add_edge("a", "b", EdgeKind.LOGIN)
        assert repr(g) == "ThreatGraph(nodes=0, edges=1)"
