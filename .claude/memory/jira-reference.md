---
name: jira-reference
description: Jira project keys and issue tracking location
type: reference
---

**Jira URL**: https://jiraeu.epam.com
**Project Key**: LIB (Online Library Management) and EPMCDMETST (parent project)

**Issue Patterns:**
- `LIB-XX` - Library feature tickets
- `EPMCDMETST-XXXXX` - Parent project tracking

**MCP Access:** Use `@jira/get-issue` to fetch ticket details if Jira MCP is configured.

**Fallback:** If MCP unavailable, ask user to paste ticket details or use web URL.

**How to apply:** When user provides ticket ID, try Jira MCP first. If it fails, ask for paste instead of blocking workflow.
