# Sentinel-X System Architecture

## Overview

Sentinel-X is an AI-powered transaction forensics platform designed for institutional finance. The system leverages Graph Neural Networks (GNNs) to detect anomalous transaction patterns in real-time, providing financial institutions with advanced fraud detection capabilities.

## High-Level Architecture

The platform follows a microservices-inspired architecture with three primary layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│              Dashboard / Alerts / Analytics                  │
├─────────────────────────────────────────────────────────────┤
│                   API Gateway (FastAPI)                      │
│          REST Endpoints / WebSocket / Auth                   │
├─────────────────────────────────────────────────────────────┤
│                  ML Engine (PyTorch)                         │
│         GNN Model / Feature Engineering / Inference          │
├─────────────────────────────────────────────────────────────┤
│              Data Layer (PostgreSQL + Redis)                 │
│         Transaction Store / Cache / Session                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend — Next.js 14

The frontend is built with Next.js 14 using the App Router. Key features:

- **Dashboard**: Real-time transaction monitoring with WebSocket updates
- **Alert System**: Tiered alerts (CRITICAL, HIGH, MEDIUM, LOW) with color coding
- **Node Topology View**: Interactive graph visualization of transaction networks using D3.js
- **Analytics Panel**: Historical trend analysis and model performance metrics

Tech stack: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, D3.js, Recharts

### 2. Backend — FastAPI

The backend serves as the API gateway and orchestration layer:

- **Transaction Ingestion**: Batch and streaming endpoints for transaction data
- **Model Serving**: Inference endpoint that wraps the GNN model
- **Alert Management**: CRUD operations for alerts with escalation workflows
- **Authentication**: JWT-based auth with role-based access control (RBAC)
- **WebSocket Server**: Real-time push notifications for new alerts

Key endpoints:
- `POST /api/v1/transactions/analyze` — Submit transactions for analysis
- `GET /api/v1/alerts` — Retrieve active alerts with filtering
- `WS /api/v1/ws/alerts` — WebSocket stream for real-time alerts
- `GET /api/v1/topology` — Get node relationship graph data

### 3. ML Engine — GNN Model

The core detection engine uses a Graph Neural Network architecture:

- **Model Type**: Graph Attention Network (GAT) with multi-head attention
- **Input Features**: Transaction amount, timestamp, account age, frequency metrics, geolocation
- **Graph Construction**: Accounts are nodes, transactions are edges. Edge features include amount, time delta, and transaction type.
- **Output**: Anomaly score (0-1) per transaction, with threshold-based classification

Training pipeline:
1. Feature engineering from raw transaction data
2. Graph construction using account-transaction relationships
3. GAT model training with labeled fraud/non-fraud data
4. Hyperparameter tuning via Optuna
5. Model validation on held-out test set with precision/recall optimization

### 4. Node Topology

The topology engine maps the transaction network:

- **Node Types**: Individual accounts, merchant accounts, intermediary entities
- **Edge Types**: Direct transfer, payment, withdrawal, deposit
- **Community Detection**: Louvain algorithm for identifying suspicious clusters
- **Centrality Analysis**: PageRank and betweenness centrality for identifying key nodes

### 5. Data Layer

- **PostgreSQL**: Primary store for transactions, accounts, alerts, and user data
- **Redis**: Caching layer for model predictions, session management, and rate limiting
- **Data Pipeline**: Periodic ETL for feature computation and model retraining

## Deployment Architecture

- **Frontend**: Deployed on Vercel (https://sentinel-x-alpha-puce.vercel.app)
- **Backend**: Containerized with Docker, deployed on cloud infrastructure
- **ML Model**: Served via TorchServe with GPU acceleration
- **Database**: Managed PostgreSQL with read replicas for analytics queries

## Security Considerations

- All API endpoints require authentication via JWT tokens
- Transaction data is encrypted at rest (AES-256) and in transit (TLS 1.3)
- RBAC with four roles: Admin, Analyst, Viewer, API Consumer
- Audit logging for all alert actions and model predictions
- Rate limiting on all public-facing endpoints

## Performance Targets

| Metric | Target |
|--------|--------|
| Inference latency (p95) | < 100ms |
| Alert delivery time | < 2 seconds |
| Dashboard load time | < 1.5 seconds |
| Model accuracy (F1) | > 0.94 |
| False positive rate | < 3% |

## Future Roadmap

- Real-time streaming with Apache Kafka
- Explainable AI (XAI) module for alert justification
- Multi-model ensemble (GNN + Transformer + Isolation Forest)
- Federated learning for cross-institution training
- Compliance reporting module (SAR generation)
