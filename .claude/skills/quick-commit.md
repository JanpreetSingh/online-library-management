---
name: quick-commit
description: 'Stage changes and create a conventional commit with co-author attribution.'
---

Create a conventional commit with proper formatting.

## Usage

Provide commit type and message:
- `fix: resolve book availability check`
- `feat: add book reservation feature`
- `docs: update API documentation`
- `test: add E2E tests for borrowing`

## Execution

1. Show files to be committed:
```bash
git status -s
```

2. Ask user to confirm files

3. Stage and commit:
```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>: <message>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

4. Report:
```
✅ Committed: <sha>
   <type>: <message>
```

## Commit Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `test` - Tests only
- `refactor` - Code refactoring
- `style` - Formatting
- `chore` - Build/tooling
