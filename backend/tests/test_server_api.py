"""Contract tests for the standalone FastAPI mock server (backend/server.py)."""

from fastapi.testclient import TestClient

from backend.server import MOCK_ALERTS, MOCK_AUDIT, MOCK_TRANSACTIONS, MOCK_USERS, app

client = TestClient(app)


class TestMeta:
    def test_root_lists_endpoints(self):
        body = client.get("/").json()
        assert body["status"] == "operational"
        assert "/api/transactions" in body["endpoints"]

    def test_health(self):
        body = client.get("/health").json()
        assert body["status"] == "ok"


class TestTransactions:
    def test_default_limit_returns_slice(self):
        body = client.get("/api/transactions").json()
        assert body["limit"] == 10
        assert body["data"] == MOCK_TRANSACTIONS[:10]

    def test_limit_applies(self):
        body = client.get("/api/transactions", params={"limit": 3}).json()
        assert len(body["data"]) == 3

    def test_offset_applies(self):
        first = client.get("/api/transactions", params={"limit": 2}).json()["data"]
        rest = client.get("/api/transactions",
                          params={"limit": 2, "offset": 2}).json()["data"]
        assert rest == MOCK_TRANSACTIONS[2:4]
        assert [t["id"] for t in rest] != [t["id"] for t in first]

    def test_offset_beyond_data_returns_empty(self):
        body = client.get("/api/transactions", params={"offset": 500}).json()
        assert body["data"] == []


class TestAlerts:
    def test_status_filter(self):
        body = client.get("/api/alerts", params={"status": "OPEN"}).json()
        expected = [a for a in MOCK_ALERTS if a["status"] == "OPEN"]
        assert body["data"] == expected
        assert body["total"] == len(expected)

    def test_status_filter_case_insensitive(self):
        upper = client.get("/api/alerts", params={"status": "OPEN"}).json()
        lower = client.get("/api/alerts", params={"status": "open"}).json()
        assert upper == lower

    def test_all_returns_everything(self):
        body = client.get("/api/alerts").json()
        assert body["total"] == len(MOCK_ALERTS)


class TestAudit:
    def test_severity_filter(self):
        body = client.get("/api/audit", params={"severity": "CRITICAL"}).json()
        assert all(a["severity"] == "CRITICAL" for a in body["data"])
        assert body["total"] == len(body["data"])

    def test_pagination(self):
        page1 = client.get("/api/audit", params={"limit": 2}).json()["data"]
        page2 = client.get("/api/audit",
                           params={"limit": 2, "offset": 2}).json()["data"]
        assert page1 == MOCK_AUDIT[:2]
        assert page2 == MOCK_AUDIT[2:4]


class TestUsersAndNetwork:
    def test_users(self):
        body = client.get("/api/users").json()
        assert body["total"] == len(MOCK_USERS)

    def test_network_nodes(self):
        body = client.get("/api/network").json()
        assert len(body["nodes"]) == 15
        assert all("risk" in n and "connections" in n for n in body["nodes"])
