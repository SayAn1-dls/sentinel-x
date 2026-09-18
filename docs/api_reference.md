# Sentinel-X API Reference

Base URL: https://sentinel-x-api-8l03.onrender.com

## GET /api/stats
Returns system-wide statistics including total transactions, model accuracy, active nodes, and graph edges.

## GET /api/transactions
Returns recent transaction feed. Query params: limit, risk_level.

## GET /api/nodes
Returns all active nodes in the fraud detection graph.

## POST /api/nodes/isolate
Isolates a suspicious node. Body: node_id, reason, severity.

## GET /api/alerts
Returns active alert queue sorted by severity.
