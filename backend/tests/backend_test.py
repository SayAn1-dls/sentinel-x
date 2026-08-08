"""SENTINEL-X backend test suite (Next.js API via FastAPI proxy)."""
import os
import time
import uuid
import subprocess
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
ADMIN_TOKEN = "test_session_sentinel_001"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def admin_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {ADMIN_TOKEN}"})
    return s


@pytest.fixture(scope="session")
def anon_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def analyst_session():
    """Create an ANALYST user + session directly in Mongo, yield token, cleanup."""
    uid = f"test-analyst-{int(time.time())}-{uuid.uuid4().hex[:6]}"
    tok = f"test_session_analyst_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    email = f"test.analyst.{int(time.time())}@example.com"
    js = f"""
    use('test_database');
    db.users.insertOne({{user_id:'{uid}', email:'{email}', name:'Test Analyst',
      picture:'https://via.placeholder.com/150', role:'ANALYST',
      created_at:new Date(), last_login:new Date()}});
    db.user_sessions.insertOne({{user_id:'{uid}', session_token:'{tok}',
      expires_at:new Date(Date.now()+7*24*60*60*1000), created_at:new Date()}});
    """
    subprocess.run(["mongosh", "--quiet", "--eval", js], check=True, capture_output=True)
    yield {"user_id": uid, "token": tok, "email": email}
    cleanup = f"use('test_database'); db.users.deleteOne({{user_id:'{uid}'}}); db.user_sessions.deleteOne({{session_token:'{tok}'}});"
    subprocess.run(["mongosh", "--quiet", "--eval", cleanup], capture_output=True)


# ---------- Auth ----------
class TestAuth:
    def test_me_no_token_401(self, anon_client):
        r = anon_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_bearer_ok(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        d = r.json()
        assert d.get("user_id") == "test-admin-001"
        assert d.get("email") == "test.admin@example.com"
        assert d.get("role") == "ADMIN"
        assert "passkey_count" in d

    def test_me_via_cookie(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", cookies={"session_token": ADMIN_TOKEN})
        assert r.status_code == 200
        assert r.json().get("role") == "ADMIN"

    def test_session_exchange_missing_id_400(self, anon_client):
        r = anon_client.post(f"{BASE_URL}/api/auth/session", json={})
        assert r.status_code == 400

    def test_session_exchange_invalid_id_401(self, anon_client):
        r = anon_client.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid-nonexistent-id-xyz"})
        assert r.status_code in (401, 502)  # 502 possible if upstream unreachable; primary expected 401


# ---------- Transactions ----------
class TestTransactions:
    def test_list_requires_auth(self, anon_client):
        r = anon_client.get(f"{BASE_URL}/api/transactions?limit=2")
        assert r.status_code == 401

    def test_list_ok(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/transactions?limit=5")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d.get("data"), list)
        assert "total" in d
        assert len(d["data"]) <= 5
        if d["data"]:
            tx = d["data"][0]
            for k in ("id", "amount", "status", "threatLevel"):
                assert k in tx

    def test_filter_status(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/transactions?status=CLEAN&limit=10")
        assert r.status_code == 200
        for tx in r.json()["data"]:
            assert tx["status"] == "CLEAN"

    def test_live_flag(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/transactions?limit=3&live=1")
        assert r.status_code == 200

    def test_block_transaction_persists(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/transactions?status=FLAGGED&limit=5")
        assert r.status_code == 200
        candidates = [t for t in r.json()["data"] if t["status"] != "BLOCKED"]
        if not candidates:
            r2 = admin_client.get(f"{BASE_URL}/api/transactions?limit=20")
            candidates = [t for t in r2.json()["data"] if t["status"] != "BLOCKED"]
        assert candidates, "No non-blocked transactions to test with"
        tx_id = candidates[0]["id"]
        rb = admin_client.patch(f"{BASE_URL}/api/transactions/{tx_id}/block")
        assert rb.status_code in (200, 204)
        # Verify persistence
        rv = admin_client.get(f"{BASE_URL}/api/transactions?limit=200")
        matched = [t for t in rv.json()["data"] if t["id"] == tx_id]
        assert matched and matched[0]["status"] == "BLOCKED"
        # Audit log entry
        ra = admin_client.get(f"{BASE_URL}/api/audit?limit=50")
        assert ra.status_code == 200
        actions = [e.get("action") for e in ra.json().get("data", [])]
        assert "BLOCK_TRANSACTION" in actions


# ---------- Alerts ----------
class TestAlerts:
    def test_list_alerts(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/alerts")
        assert r.status_code == 200
        d = r.json()
        assert "data" in d
        assert "summary" in d

    def test_resolve_and_dismiss(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/alerts")
        alerts = r.json()["data"]
        open_alerts = [a for a in alerts if a.get("status") not in ("RESOLVED", "DISMISSED")]
        if len(open_alerts) < 2:
            pytest.skip("Not enough open alerts to test resolve/dismiss")
        a1, a2 = open_alerts[0], open_alerts[1]
        rr = admin_client.patch(f"{BASE_URL}/api/alerts/{a1['id']}", json={"action": "resolve"})
        assert rr.status_code == 200
        rd = admin_client.patch(f"{BASE_URL}/api/alerts/{a2['id']}", json={"action": "dismiss"})
        assert rd.status_code == 200
        # Audit
        ra = admin_client.get(f"{BASE_URL}/api/audit?limit=100")
        actions = [e.get("action") for e in ra.json().get("data", [])]
        assert any("ALERT" in (a or "") or "RESOLVE" in (a or "") or "DISMISS" in (a or "") for a in actions)


# ---------- Audit / Stats ----------
class TestAuditStats:
    def test_audit_list(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/audit?limit=10")
        assert r.status_code == 200
        assert "data" in r.json()

    def test_audit_severity_filter(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/audit?severity=HIGH&limit=10")
        assert r.status_code == 200

    def test_stats(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("totalTransactions", "flaggedToday", "blockedThreats", "networkHealth", "threatIndex"):
            assert k in d, f"missing {k}"


# ---------- Scan ----------
class TestScan:
    def test_scan_target(self, admin_client):
        r = admin_client.post(f"{BASE_URL}/api/scan", json={"target": "DARK-POOL-7"})
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        payload = d.get("data", d)
        assert "findings" in payload
        assert "confidence" in payload

    def test_recent_scans(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/scan")
        assert r.status_code == 200
        d = r.json()
        assert "recentScans" in d
        assert isinstance(d["recentScans"], list)


# ---------- Network ----------
class TestNetwork:
    def test_gateways(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/network")
        assert r.status_code == 200
        d = r.json()
        # accept either list at top-level or {gateways:[...]}
        gws = d.get("gateways") if isinstance(d, dict) else d
        assert isinstance(gws, list)
        assert len(gws) > 0
        gw = gws[0]
        assert "id" in gw or "gateway_id" in gw or "name" in gw


# ---------- RBAC users ----------
class TestUsersRBAC:
    def test_admin_can_list(self, admin_client):
        r = admin_client.get(f"{BASE_URL}/api/users")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d.get("data") or d, list) or "users" in d

    def test_analyst_cannot_list(self, analyst_session):
        r = requests.get(f"{BASE_URL}/api/users",
                         headers={"Authorization": f"Bearer {analyst_session['token']}"})
        assert r.status_code == 403

    def test_admin_cannot_change_own_role(self, admin_client):
        r = admin_client.patch(f"{BASE_URL}/api/users/test-admin-001", json={"role": "ANALYST"})
        assert r.status_code == 400

    def test_admin_change_analyst_role(self, admin_client, analyst_session):
        r = admin_client.patch(f"{BASE_URL}/api/users/{analyst_session['user_id']}",
                               json={"role": "ADMIN"})
        assert r.status_code == 200
        # revert
        admin_client.patch(f"{BASE_URL}/api/users/{analyst_session['user_id']}",
                           json={"role": "ANALYST"})


# ---------- WebAuthn passkeys ----------
class TestPasskeys:
    def test_login_options_no_auth(self, anon_client):
        r = anon_client.post(f"{BASE_URL}/api/passkeys/login/options", json={})
        assert r.status_code == 200
        d = r.json()
        # Expect either raw options or wrapped in {options,flowId}
        opts = d.get("options", d)
        assert "rpId" in opts or "rp" in opts or "challenge" in opts
        assert "flowId" in d or "flow_id" in d

    def test_register_options_requires_auth(self, anon_client):
        r = anon_client.post(f"{BASE_URL}/api/passkeys/register/options", json={})
        assert r.status_code == 401
