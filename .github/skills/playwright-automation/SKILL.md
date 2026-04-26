---
name: playwright-automation
description: 'Create Playwright E2E automation test scripts for features in the Online Library Management app. Use when writing Playwright tests, automating browser scenarios, creating spec files, running tests, or generating HTML test reports. Triggers on: playwright, e2e, automation, test script, spec, browser test, test report.'
argument-hint: 'Requirement ID or feature name to create Playwright tests for'
---

# Skill: Playwright E2E Automation

## When to Use
- Writing Playwright test specs after a feature is implemented
- Using Playwright MCP to inspect live app before writing assertions
- Executing tests and generating the HTML report

## Pre-conditions
- The app is running: frontend on `http://localhost:3000`, backend on `http://localhost:8000`
- Feature has been implemented and manually verified
- Jira test cases exist for the requirement (use their steps as a basis)

## Procedure

### 1. Inspect the Running App (Playwright MCP)
Use `playwright/*` MCP tools to:
- Navigate to the relevant page
- Take screenshots to observe actual UI elements, selectors, and flows
- Note exact element text, `data-testid` attributes, aria labels, or input names

### 2. Map Jira Test Cases → Spec Structure
Each Jira test case becomes one `test()` block. Group by feature in one `.spec.ts` file:
```
tests/e2e/<feature-name>.spec.ts
```

### 3. Write the Spec File

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

  test('TC-NNN: <test case title>', async ({ page }) => {
    // Arrange
    await page.goto('/<route>');
    // Act
    await page.click('...');
    // Assert
    await expect(page.locator('...')).toBeVisible();
  });
});
```

### 4. Rules
- Use `data-testid` selectors where available; fall back to `role` or `label` selectors
- Never use hard-coded `page.waitForTimeout()` — use `expect(...).toBeVisible()` instead
- Credentials go in environment variables, never hardcoded
- One `.spec.ts` file per feature/requirement

### 5. Execute Tests
```bash
npx playwright test tests/e2e/<feature-name>.spec.ts
```

### 6. Generate & Verify HTML Report
```bash
npx playwright show-report
```
Confirm `playwright-report/index.html` was created and all tests pass (or report failures clearly).

## Reference Files
- [Playwright config](../../playwright.config.ts)
