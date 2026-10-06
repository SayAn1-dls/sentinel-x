# Testing Strategy

## Unit Tests
- BiometricEngine scoring logic
- Session token generation/validation
- Audit log formatting
- Tools: Jest, ts-jest

## Integration Tests
- Auth flow: OAuth → session exchange → cookie set
- MongoDB CRUD for users, sessions, audit logs
- Tools: Supertest + Jest

## E2E Tests
- Login → Dashboard load → Alert drill-down
- Tools: Playwright

## Coverage Targets
- Unit: 75%+
- Auth flow: 100%
- Forensic engine: 90%+
