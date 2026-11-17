# Testing Strategy

Sentinel-X has two test stacks, both enforced by CI on every push to
`main`/`dev` and every pull request to `main`
(`.github/workflows/ci.yml`).

## Python detection engine and backend (pytest)

The largest test investment in the repo: ~500 tests covering the
detection modules, shared utilities, and the FastAPI service.

- `tests/` - one suite per module in `src/modules/` and `src/utils/`
  (detection, alert pipeline, threat graph, session risk, event bus,
  rate limiter, notification, audit, metrics, crypto, and more).
- `backend/tests/` - FastAPI endpoint contract tests via
  `fastapi.testclient.TestClient` (`test_server_api.py`) plus unit
  suites for `backend/utils/`. `backend_test.py` is an opt-in live
  integration test that stays skipped unless `REACT_APP_BACKEND_URL`
  points at a running deployment.

Conventions:

- Contract-first: tests are written against documented behavior
  (docstrings, endpoint contracts), not the current implementation.
- Every bug fix lands with a regression test verified to fail
  against the pre-fix code.
- Live-service tests are never required for a green run; anything
  needing a deployed backend is skipped without its env var.

Run locally:

```bash
pip install -r backend/requirements.txt pytest
pytest tests/ backend/tests/ -q     # 498 passed, 1 skipped
```

CI runs flake8 (non-blocking) and the full pytest suite on
Python 3.11.

## Frontend (Jest)

- Jest + `next/jest`, jsdom environment, V8 coverage
  (`frontend/jest.config.ts`).
- Suites live in `frontend/src/__tests__/` and cover the scoring
  engine, audit trace, network security, AI scanner, and shared
  utilities.

Run locally:

```bash
cd frontend && npx jest
```

CI runs `npm ci` and `npm run build` on Node 24.22.1, so TypeScript
and build errors fail the pipeline.

## Adding a test

- New Python module: create `tests/test_<module>.py`; new backend
  endpoint: extend `backend/tests/test_server_api.py`.
- Keep tests deterministic - no wall-clock sleeps, no network.
- For timestamp or ordering logic, pass explicit `ts` values instead
  of relying on `time.time()`.
