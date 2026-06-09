---
name: run-tests
description: 'Run backend unit tests and report results. Returns pass/fail summary with test output.'
---

Run backend unit tests with pytest and provide a clean summary.

## Execution

1. Run pytest:
```bash
cd backend && python -m pytest tests/ -v
```

2. Parse output and report:
```
Tests: X passed, Y failed, Z total
Duration: N seconds

[If failures] Failed tests:
- test_name: error message

[Full output available for review]
```

## Output Format

```
✅ Tests passed: X/Z (XX.X%)
⏱️  Duration: N.Ns

[If < 90%] ⚠️  Below 90% threshold
```

Use this skill before creating PRs or after code changes.
