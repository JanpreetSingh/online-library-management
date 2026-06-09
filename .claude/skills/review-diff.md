---
name: review-diff
description: 'Quick review of git diff for obvious issues. Returns summary of changes and any red flags.'
---

Quick scan of uncommitted changes for obvious issues.

## Checks

1. **Secrets**: Scan for API keys, tokens, passwords
2. **Console logs**: Find leftover `console.log`, `print()` debugging
3. **TODOs**: Highlight incomplete work
4. **Large changes**: Warn if >500 lines changed
5. **Test files**: Verify tests were updated

## Execution

```bash
git diff --stat
git diff | grep -i "password\|api_key\|secret\|token" || echo "No secrets found"
git diff | grep -E "console\.log|print\(" || echo "No debug statements"
git diff | grep -i "TODO\|FIXME" || echo "No TODOs"
```

## Output

```
📊 Changes: X files, +Y lines, -Z lines

✅ No secrets detected
✅ No debug statements
⚠️  2 TODOs found (see below)

Files changed:
- backend/app/routers/books.py (+45, -12)
- frontend/src/pages/BookPage.tsx (+78, -23)
- backend/tests/test_books.py (+92, -0)

Ready for formal code review? Use @code-review-assistant
```
