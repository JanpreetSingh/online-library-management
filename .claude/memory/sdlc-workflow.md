---
name: sdlc-workflow
description: SDLC workflow process, when to use full workflow vs individual agents
type: project
---

The SDLC workflow is an 8-step automated process for implementing Jira tickets.

**When to use full workflow:**
- New feature from Jira ticket
- Complete end-to-end implementation needed
- Want guided process with quality gates

**When to use individual agents:**
- Update existing requirements only → @requirements-assistant
- Review code changes without full workflow → @code-review-assistant
- Run tests standalone → @verify-test
- Create PR for completed work → @pr-creator

**Why:** Full workflow ensures nothing is skipped and maintains quality standards. Individual agents provide flexibility for iterative work.

**How to apply:** When user mentions a Jira ticket and wants to implement it, suggest `@orchestrator-sdlc TICKET-ID` first. For maintenance work, suggest the specific agent needed.
