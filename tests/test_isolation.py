"""
Unit Tests for Node Isolation Routes
=====================================
Covers backend/routes/isolation.py: POST /api/nodes/isolate,
POST /api/nodes/release, GET /api/nodes/isolated.

Note: the router is tested on a minimal app here because backend/server.py
does not currently mount it.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routes.isolation import router, ISOLATED_NODES


def make_client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


class TestIsolateNode:
    """Test suite for POST /api/nodes/isolate."""

    def setup_method(self):
        ISOLATED_NODES.clear()
        self.client = make_client()

    def _isolate(self, node_id="node-1", severity="HIGH"):
        return self.client.post("/api/nodes/isolate", json={
            "node_id": node_id,
            "reason": "suspicious traffic",
            "severity": severity,
        })

    def test_isolate_success(self):
        resp = self._isolate()
        assert resp.status_code == 200
        body = resp.json()
        assert body["node_id"] == "node-1"
        assert body["isolated"] is True
        assert "node-1" in body["message"]

    def test_isolate_adds_to_registry(self):
        self._isolate()
        assert "node-1" in ISOLATED_NODES

    def test_duplicate_isolate_returns_409(self):
        self._isolate()
        resp = self._isolate()
        assert resp.status_code == 409
        assert "already isolated" in resp.json()["detail"]

    def test_default_initiated_by_is_system(self, caplog):
        import logging
        with caplog.at_level(logging.WARNING):
            self._isolate()
        assert "by=SYSTEM" in caplog.text

    def test_invalid_severity_rejected(self):
        resp = self._isolate(severity="URGENT")
        assert resp.status_code == 422

    def test_missing_reason_rejected(self):
        resp = self.client.post("/api/nodes/isolate", json={
            "node_id": "node-1",
            "severity": "HIGH",
        })
        assert resp.status_code == 422

    def test_missing_node_id_rejected(self):
        resp = self.client.post("/api/nodes/isolate", json={
            "reason": "suspicious traffic",
            "severity": "HIGH",
        })
        assert resp.status_code == 422


class TestReleaseNode:
    """Test suite for POST /api/nodes/release."""

    def setup_method(self):
        ISOLATED_NODES.clear()
        self.client = make_client()

    def test_release_isolated_node(self):
        ISOLATED_NODES.add("node-1")
        resp = self.client.post("/api/nodes/release", json={
            "node_id": "node-1",
            "reason": "cleared",
            "severity": "LOW",
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["isolated"] is False
        assert "node-1" not in ISOLATED_NODES

    def test_release_non_isolated_node_is_idempotent(self):
        resp = self.client.post("/api/nodes/release", json={
            "node_id": "node-9",
            "reason": "cleared",
            "severity": "LOW",
        })
        assert resp.status_code == 200
        assert resp.json()["isolated"] is False


class TestListIsolated:
    """Test suite for GET /api/nodes/isolated."""

    def setup_method(self):
        ISOLATED_NODES.clear()
        self.client = make_client()

    def test_empty_when_none_isolated(self):
        resp = self.client.get("/api/nodes/isolated")
        assert resp.status_code == 200
        assert resp.json() == {"isolated_nodes": [], "count": 0}

    def test_lists_all_isolated_nodes(self):
        ISOLATED_NODES.update({"node-1", "node-2"})
        resp = self.client.get("/api/nodes/isolated")
        body = resp.json()
        assert body["count"] == 2
        assert set(body["isolated_nodes"]) == {"node-1", "node-2"}

    def test_reflects_isolate_and_release(self):
        self.client.post("/api/nodes/isolate", json={
            "node_id": "node-1", "reason": "r", "severity": "LOW"})
        self.client.post("/api/nodes/isolate", json={
            "node_id": "node-2", "reason": "r", "severity": "LOW"})
        self.client.post("/api/nodes/release", json={
            "node_id": "node-1", "reason": "r", "severity": "LOW"})
        body = self.client.get("/api/nodes/isolated").json()
        assert body["count"] == 1
        assert body["isolated_nodes"] == ["node-2"]
