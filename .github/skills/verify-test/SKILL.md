---
name: verify-test
description: 'Create Playwright E2E automation test scripts for features in the Online Library Management app. Use when writing Playwright tests, automating browser scenarios, creating spec files, running tests, or generating HTML test reports. Triggers on: playwright, e2e, automation, test script, spec, browser test, test report.'
argument-hint: 'Requirement ID or feature name to create Playwright tests for'
---

# Skill: Verify & Test (Playwright E2E Automation)

## When to Use
- Writing Playwright test specs after a feature is implemented
- Using Playwright MCP to inspect live app before writing assertions
- Executing tests and generating the HTML report

## Pre-conditions
- The app is running: frontend on `http://localhost:3000`, backend on `http://localhost:8000`
- Feature has been implemented and code review has been approved
- Acceptance criteria for the user story are available (use each criterion as a test scenario)
- Backend unit tests pass (`python -m pytest backend/tests/ -v`)

## Procedure

### 1. Run Unit Tests
Before writing any E2E specs, run the backend unit tests:
```bash
cd backend && python -m pytest tests/ -v
```
Capture the full output and write a summary to `unit-tests-results.md` at the project root:

```markdown
# Unit Test Results

**Date**: <ISO date>
**Command**: `cd backend && python -m pytest tests/ -v`

## Summary
| Metric | Value |
|--------|-------|
| Total  | N     |
| Passed | P     |
| Failed | F     |
| Errors | E     |

## Details
<full pytest output>
```

Always continue to Step 2 regardless of pass/fail — failures are recorded in the report and surfaced in the final summary.

### 2. Inspect the Running App (Playwright MCP)
Use `playwright/*` MCP tools to:
- Navigate to the relevant page
- Take screenshots to observe actual UI elements, selectors, and flows
- Note exact element text, `data-testid` attributes, aria labels, or input names

### 3. Map Acceptance Criteria → Spec Structure
Each acceptance criterion from the user story becomes one `test()` block. Group by feature in one `.spec.ts` file:
```
tests/e2e/<feature-name>.spec.ts
```

### 4. Write the Spec File

**Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('<Feature Name>', () => {
  test.beforeEach(async ({ page }) => {
    // Log in if required
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL ?? 'admin@library.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD ?? 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AC-NNN: <acceptance criterion short title>', async ({ page }) => {
    // Arrange
    await page.goto('/<route>');
    // Act
    await page.click('...');
    // Assert
    await expect(page.locator('...')).toBeVisible();
  });
});
```

### 5. Rules
- Use `data-testid` selectors where available; fall back to `role` or `label` selectors
- Never use hard-coded `page.waitForTimeout()` — use `expect(...).toBeVisible()` instead
- Credentials go in environment variables, never hardcoded
- One `.spec.ts` file per feature/requirement

### 6. Execute Tests
```bash
npx playwright test tests/e2e/<feature-name>.spec.ts
```

### 7. Generate & Verify HTML Report
```bash
npx playwright show-report
```
Confirm `playwright-report/index.html` was created and all tests pass (or report failures clearly).

### 8. Write Verification Report
Create `verify-test-result.md` at the project root combining both results.

**Thresholds:**
- Unit tests pass % **≥ 90%** → PASS; below 90% → FAIL
- E2E tests pass % **≥ 80%** → PASS; below 80% → FAIL

Verification is **PASSED** only when both thresholds are met.

Template:
```markdown
# Verification Report

**Date**: <ISO date>
**Feature**: <feature name / requirement ID>

---

## Unit Test Results

| Metric | Value |
|--------|-------|
| Total  | N     |
| Passed | P     |
| Failed | F     |
| Pass % | XX.X% |
| Threshold | ≥ 90% |
| Status | ✅ PASS / ❌ FAIL |

<details>
<summary>Full pytest output</summary>

```
<pytest output>
```

</details>

---

## E2E Test Results

| Metric | Value |
|--------|-------|
| Total  | N     |
| Passed | P     |
| Failed | F     |
| Pass % | XX.X% |
| Threshold | ≥ 80% |
| Status | ✅ PASS / ❌ FAIL |

### Breakdown
| Suite | Passed | Failed |
|-------|--------|--------|
| UI Tests | P | F |
| API Tests | P | F |

---

## Verdict

> **Verification: ✅ PASSED / ❌ FAILED**

| Check | Result |
|-------|--------|
| Unit tests ≥ 90% | ✅ / ❌ |
| E2E tests ≥ 80% | ✅ / ❌ |

<If FAILED, list which threshold(s) were not met and recommended action.>
```

## Reference Files
- [Playwright config](../../playwright.config.ts)
