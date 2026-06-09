---
name: verify-test
description: 'Write Playwright E2E test specs (UI and API), verify deployment, execute tests. Output: verify-test-result.md with ✅ PASSED or ❌ FAILED verdict'
user-invocable: true
---

Verify deployment, write comprehensive E2E tests (UI and API), execute them, and report results.

## Memory References (Automatic)

**This agent uses**:
- **testing-standards.md** - Thresholds: Unit ≥90%, E2E ≥80%
- **tech-stack-reference.md** - Ports (Frontend: 3000, Backend: 8000)

Memory provides context on WHY these thresholds exist.

## Process Overview

### Step 1: Run Unit Tests

Use the run-tests skill:

```javascript
Skill({
  skill: "run-tests"
})
```

This executes: `cd backend && python -m pytest tests/ -v`

**Create unit-tests-results.md**:

```javascript
Write({
  file_path: "/absolute/path/to/unit-tests-results.md",
  content: `
# Unit Test Results

**Date**: ${DATE}
**Command**: cd backend && python -m pytest tests/ -v

## Summary
| Metric | Value |
|--------|-------|
| Total  | ${N} |
| Passed | ${P} |
| Failed | ${F} |
| Pass % | ${PASS_PCT}% |

## Details
${PYTEST_OUTPUT}
`
})
```

**Continue regardless** of pass/fail - record and move to Step 2.

### Step 2: Verify Deployment

Use the check-deployment skill:

```javascript
Skill({
  skill: "check-deployment"
})
```

This checks:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

**If services DOWN**:

```javascript
AskUserQuestion({
  questions: [{
    question: "Services not running. Start with docker-compose?",
    header: "Deployment",
    options: [
      { label: "Yes", description: "Run docker-compose up -d" },
      { label: "Manual", description: "I'll start them manually" }
    ]
  }]
});

// If yes:
Bash({
  command: "docker-compose up -d",
  description: "Start services"
});

// Wait for services:
Bash({
  command: "timeout 90 bash -c 'until [ \"$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:8000/docs)\" = \"200\" ] && [ \"$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000)\" = \"200\" ]; do sleep 3; done'",
  description: "Wait for services to be ready"
});
```

### Step 3: Map Test Scenarios

Use Read to load REQUIREMENTS.md:

```javascript
Read("REQUIREMENTS.md");
```

Extract acceptance criteria and create test scenarios:
- **Positive tests**: Happy path (one per AC)
- **Negative tests**: Error cases, validation, unauthorized access

### Step 4: Write E2E Tests

Create `tests/e2e/<feature-name>.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name - UI Tests', () => {
  test('positive: successful workflow', async ({ page }) => {
    await page.goto('http://localhost:3000/feature');
    // Test implementation
  });
  
  test('negative: validation error', async ({ page }) => {
    // Test implementation
  });
});

test.describe('Feature Name - API Tests', () => {
  test('positive: 200 for valid request', async ({ request }) => {
    const response = await request.post('http://localhost:8000/api/endpoint', {
      data: { field: 'value' }
    });
    expect(response.status()).toBe(200);
  });
  
  test('negative: 400 for invalid payload', async ({ request }) => {
    // Test implementation
  });
});
```

### Step 5: Execute E2E Tests

```javascript
Bash({
  command: "npx playwright test tests/e2e/<feature-name>.spec.ts",
  description: "Run E2E tests"
});
```

Capture pass/fail counts.

### Step 6: Generate HTML Report

```javascript
Bash({
  command: "npx playwright show-report",
  description: "Open Playwright HTML report"
});
```

Report saved to: `playwright-report/index.html`

### Step 7: Apply Thresholds (from Memory)

**Memory provides** (testing-standards.md):
- Unit tests: ≥ 90% required
- E2E tests: ≥ 80% required

**Calculate**:
```javascript
const unitPassPct = (unitPassed / unitTotal) * 100;
const e2ePassPct = (e2ePassed / e2eTotal) * 100;

const unitStatus = unitPassPct >= 90 ? '✅ PASS' : '❌ FAIL';
const e2eStatus = e2ePassPct >= 80 ? '✅ PASS' : '❌ FAIL';

const verdict = (unitPassPct >= 90 && e2ePassPct >= 80) ? '✅ PASSED' : '❌ FAILED';
```

### Step 8: Write Verification Report

Use Write to create `verify-test-result.md`:

```javascript
Write({
  file_path: "/absolute/path/to/verify-test-result.md",
  content: `
# Verification Report

**Date**: ${DATE}
**Feature**: ${FEATURE}

---

## Unit Test Results

| Metric | Value |
|--------|-------|
| Total  | ${unitTotal} |
| Passed | ${unitPassed} |
| Failed | ${unitFailed} |
| Pass % | ${unitPassPct}% |
| Threshold | ≥ 90% |
| Status | ${unitStatus} |

---

## E2E Test Results

| Metric | Value |
|--------|-------|
| Total  | ${e2eTotal} |
| Passed | ${e2ePassed} |
| Failed | ${e2eFailed} |
| Pass % | ${e2ePassPct}% |
| Threshold | ≥ 80% |
| Status | ${e2eStatus} |

### Breakdown
| Suite | Passed | Failed |
|-------|--------|--------|
| UI Tests | ${uiPassed} | ${uiFailed} |
| API Tests | ${apiPassed} | ${apiFailed} |

---

## Verdict

> **Verification: ${verdict}**

| Check | Result |
|-------|--------|
| Unit tests ≥ 90% | ${unitStatus} |
| E2E tests ≥ 80% | ${e2eStatus} |

${verdict === '❌ FAILED' ? 
  'Thresholds not met. Fix failing tests before creating PR.' : 
  'All thresholds met. Ready for PR creation.'}
`
})
```

### Step 9: Report to User

```
✅ Unit Tests: ${unitPassed} passed, ${unitFailed} failed — unit-tests-results.md

✅ Pre-Check: Application deployment verified
   - Frontend: http://localhost:3000 (running)
   - Backend: http://localhost:8000 (running)

Tests executed: ${total} total
  UI Tests:
    ✅ Passed: ${uiPassed}
    ❌ Failed: ${uiFailed}
  API Tests:
    ✅ Passed: ${apiPassed}
    ❌ Failed: ${apiFailed}

Report: playwright-report/index.html

─── Verification Report: verify-test-result.md ───
Unit tests:  ${unitPassPct}% (≥ 90%) — ${unitStatus}
E2E tests:   ${e2ePassPct}% (≥ 80%) — ${e2eStatus}

Verification: ${verdict}

${verdict === '✅ PASSED' ? 
  'Next: @pr-creator' : 
  'Fix failures, then re-run: @verify-test'}
```

## Skills Used

- **`/run-tests`** - Execute pytest, return summary
- **`/check-deployment`** - Verify services running

Both skills handle the execution and return clean summaries.

## Tool Usage

- **Skill** - run-tests, check-deployment (skills handle complexity)
- **Read** - Load REQUIREMENTS.md for ACs
- **Write** - Create test files, unit-tests-results.md, verify-test-result.md
- **Bash** - docker-compose, playwright commands
- **AskUserQuestion** - Deploy confirmation
- **Memory** (automatic) - Test thresholds, port config

## Memory Context

**Why thresholds exist** (from memory):
> Previous production incidents caused by insufficient test coverage.
> 90% unit / 80% E2E thresholds ensure quality before merge.

Agent applies these thresholds and explains WHY when reporting results.

## Error Handling

| Issue | Response |
|-------|----------|
| Services won't start | Report docker logs, suggest troubleshooting |
| Tests fail | Record in report, show ❌ FAILED verdict, don't block reporting |
| Playwright not installed | Suggest: `npm install -D @playwright/test` |
| Below thresholds | Report ❌ FAILED, list which threshold(s) failed |
