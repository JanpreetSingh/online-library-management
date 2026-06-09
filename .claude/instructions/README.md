# Instructions Directory

This directory contains detailed step-by-step procedures for SDLC tasks. Instructions are referenced by agents but kept separate for reusability and maintainability.

---

## Instructions vs Memory vs Agents

| Type | Purpose | When to Use | Example |
|------|---------|-------------|---------|
| **Instructions** | Step-by-step procedures | How to execute a task | "Step 1: Read REQUIREMENTS.md..." |
| **Memory** | Persistent context | Why we do things this way | "Tests must be ≥90% because..." |
| **Agents** | Orchestration | Which instructions to follow | "Execute requirements-document.md instructions" |

---

## Available Instructions

### 1. **requirements-document.md**
**Used by**: `requirements-assistant` agent

**Purpose**: Generate complete REQUIREMENTS.md with testable acceptance criteria

**Contents**:
- Document structure template
- Writing guidelines (FRs, NFRs, ACs)
- Validation checklist
- Examples by feature type
- Anti-patterns to avoid

**When to reference**: When refining user stories into formal requirements

---

### 2. **architecture-design.md**
**Used by**: `architecture-design` agent

**Purpose**: Transform requirements into architecture with API contracts

**Contents**:
- 10-step design process
- Codebase scanning procedures
- API contract format
- Database design patterns
- Technology stack reference
- Best practices & common patterns

**When to reference**: When designing system architecture for a feature

---

### 3. **code-review-checklist.md**
**Used by**: `code-review-assistant` agent

**Purpose**: Systematic 7-area code review with severity levels

**Contents**:
- 7-area review framework
- Area-specific checklists
- Examples (good vs bad code)
- Severity definitions (error/warning/info)
- Findings table format
- Gate decision logic

**When to reference**: When reviewing code changes before testing

---

## How Agents Use Instructions

Agents reference instructions like this:

```markdown
---
name: requirements-assistant
description: 'Refine user stories into REQUIREMENTS.md'
---

Follow the procedure in `.claude/instructions/requirements-document.md`:

1. Read the instruction file to understand the process
2. Execute each step systematically
3. Use the templates and examples provided
4. Apply the validation checklist
5. Output: REQUIREMENTS.md
```

---

## Benefits of Separate Instructions

### 1. **Reusability**
Multiple agents can reference the same instructions:
- `requirements-assistant` uses `requirements-document.md`
- `architecture-design` references requirements structure
- `code-review-assistant` checks against requirements ACs

### 2. **Maintainability**
Update one instruction file → all agents benefit:
- Change requirements format? Update `requirements-document.md` once
- Tweak code review checklist? Update `code-review-checklist.md` once

### 3. **Clarity**
Agents stay concise, instructions stay detailed:
- Agent: "What to do" (orchestration logic)
- Instructions: "How to do it" (step-by-step procedure)

### 4. **Version Control**
Track changes to procedures over time:
- See when review criteria changed
- Understand why requirements format evolved
- Roll back if needed

---

## When to Create New Instructions

Create a new instruction file when:
- ✅ Procedure is complex (>5 steps)
- ✅ Multiple agents need the same procedure
- ✅ Process is standardized across features
- ✅ Steps need examples and templates

Don't create instruction files for:
- ❌ Simple 1-2 step operations (use skills instead)
- ❌ Agent-specific logic (keep in agent file)
- ❌ One-time procedures (not reusable)

---

## Instruction File Structure

All instruction files should follow this format:

```markdown
# Instructions: [Task Name]

**Purpose**: [One-line description]

---

## Process Overview

[Visual or bullet summary of steps]

---

## Step-by-Step Procedure

### Step 1: [Title]
[Detailed instructions]
[Examples]
[Checklist]

### Step 2: [Title]
[...]

---

## Best Practices

[Dos and don'ts]

---

## Common Patterns

[Reusable patterns for this task]

---

## Examples

[Concrete examples with good/bad comparisons]

---

## Validation Checklist

- [ ] Check 1
- [ ] Check 2

---

## Output Format

[Template for final output]
```

---

## Instruction Lifecycle

### 1. **Creation**
- Identify repeated or complex procedure
- Extract from agent into instruction file
- Add examples and checklists
- Update agent to reference instruction

### 2. **Refinement**
- Collect feedback from usage
- Add missing edge cases
- Improve examples
- Clarify ambiguous steps

### 3. **Evolution**
- Update when processes change
- Add new patterns as discovered
- Remove obsolete procedures
- Keep aligned with CLAUDE.md standards

---

## Instructions vs CLAUDE.md

| CLAUDE.md | Instructions |
|-----------|--------------|
| Project-wide standards | Task-specific procedures |
| Tech stack & conventions | Step-by-step processes |
| "What" and "why" | "How" with detailed steps |
| Always loaded | Loaded on-demand by agents |
| General guidance | Specific workflows |

**Example:**
- CLAUDE.md: "Use Pydantic v2 with ConfigDict"
- architecture-design.md: "Step 6: Define API contract with Pydantic schemas..."

---

## Quick Reference

| Task | Instruction File | Used By |
|------|------------------|---------|
| Write requirements | requirements-document.md | requirements-assistant |
| Design architecture | architecture-design.md | architecture-design |
| Review code | code-review-checklist.md | code-review-assistant |

---

## Contributing

When adding new instructions:

1. Use the standard structure above
2. Include concrete examples
3. Add validation checklist
4. Reference from appropriate agent(s)
5. Update this README

---

## Version

- **Last Updated**: 2026-06-06
- **Instructions**: 3 files
- **Agents Using**: requirements-assistant, architecture-design, code-review-assistant
