"""Unit tests for the untested ThreatGraph and SessionRiskTracker modules."""

import math
import time

import pytest

from src.modules.session_risk import (
    EventType,
    SessionEvent,
    SessionRiskTracker,
    _auth_failure_score,
    _export_score,
    _geo_jump_score,
    _idle_resume_score,
    _privilege_score,
    _ua_switch_score,
    _velocity_score,
)
from src.modules.threat_graph import (
    EDGE_WEIGHT,
    EdgeKind,
    NodeKind,
    ThreatGraph,
)


def _lateral_graph():
    """A -> B -> C -> D lateral-movement chain (weight 0.7 per hop)."""
    g = ThreatGraph()
    for nid in ("A", "B", "C", "D"):
        g.add_node(nid, NodeKind.DEVICE)
    for src, dst in (("A", "B"), ("B", "C"), ("C", "D")):
        g.add_edge(src, dst, EdgeKind.LATERAL_MOVE)
    return g


class TestThreatGraph:
    def test_edge_weight_comes_from_kind(self):
        g = ThreatGraph()
        g.add_node("a", NodeKind.IP)
        g.add_node("b", NodeKind.USER)
        e = g.add_edge("a", "b", EdgeKind.LOGIN)
        assert e.weight == EDGE_WEIGHT[EdgeKind.LOGIN] == 0.2

    def test_high_weight_edge_propagates_risk(self):
        g = ThreatGraph()
        g.add_node("victim", NodeKind.DEVICE)
        g.add_edge("attacker", "victim", EdgeKind.EXPLOIT)  # weight 1.0
        assert g._nodes["victim"].risk_score == 0.2  # +weight * 0.2

    def test_low_weight_edge_does_not_propagate_risk(self):
        g = ThreatGraph()
        g.add_node("victim", NodeKind.DEVICE)
        g.add_edge("attacker", "victim", EdgeKind.DNS_QUERY)  # weight 0.1
        assert g._nodes["victim"].risk_score == 0.0

    def test_risk_propagation_capped_at_one(self):
        g = ThreatGraph()
        g.add_node("victim", NodeKind.DEVICE)
        for i in range(10):
            g.add_edge(f"src{i}", "victim", EdgeKind.EXPLOIT)
        assert g._nodes["victim"].risk_score == 1.0

    def test_add_node_is_idempotent(self):
        g = ThreatGraph()
        g.add_node("a", NodeKind.IP, risk_score=0.5)
        g.add_node("a", NodeKind.IP, risk_score=0.9)  # should not reset
        assert g._nodes["a"].risk_score == 0.5
        assert g.stats()["nodes"] == 1

    def test_attack_chains_sorted_by_weight(self):
        g = _lateral_graph()
        chains = g.attack_chains("A")
        totals = [c.total_weight for c in chains]
        assert totals == sorted(totals, reverse=True)
        # Longest chain A->B->C->D: 3 hops x 0.7
        assert chains[0].nodes == ["A", "B", "C", "D"]
        assert chains[0].total_weight == 2.1
        assert chains[0].severity == "MEDIUM"  # >= 1.5

    def test_attack_chains_respect_min_weight(self):
        g = ThreatGraph()
        g.add_edge("a", "b", EdgeKind.LOGIN)       # 0.2 - below default min 0.5
        g.add_edge("a", "c", EdgeKind.LATERAL_MOVE)  # 0.7
        chains = g.attack_chains("a")
        assert all("b" not in c.nodes for c in chains)
        assert any(c.nodes == ["a", "c"] for c in chains)

    def test_attack_chain_severity_bands(self):
        g = ThreatGraph()
        g.add_edge("a", "b", EdgeKind.EXPLOIT)   # 1.0
        g.add_edge("b", "c", EdgeKind.EXPLOIT)   # 1.0
        g.add_edge("c", "d", EdgeKind.EXFIL)     # 0.95
        g.add_edge("d", "e", EdgeKind.EXFIL)     # 0.95 -> total 3.9
        chains = g.attack_chains("a")
        assert chains[0].total_weight == 3.9
        assert chains[0].severity == "HIGH"  # >= 2.5, < 4.0

    def test_blast_radius_excludes_origin_and_respects_depth(self):
        g = ThreatGraph()
        prev = "n0"
        for i in range(1, 8):
            g.add_edge(prev, f"n{i}", EdgeKind.LATERAL_MOVE)
            prev = f"n{i}"
        assert g.blast_radius("n0", max_depth=2) == {"n1", "n2"}
        assert "n0" not in g.blast_radius("n0", max_depth=10)

    def test_impact_score_sums_risk_in_radius(self):
        g = ThreatGraph()
        # add_edge does not auto-register nodes; ingest_event is the one-shot API.
        g.ingest_event("a", NodeKind.IP, "b", NodeKind.DEVICE, EdgeKind.EXPLOIT)
        g.ingest_event("b", NodeKind.DEVICE, "c", NodeKind.DEVICE, EdgeKind.EXPLOIT)
        assert g.impact_score("a") == 0.4  # b.risk 0.2 + c.risk 0.2

    def test_pivot_nodes_on_linear_chain(self):
        g = _lateral_graph()
        pivots = g.pivot_nodes()
        # B and C sit on paths; A and D are endpoints.
        assert {p.node_id for p in pivots} == {"B", "C"}
        for p in pivots:
            assert p.betweenness == 1.0  # normalized by max
            # 0.4*1.0 + 0.3*(1/10) + 0.3*(1/10)
            assert p.pivot_score == 0.46

    def test_subgraph_depth_limited(self):
        g = _lateral_graph()
        sub = g.subgraph("A", depth=1)
        assert set(sub._nodes) == {"A", "B"}
        assert sub.stats()["edges"] == 1

    def test_suspicious_clusters_by_avg_risk(self):
        g = ThreatGraph()
        # High-risk component
        g.add_node("h1", NodeKind.IP, risk_score=0.9)
        g.add_node("h2", NodeKind.IP, risk_score=0.7)
        g.add_edge("h1", "h2", EdgeKind.C2_BEACON)
        # Low-risk component
        g.add_node("l1", NodeKind.IP, risk_score=0.1)
        g.add_node("l2", NodeKind.IP, risk_score=0.0)
        g.add_edge("l1", "l2", EdgeKind.DNS_QUERY)
        clusters = g.suspicious_clusters(min_risk=0.5)
        assert clusters == [{"h1", "h2"}]

    def test_stats_and_top_risk(self):
        g = _lateral_graph()
        s = g.stats()
        assert s["nodes"] == 4 and s["edges"] == 3
        assert s["edge_types"]["lateral_move"] == 3
        assert len(g.top_risk_nodes(2)) == 2


class TestSessionRiskFactors:
    def test_velocity_score_bounds(self):
        assert _velocity_score(0) == 0.0
        assert _velocity_score(-5) == 0.0
        # rpm = 10x baseline saturates the log curve at 1.0
        assert _velocity_score(300.0, baseline_rpm=30.0) == 1.0

    def test_auth_failure_score_exponential(self):
        assert _auth_failure_score(0) == 0.0
        assert _auth_failure_score(5) == pytest.approx(1.0 - math.exp(-1.0))
        assert _auth_failure_score(20) > 0.98

    def test_simple_factor_caps(self):
        assert _geo_jump_score(3) == 1.0       # 0.4 * 3 capped
        assert _ua_switch_score(1) == 0.35
        assert _privilege_score(2) == 1.0      # 0.5 * 2 capped
        assert _export_score(1) == 0.45

    def test_idle_resume_threshold(self):
        assert _idle_resume_score(1799) == 0.0
        assert _idle_resume_score(1800) == 0.0
        assert _idle_resume_score(5400) == 0.5  # fully capped


class TestSessionRiskTracker:
    def test_first_event_sets_fingerprint(self):
        t = SessionRiskTracker()
        t.update("s1", SessionEvent(EventType.REQUEST, ip="1.2.3.4",
                                    country="IN", user_agent="Chrome", ts=1000.0))
        st = t._sessions["s1"]
        assert (st.origin_ip, st.origin_country, st.origin_ua) == ("1.2.3.4", "IN", "Chrome")

    def test_failed_auth_counting(self):
        t = SessionRiskTracker()
        for code, expected in ((401, 1), (403, 2), (200, 2)):
            t.update("s1", SessionEvent(EventType.AUTH_ATTEMPT, status_code=code, ts=1000.0))
            assert t._sessions["s1"].failed_auth_count == expected

    def test_geo_jump_only_on_country_change(self):
        t = SessionRiskTracker()
        t.update("s1", SessionEvent(EventType.REQUEST, country="IN", ts=1000.0))
        t.update("s1", SessionEvent(EventType.GEO_CHANGE, country="IN", ts=1001.0))
        assert t._sessions["s1"].geo_jumps == 0
        t.update("s1", SessionEvent(EventType.GEO_CHANGE, country="RU", ts=1002.0))
        assert t._sessions["s1"].geo_jumps == 1

    def test_ua_switch_only_on_change(self):
        t = SessionRiskTracker()
        t.update("s1", SessionEvent(EventType.REQUEST, user_agent="Chrome", ts=1000.0))
        t.update("s1", SessionEvent(EventType.UA_CHANGE, user_agent="Chrome", ts=1001.0))
        assert t._sessions["s1"].ua_switches == 0
        t.update("s1", SessionEvent(EventType.UA_CHANGE, user_agent="curl/8", ts=1002.0))
        assert t._sessions["s1"].ua_switches == 1

    def test_score_rises_with_failed_auths(self):
        t = SessionRiskTracker()
        scores = []
        for _ in range(5):
            scores.append(t.update("s1", SessionEvent(EventType.AUTH_ATTEMPT,
                                                      status_code=401, ts=1000.0)))
        assert scores == sorted(scores)
        assert scores[-1] > 0

    def test_ewma_converges_to_persistent_raw(self):
        t = SessionRiskTracker()
        for _ in range(5):
            t.update("s1", SessionEvent(EventType.AUTH_ATTEMPT, status_code=401, ts=1000.0))
        # Failure counters are cumulative and never reset, so benign events do
        # not decay the score: raw stays at the auth factor and EWMA converges
        # up to it. (Old timestamps keep the velocity factor at 0.)
        for _ in range(60):
            t.update("s1", SessionEvent(EventType.REQUEST, ts=1000.0))
        expected_raw = 0.25 * (1.0 - math.exp(-0.2 * 5))
        assert t.score("s1") == pytest.approx(expected_raw, abs=0.001)

    def test_velocity_factor_with_live_timestamps(self):
        t = SessionRiskTracker()
        score = 0.0
        for _ in range(60):
            score = t.update("s1", SessionEvent(EventType.REQUEST, ts=time.time()))
        # rpm=60, baseline 30 -> velocity factor log1p(2)/log1p(10), weight 0.25
        expected_raw = 0.25 * (math.log1p(2) / math.log1p(10))
        assert abs(score - expected_raw) < 0.005

    def test_unknown_session_score_is_none(self):
        t = SessionRiskTracker()
        assert t.score("nope") is None

    def test_evict_stale_removes_old_sessions(self):
        t = SessionRiskTracker(session_ttl_s=3600)
        t.update("old", SessionEvent(EventType.REQUEST, ts=1000.0))
        t.update("new", SessionEvent(EventType.REQUEST, ts=time.time()))
        assert t.evict_stale() == 1
        assert t.score("old") is None
        assert t.score("new") is not None

    def test_top_risky_ordering(self):
        t = SessionRiskTracker()
        for _ in range(3):
            t.update("risky", SessionEvent(EventType.AUTH_ATTEMPT, status_code=401, ts=1000.0))
        t.update("calm", SessionEvent(EventType.REQUEST, ts=1000.0))
        ranked = t.top_risky()
        assert ranked[0][0] == "risky"
        assert t.session_count() == 2
