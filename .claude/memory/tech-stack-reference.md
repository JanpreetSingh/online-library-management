---
name: tech-stack-reference
description: Technology versions and key patterns
type: reference
---

**Backend:**
- Python 3.11+
- FastAPI (latest)
- SQLAlchemy 2.0 (ORM)
- Pydantic v2 (use `ConfigDict`, not `Config` class)
- pytest for testing

**Frontend:**
- React 18
- TypeScript 5
- Tailwind CSS (utility-first, no inline styles)
- Vite (dev server)

**Database:**
- PostgreSQL 15
- SQLAlchemy migrations via Alembic

**Auth:**
- JWT tokens (`python-jose`)
- Role-based: member, librarian, admin
- Pattern: `user.role != UserRole.member` for librarian/admin

**Key Patterns:**
- FastAPI Depends for auth injection
- Functional React components with hooks
- Pydantic at API boundary for validation
- UUID path params where applicable

**How to apply:** Follow CLAUDE.md patterns. Check existing code for consistency before writing new code.
