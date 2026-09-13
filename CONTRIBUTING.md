# Contributing to Sentinel-X

Thank you for considering contributing to Sentinel-X — a real-time financial threat detection system. This document outlines the process and standards for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Standards](#testing-standards)
- [Security Reporting](#security-reporting)

---

## Code of Conduct

All contributors are expected to uphold a professional, respectful, and constructive environment. Harassment, discrimination, or bad-faith contributions will not be tolerated.

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/sentinel-x.git`
3. Add the upstream remote: `git remote add upstream https://github.com/SayAn1-dls/sentinel-x.git`
4. Create a feature branch: `git checkout -b feat/your-feature-name`

---

## Development Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 20.x |
| Python | >= 3.12 |
| MongoDB | >= 7.0 |
| pnpm | >= 9.x |

### Frontend (Next.js 15)

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:3000`

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend API runs at `http://localhost:8000`

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/sentinel
JWT_SECRET=<your-secret>
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=Sentinel-X
```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only |
| `develop` | Integration branch for features |
| `feat/<name>` | New feature development |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation updates |
| `refactor/<name>` | Code refactoring without behavior change }

---

## Commit Guidelines

Sentinel-X follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change without feature/fix |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process or tooling changes |

**Examples:**

```
feat(auth): add passkey registration endpoint
fix(ml): correct isolation forest threshold for high-volume nodes
docs(api): add WebSocket streaming endpoint documentation
perf(graph): optimize entity clustering with spatial indexing
```

---

## Pull Request Process

1. Ensure your branch is up to date with `upstream/develop`
2. Run all tests: `pnpm test` (frontend) and `pytest` (backend)
3. Open a PR against `develop`, never directly to `main`
4. Fill in the PR template completely
5. Request review from at least one maintainer
6. Squash commits before merge

### PR Title Format

```
feat(scope): concise description of change
```

---

## Testing Standards

### Frontend

- Unit tests with Vitest
- Component tests with Testing Library
- Coverage threshold: **80%** minimum

```bash
cd frontend
pnpm test
pnpm test:coverage
```

### Backend

- Unit tests with pytest
- Integration tests for all API endpoints
- Coverage threshold: **85%** minimum

```bash
cd backend
pytest --cov=app --cov-report=term-missing
```

### ML Pipeline

- Validate model accuracy on the test dataset before merging any ML changes
- Run `python scripts/validate_model.py` to confirm F1 score stays above **0.92**

---

## Security Reporting

Do **not** open a public GitHub issue for security vulnerabilities. See [SECURITY.md](./SECURITY.md) for responsible disclosure procedures.

---

## Questions?

Open a Discussion on GitHub or reach out via the project's contact listed in the README.

Built with 🔴 by Sayan Bhattacharya
