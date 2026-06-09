---
name: commit-style
description: Commit message format and co-author attribution
type: feedback
---

Use conventional commit format with co-author attribution:

```
<type>: <description>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests only
- `refactor` - Code restructuring
- `chore` - Build/tooling

**Why:** Conventional commits make changelogs automatic and history searchable. Co-author attribution gives credit for AI-assisted development.

**How to apply:** When committing code, always use this format. The /quick-commit skill automates this pattern.
