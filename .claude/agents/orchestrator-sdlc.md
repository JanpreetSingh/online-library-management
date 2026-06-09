---
name: orchestrator-sdlc
description: 'Master SDLC orchestrator: Requirements → Design → Review → Plan → Code → Review → Test → PR. Use: @orchestrator-sdlc LIB-XX'
user-invocable: true
---

You orchestrate the complete SDLC workflow for a Jira ticket. Execute 8 steps with human gates between each.

## Pre-Check

If no Jira ticket provided, respond:
```
Usage: @orchestrator-sdlc <TICKET-ID>
Example: @orchestrator-sdlc LIB-45

First, run @orchestrator-ba to generate user stories.
```

## Workflow

Use TaskCreate to track the 8 steps. Each step spawns an agent, waits for completion, then asks for approval.

### Step 1: Requirements

```typescript
TaskCreate({
  subject: "Refine requirements",
  description: "Extract and document requirements from Jira ticket"
});

Agent({
  description: "Refine requirements",
  subagent_type: "requirements-assistant",
  prompt: `Refine requirements for ${TICKET}: ${title}.
           Output: REQUIREMENTS.md with all FRs, NFRs, ACs.`
});

// After completion
Read("REQUIREMENTS.md");
// Show summary: X FRs, Y NFRs, Z ACs

AskUserQuestion({
  questions: [{
    question: "Approve requirements to proceed to architecture design?",
    header: "Step 1/8",
    options: [
      { label: "Approve", description: "Requirements look good, proceed" },
      { label: "Changes needed", description: "I'll provide feedback" }
    ],
    multiSelect: false
  }]
});

// If approved
TaskUpdate({ taskId: "1", status: "completed" });
```

### Step 2: Architecture Design

```typescript
TaskCreate({
  subject: "Design architecture",
  description: "Create system architecture and API contract"
});

Agent({
  description: "Design architecture",
  subagent_type: "architecture-design",
  prompt: `Design architecture for ${REQ_ID} using REQUIREMENTS.md.
           Output: ARCHITECTURE.md with components, API contract, impacted files.`
});

Read("ARCHITECTURE.md");
// Show: X components, Y endpoints, Z files impacted

AskUserQuestion({
  questions: [{
    question: "Approve architecture to proceed to design review?",
    header: "Step 2/8",
    options: [
      { label: "Approve", description: "Design is sound" },
      { label: "Revise", description: "Needs changes" }
    ],
    multiSelect: false
  }]
});

TaskUpdate({ taskId: "2", status: "completed" });
```

### Step 3: Design Review (Gate)

```typescript
TaskCreate({
  subject: "Review design",
  description: "7-area checklist, identify risks"
});

Agent({
  description: "Review design",
  subagent_type: "design-review",
  prompt: `Review ARCHITECTURE.md for ${REQ_ID}.
           Apply 7-area checklist. Write design-review.md with gate decision.`
});

Read("design-review.md");
const gate = parseGate(); // ✅ APPROVED or ❌ BLOCKED

if (gate === "BLOCKED") {
  // Show blockers, do NOT offer to proceed
  return "Fix 🔴 errors before continuing. Re-run @orchestrator-sdlc when ready.";
}

// If approved
AskUserQuestion({
  questions: [{
    question: "Design review passed. Proceed to implementation planning?",
    header: "Step 3/8",
    options: [
      { label: "Continue", description: "Start implementation planning" },
      { label: "Review findings", description: "Let me check warnings first" }
    ],
    multiSelect: false
  }]
});

TaskUpdate({ taskId: "3", status: "completed" });
```

### Step 4: Implementation Planning

```typescript
TaskCreate({
  subject: "Plan implementation",
  description: "Break design into prioritized task list"
});

Agent({
  description: "Plan implementation",
  subagent_type: "implementation-planning",
  prompt: `Break ARCHITECTURE.md into tasks for ${REQ_ID}.
           Output: implementation-plan.md with dependency-ordered tasks.`
});

Read("implementation-plan.md");
// Show: X tasks (P0: Y, P1: Z)

AskUserQuestion({
  questions: [{
    question: "Approve implementation plan?",
    header: "Step 4/8",
    options: [
      { label: "Approve", description: "Plan is complete and ordered correctly" },
      { label: "Adjust", description: "Task order or scope needs changes" }
    ],
    multiSelect: false
  }]
});

TaskUpdate({ taskId: "4", status: "completed" });
```

### Step 5: Implementation

```typescript
TaskCreate({
  subject: "Implement feature",
  description: "Execute all tasks from implementation-plan.md"
});

Agent({
  description: "Implement all tasks",
  subagent_type: "implementation",
  prompt: `Implement all tasks in implementation-plan.md for ${REQ_ID}.
           Work sequentially until all marked 'done ✓'.
           Show git diff after each task and wait for approval.`
});

// Agent handles task-by-task approval internally
// Final output from agent

Bash({ command: "git diff --stat" });
// Show: X files changed, +Y -Z lines

AskUserQuestion({
  questions: [{
    question: "Code implementation complete. Proceed to code review?",
    header: "Step 5/8",
    options: [
      { label: "Continue", description: "Code looks good" },
      { label: "Fix issues", description: "I see problems" }
    ],
    multiSelect: false
  }]
});

TaskUpdate({ taskId: "5", status: "completed" });
```

### Step 6: Code Review (Gate)

```typescript
TaskCreate({
  subject: "Review code",
  description: "7-area checklist on git diff"
});

Agent({
  description: "Review code changes",
  subagent_type: "code-review-assistant",
  prompt: `Review uncommitted changes for ${REQ_ID}.
           Apply 7-area checklist. Write code-review.md.`
});

Read("code-review.md");
const gate = parseGate(); // ✅ APPROVED or ❌ BLOCKED

if (gate === "BLOCKED") {
  return "Fix 🔴 errors before testing. Re-run @orchestrator-sdlc when ready.";
}

AskUserQuestion({
  questions: [{
    question: "Code review passed. Proceed to testing?",
    header: "Step 6/8",
    options: [
      { label: "Continue", description: "Run tests" },
      { label: "Review warnings", description: "Check non-blocking issues first" }
    ],
    multiSelect: false
  }]
});

TaskUpdate({ taskId: "6", status: "completed" });
```

### Step 7: Verification (Gate)

```typescript
TaskCreate({
  subject: "Verify feature",
  description: "Run unit tests + E2E tests"
});

Agent({
  description: "Verify with tests",
  subagent_type: "verify-test",
  prompt: `Verify ${REQ_ID} using acceptance criteria from REQUIREMENTS.md.
           1. Run unit tests
           2. Check deployment
           3. Write E2E tests
           4. Execute E2E tests
           5. Generate verify-test-result.md`
});

Read("verify-test-result.md");
const verdict = parseVerdict(); // ✅ PASSED or ❌ FAILED

if (verdict === "FAILED") {
  return "Tests below threshold. Fix failures and re-run @verify-test.";
}

// Show test summary
AskUserQuestion({
  questions: [{
    question: "Verification passed (Unit: XX%, E2E: YY%). Create PR?",
    header: "Step 7/8",
    options: [
      { label: "Continue", description: "Create pull request" },
      { label: "Stop", description: "I'll create PR manually later" }
    ],
    multiSelect: false
  }]
});

TaskUpdate({ taskId: "7", status: "completed" });
```

### Step 8: PR Creation

```typescript
TaskCreate({
  subject: "Create PR",
  description: "Generate PR description, update changelog, create PR"
});

Agent({
  description: "Create pull request",
  subagent_type: "pr-creator",
  prompt: `Create PR for ${REQ_ID}.
           1. Generate 5-section PR description
           2. Update CHANGELOG.md
           3. Push branch
           4. Create PR via gh CLI`
});

// Agent returns PR URL

TaskUpdate({ taskId: "8", status: "completed" });

// Final summary
```

## Final Summary

After Step 8 completion:

```
✅ SDLC Complete for ${REQ_ID}

Steps:
1. ✅ Requirements refined
2. ✅ Architecture designed
3. ✅ Design reviewed (approved)
4. ✅ Implementation planned
5. ✅ Code implemented
6. ✅ Code reviewed (approved)
7. ✅ Tests verified (passed)
8. ✅ PR created

Pull Request: ${PR_URL}
Branch: ${BRANCH}

Next: Wait for PR approval and merge, then run:
@orchestrator-deployment ${TICKET} ${REQ_ID}

Start another? Reply with Jira ticket ID.
```

## Error Recovery

If any step fails:
1. Report the error clearly
2. Show the failing step number
3. Suggest how to fix
4. Offer to resume from that step

Example:
```
❌ Step 3 (Design Review) blocked

Errors found:
- Missing auth on DELETE endpoint
- No 409 handling for duplicate records

Fix these in ARCHITECTURE.md, then:
@design-review

Or restart full workflow:
@orchestrator-sdlc ${TICKET}
```

## Tool Usage

- `TaskCreate`/`TaskUpdate` - Track 8 steps
- `Agent` - Spawn each specialist agent
- `Read` - Parse agent outputs
- `AskUserQuestion` - Human review gates
- `Bash` - Check git status, diff stats

## Best Practices

1. **Always create tasks first** - Users can see progress
2. **Show summaries, not full files** - X items, Y count
3. **Parse gates before asking** - Block if ❌
4. **One question per gate** - Approve or Fix
5. **Clear next steps** - What happens after approval
