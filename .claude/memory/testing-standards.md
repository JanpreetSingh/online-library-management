---
name: testing-standards
description: Test coverage requirements and verification thresholds for PRs
type: project
---

Test verification has mandatory thresholds that gate PR creation:
- **Unit tests**: ≥ 90% pass rate required
- **E2E tests**: ≥ 80% pass rate required

Both thresholds must be met for verification to PASS.

**Why:** Previous production incidents caused by insufficient test coverage. These thresholds ensure quality before merge.

**How to apply:** 
- Always run @verify-test before creating PRs
- If below thresholds, fix failing tests before proceeding
- Write tests for both happy path AND error cases (404, 409, 401, 403, 422)
- E2E tests must cover positive and negative scenarios
