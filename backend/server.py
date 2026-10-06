"""
Sentinel-X API Server — standalone FastAPI backend with mock data.
No database required. All endpoints return realistic mock data.
"""
import os
import random
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sentinel-X API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_TRANSACTIONS = [
    {"id": "TX-4F2A1B", "amount": 142500.00, "from_entity": "ENT-0091", "to_entity": "ENT-0447", "risk": "CRITICAL", "timestamp": "2026-09-15T09:12:43Z"},
    {"id": "TX-9C3D2E", "amount": 8750.50,   "from_entity": "ENT-0234", "to_entity": "ENT-0118", "risk": "LOW",      "timestamp": "2026-09-15T09:11:22Z"},
    {"id": "TX-1E7F3A", "amount": 55000.00,  "from_entity": "ENT-0567", "to_entity": "ENT-0023", "risk": "HIGH",     "timestamp": "2026-09-15T09:10:58Z"},
    {"id": "TX-7B8C4D", "amount": 3200.00,   "from_entity": "ENT-0312", "to_entity": "ENT-0789", "risk": "CLEAR",    "timestamp": "2026-09-15T09:10:11Z"},
    {"id": "TX-2A9E5F", "amount": 29999.99,  "from_entity": "ENT-0445", "to_entity": "ENT-0156", "risk": "MEDIUM",   "timestamp": "2026-09-15T09:09:47Z"},
    {"id": "TX-6D1F2C", "amount": 890000.00, "from_entity": "ENT-0001", "to_entity": "ENT-0999", "risk": "CRITICAL", "timestamp": "2026-09-15T09:09:03Z"},
    {"id": "TX-3E4A7B", "amount": 15600.00,  "from_entity": "ENT-0673", "to_entity": "ENT-0334", "risk": "MEDIUM",   "timestamp": "2026-09-15T09:08:31Z"},
    {"id": "TX-8F5B6C", "amount": 1250.00,   "from_entity": "ENT-0892", "to_entity": "ENT-0211", "risk": "CLEAR",    "timestamp": "2026-09-15T09:07:59Z"},
    {"id": "TX-5C2D9E", "amount": 75000.00,  "from_entity": "ENT-0524", "to_entity": "ENT-0087", "risk": "HIGH",     "timestamp": "2026-09-15T09:07:22Z"},
    {"id": "TX-0A3F8D", "amount": 440.00,    "from_entity": "ENT-0741", "to_entity": "ENT-0362", "risk": "LOW",      "timestamp": "2026-09-15T09:06:48Z"},
]

MOCK_ALERTS = [
    {"id": "ALT-000", "type": "GPU_FINGERPRINT_MISMATCH", "entity": "ENT-0091",    "severity": "HIGH",     "message": "GPU execution signature mismatch detected (v40)", "timestamp": "2026-09-21T10:05:00Z", "status": "OPEN"},

    {"id": "ALT-001", "type": "SANCTIONS_HIT",    "entity": "ENT-0091",    "severity": "CRITICAL", "message": "Entity flagged against OFAC SDN list",              "timestamp": "2026-09-15T09:12:43Z", "status": "OPEN"},
    {"id": "ALT-002", "type": "VELOCITY_BREACH",  "entity": "ENT-0001",    "severity": "CRITICAL", "message": "890K transfer exceeds 24h velocity limit",           "timestamp": "2026-09-15T09:09:03Z", "status": "OPEN"},
    {"id": "ALT-003", "type": "CLUSTER_ANOMALY",  "entity": "CLUSTER-7X",  "severity": "HIGH",     "message": "Unusual node connectivity pattern detected",          "timestamp": "2026-09-15T08:55:12Z", "status": "INVESTIGATING"},
    {"id": "ALT-004", "type": "GEO_MISMATCH",     "entity": "ENT-0567",    "severity": "HIGH",     "message": "Transaction origin conflicts with registered address", "timestamp": "2026-09-15T08:41:07Z", "status": "OPEN"},
    {"id": "ALT-005", "type": "STRUCTURING",      "entity": "ENT-0445",    "severity": "MEDIUM",   "message": "Repeated near-threshold transfers detected",          "timestamp": "2026-09-15T08:30:19Z", "status": "MONITORING"},
]

MOCK_AUDIT = [
    {"id": "AUD-000", "timestamp": "2026-09-21T10:05:00Z", "actor": "ml-engine@sentinel-x","action": "GPU_PIPELINE_STALL", "target": "TX-4F2A1B",       "severity": "MEDIUM",   "ip": "10.0.0.3"},

    {"id": "AUD-001", "timestamp": "2026-09-15T09:12:43Z", "actor": "system@sentinel-x",  "action": "SANCTIONS_HIT",     "target": "ENT-0091",        "severity": "CRITICAL", "ip": "10.0.0.1"},
    {"id": "AUD-002", "timestamp": "2026-09-15T09:09:03Z", "actor": "ml-engine@sentinel-x","action": "VELOCITY_BREACH",  "target": "TX-6D1F2C",       "severity": "CRITICAL", "ip": "10.0.0.2"},
    {"id": "AUD-003", "timestamp": "2026-09-15T09:00:00Z", "actor": "analyst@sentinel-x", "action": "ALERT_DISMISSED",   "target": "ALT-006",         "severity": "LOW",      "ip": "192.168.1.45"},
    {"id": "AUD-004", "timestamp": "2026-09-15T08:55:12Z", "actor": "ml-engine@sentinel-x","action": "CLUSTER_DISSOLVED","target": "CLUSTER-3B",      "severity": "HIGH",     "ip": "10.0.0.2"},
    {"id": "AUD-005", "timestamp": "2026-09-15T08:41:07Z", "actor": "system@sentinel-x",  "action": "GEO_FLAG",          "target": "ENT-0567",        "severity": "HIGH",     "ip": "10.0.0.1"},
    {"id": "AUD-006", "timestamp": "2026-09-15T08:30:19Z", "actor": "system@sentinel-x",  "action": "STRUCTURING_ALERT", "target": "ENT-0445",        "severity": "MEDIUM",   "ip": "10.0.0.1"},
    {"id": "AUD-007", "timestamp": "2026-09-15T08:15:00Z", "actor": "admin@sentinel-x",   "action": "ADMIN_ACTION",      "target": "USER-004",        "severity": "LOW",      "ip": "192.168.1.12"},
    {"id": "AUD-008", "timestamp": "2026-09-15T08:00:00Z", "actor": "sayan@sentinel-x",   "action": "LOGIN",             "target": "SYSTEM",          "severity": "LOW",      "ip": "49.37.201.88"},
    {"id": "AUD-009", "timestamp": "2026-09-15T07:45:00Z", "actor": "ml-engine@sentinel-x","action": "MODEL_RETRAINED",  "target": "AML-MODEL-v3",    "severity": "LOW",      "ip": "10.0.0.2"},
    {"id": "AUD-010", "timestamp": "2026-09-15T07:30:00Z", "actor": "system@sentinel-x",  "action": "BATCH_PROCESSED",   "target": "BATCH-20260915",  "severity": "LOW",      "ip": "10.0.0.1"},
]

MOCK_USERS = [
    {"id": "USR-001", "name": "Sayan Bhattacharya", "email": "sayan@sentinel-x.io",  "role": "ADMIN",   "last_login": "2026-09-15T08:00:00Z", "status": "ACTIVE"},
    {"id": "USR-002", "name": "Priya Sharma",        "email": "priya@sentinel-x.io",  "role": "ANALYST", "last_login": "2026-09-15T07:45:00Z", "status": "ACTIVE"},
    {"id": "USR-003", "name": "Rahul Verma",         "email": "rahul@sentinel-x.io",  "role": "ANALYST", "last_login": "2026-09-14T23:12:00Z", "status": "ACTIVE"},
    {"id": "USR-004", "name": "Ananya Iyer",         "email": "ananya@sentinel-x.io", "role": "VIEWER",  "last_login": "2026-09-14T18:30:00Z", "status": "SUSPENDED"},
    {"id": "USR-005", "name": "Karan Mehta",         "email": "karan@sentinel-x.io",  "role": "ADMIN",   "last_login": "2026-09-15T09:00:00Z", "status": "ACTIVE"},
]


@app.get("/")
async def root():
    return {
        "name": "Sentinel-X API",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "endpoints": ["/health", "/api/stats", "/api/transactions", "/api/alerts", "/api/audit", "/api/users", "/api/network"],
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sentinel-x-api", "timestamp": datetime.utcnow().isoformat() + "Z"}


@app.get("/api/stats")
async def stats():
    return {
        "totalTransactions": 4291847,
        "threatsIntercepted": 12847,
        "activeNodes": 893,
        "riskScore": 94.2,
        "transactionsToday": 14823,
        "criticalAlerts": 2,
        "highAlerts": 3,
        "modelAccuracy": 99.7,
    }


@app.get("/api/transactions")
async def transactions(limit: int = 10, offset: int = 0):
    return {"total": 4291847, "limit": limit, "offset": offset, "data": MOCK_TRANSACTIONS[:limit]}


@app.get("/api/alerts")
async def alerts(status: str = "all"):
    data = MOCK_ALERTS if status == "all" else [a for a in MOCK_ALERTS if a["status"].upper() == status.upper()]
    return {"total": len(data), "data": data}


@app.get("/api/audit")
async def audit(limit: int = 20, offset: int = 0, severity: str = "all"):
    data = MOCK_AUDIT if severity == "all" else [a for a in MOCK_AUDIT if a["severity"].upper() == severity.upper()]
    return {"total": len(data), "limit": limit, "offset": offset, "data": data[offset:offset + limit]}


@app.get("/api/users")
async def users():
    return {"total": len(MOCK_USERS), "data": MOCK_USERS}


@app.get("/api/network")
async def network():
    risk_levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "CLEAR"]
    nodes = [
        {"id": f"NODE-{i:03d}", "risk": risk_levels[i % 5],
         "connections": (i * 3) % 12 + 1, "transactions": (i * 47) % 500 + 10}
        for i in range(1, 16)
    ]
    return {"nodeCount": 893, "activeEdges": 2341, "nodes": nodes}


@app.get("/api/auth/session")
async def session():
    return {
        "user": {"id": "USR-001", "name": "Sayan Bhattacharya", "email": "sayan@sentinel-x.io", "role": "ADMIN"},
        "authenticated": True,
    }
