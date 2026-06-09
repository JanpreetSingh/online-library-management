# Claude Code SDLC Agents

This directory contains Claude Code agent definitions for the Online Library Management SDLC workflow.

## Orchestrator Agent

- **orchestrator-sdlc.md** - Master SDLC orchestration agent that drives the full development workflow from requirements to PR creation

## SDLC Workflow Agents

The orchestrator coordinates these specialized agents in sequence:

1. **requirements-assistant.md** - Refine user stories into complete REQUIREMENTS.md with acceptance criteria
2. **architecture-design.md** - Create architecture overview and API contract in ARCHITECTURE.md
3. **design-review.md** - Conduct structured design review with formal gate (approve/block)
4. **implementation-planning.md** - Break architecture into prioritized, dependency-ordered task list
5. **implementation.md** - Implement all tasks sequentially (backend, frontend, tests)
6. **code-review-assistant.md** - Review git diff with 7-area checklist, produce structured review
7. **verify-test.md** - Write and execute Playwright E2E tests, verify deployment, generate report
8. **pr-creator.md** - Generate PR description, update changelog, create PR via GitHub CLI

## Usage

### Start the full SDLC workflow

```bash
# From Claude Code prompt
@orchestrator-sdlc LIB-45
```

This will guide you through all 8 steps with human review gates between each step.

### Run individual agents

Each agent can also be invoked independently:

```bash
@requirements-assistant LIB-45
@architecture-design
@design-review
@implementation-planning
@implementation
@code-review-assistant
@verify-test
@pr-creator
```

## Workflow Flow

```
User Story (Jira)
    ↓
┌───────────────────────────────────────────────┐
│  STEP 1: Refine Requirements                  │ ← requirements-assistant
│  Output: REQUIREMENTS.md                      │
└───────────────────────────────────────────────┘
    ↓ (human review gate)
┌───────────────────────────────────────────────┐
│  STEP 2: Architecture Design                  │ ← architecture-design
│  Output: ARCHITECTURE.md                      │
└───────────────────────────────────────────────┘
    ↓ (human review gate)
┌───────────────────────────────────────────────┐
│  STEP 3: Design Review                        │ ← design-review
│  Output: design-review.md (✅/❌ gate)        │
└───────────────────────────────────────────────┘
    ↓ (human review gate, must be ✅)
┌───────────────────────────────────────────────┐
│  STEP 4: Implementation Planning              │ ← implementation-planning
│  Output: implementation-plan.md               │
└───────────────────────────────────────────────┘
    ↓ (human review gate)
┌───────────────────────────────────────────────┐
│  STEP 5: Implementation                       │ ← implementation
│  Output: Code changes (git diff)              │
└───────────────────────────────────────────────┘
    ↓ (human review gate)
┌───────────────────────────────────────────────┐
│  STEP 6: Code Review                          │ ← code-review-assistant
│  Output: code-review.md (✅/❌ gate)          │
└───────────────────────────────────────────────┘
    ↓ (human review gate, must be ✅)
┌───────────────────────────────────────────────┐
│  STEP 7: Verify & Test                        │ ← verify-test
│  Output: verify-test-result.md (✅/❌)        │
└───────────────────────────────────────────────┘
    ↓ (human review gate, must be ✅ PASSED)
┌───────────────────────────────────────────────┐
│  STEP 8: PR Creation                          │ ← pr-creator
│  Output: Pull Request + CHANGELOG.md          │
└───────────────────────────────────────────────┘
    ↓
Pull Request Ready for Merge
```

## Human Review Gates

Every step ends with a human review gate where the user must:
- Review the output (REQUIREMENTS.md, ARCHITECTURE.md, code changes, test results, etc.)
- Provide explicit approval ('approve', 'continue') to proceed
- Request changes if needed

This ensures:
- Quality control at each stage
- Alignment with business requirements
- Opportunity to catch issues early
- Human oversight of automated processes

## Key Features

### Comprehensive Coverage
- Full-stack implementation (FastAPI backend + React frontend)
- Database design and migrations
- Authentication and authorization
- Unit tests (pytest) and E2E tests (Playwright)
- Code review and design review with formal gates
- PR generation with structured description

### Quality Gates
- Design review with 7-area checklist (completeness, correctness, security, etc.)
- Code review with 7-area checklist (correctness, security, error handling, etc.)
- Test verification with thresholds (unit tests ≥ 90%, E2E tests ≥ 80%)

### Best Practices
- Dependency-ordered task execution
- Surgical edits (no wholesale rewrites)
- Git-based workflow (no premature commits)
- Clear error handling and fallbacks
- Structured documentation

## Technology Stack

These agents are designed for:
- **Backend**: Python FastAPI, SQLAlchemy, Pydantic v2, pytest
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Database**: PostgreSQL
- **Auth**: JWT (python-jose)
- **Testing**: pytest (unit), Playwright (E2E)
- **Version Control**: Git, GitHub CLI

## Artifacts Generated

Each workflow run produces:
- `REQUIREMENTS.md` - Functional and non-functional requirements
- `ARCHITECTURE.md` - System architecture and API contract
- `design-review.md` - Design review findings and gate decision
- `implementation-plan.md` - Prioritized task list with dependencies
- `code-review.md` - Code review findings and gate decision
- `unit-tests-results.md` - Unit test execution results
- `verify-test-result.md` - Combined unit + E2E test verification
- `tests/e2e/<feature>.spec.ts` - Playwright E2E test specs
- `CHANGELOG.md` - Release notes entry
- Pull Request with 5-section structured description

## Migration from .github/agents

These Claude Code agents are direct ports from the `.github/agents/` directory, adapted to use:
- Claude Code tool syntax (Agent, Read, Write, Edit, Bash, Glob, Grep, TaskCreate, TaskUpdate, AskUserQuestion)
- Agent tool for spawning subagents instead of direct tool declarations
- TaskCreate/TaskUpdate for workflow tracking
- AskUserQuestion for human review gates
- Native Claude Code features (no external MCP dependencies required, though Jira/Confluence MCP tools can be used if available)

## Comparison with Original Framework

| Aspect | Original (.github/agents) | Claude Code (.claude/agents) |
|--------|---------------------------|------------------------------|
| Agent invocation | Custom framework | Agent tool with subagent_type |
| Task tracking | Custom todo tool | TaskCreate/TaskUpdate |
| User questions | Custom inputs | AskUserQuestion |
| File operations | Custom tools | Read, Write, Edit |
| Code search | Custom tools | Glob, Grep |
| Shell commands | execute | Bash |
| MCP tools | atlassian/*, github/*, playwright/* | Same (optional) |
| Workflow orchestration | Custom agent orchestration | Agent tool spawning |
