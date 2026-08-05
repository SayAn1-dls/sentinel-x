# CONTRIBUTING TO SENTINEL-X

## Code Standards

- **TypeScript strict mode** — no `as any`, no `@ts-ignore`
- **Component naming** — PascalCase for components, camelCase for hooks/utils
- **Commit format** — `type(scope): description` (feat, fix, refactor, style, test, docs, chore)
- **No hardcoded secrets** — all sensitive config via environment variables

## Branch Strategy

```
main          → Production / stable
feature/*     → Feature development
fix/*         → Bug fixes
refactor/*    → Code improvements
```

## Component Guidelines

### Silicon UI
All panels use `SiliconCard` or `GlassPanel` with 60px backdropFilter.

```tsx
import { SiliconCard } from '@/components/ui/SiliconCard';
<SiliconCard glow="orange">...</SiliconCard>
```

### Color System
Always reference from `@/lib/constants`:
```typescript
import { THREAT_COLORS } from '@/lib/constants';
const color = THREAT_COLORS['CRITICAL']; // '#FF0033'
```

## Testing

```bash
npm test                 # run all tests
npm test -- --coverage   # with coverage report
```

Tests live in `src/__tests__/` and must cover:
- Happy path
- Edge cases
- Error states

## Forensic Engine

When modifying `ForensicEngine`, update rule weights in `computeRiskScore()` and add corresponding tests.

---

*SENTINEL-X · CLASSIFIED · INTERNAL*
