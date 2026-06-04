# Verification Report

**Date**: 2026-06-04
**Feature**: FR-3.1 — Borrow a Book

---

## Unit Test Results

| Metric | Value |
|--------|-------|
| Total  | 9     |
| Passed | 9     |
| Failed | 0     |
| Pass % | 100.0% |
| Threshold | ≥ 90% |
| Status | ✅ PASS |

<details>
<summary>Full pytest output</summary>

```
============================= test session starts =============================
platform win32 -- Python 3.13.13, pytest-9.0.3, pluggy-1.6.0
rootdir: backend
plugins: anyio-4.13.0
collected 9 items

tests/test_borrow.py::test_guest_cannot_borrow            PASSED  [ 11%]
tests/test_borrow.py::test_admin_cannot_borrow            PASSED  [ 22%]
tests/test_borrow.py::test_librarian_cannot_borrow        PASSED  [ 33%]
tests/test_borrow.py::test_successful_borrow              PASSED  [ 44%]
tests/test_borrow.py::test_cannot_borrow_unavailable_book PASSED  [ 55%]
tests/test_borrow.py::test_cannot_borrow_same_book_twice  PASSED  [ 66%]
tests/test_borrow.py::test_book_not_found                 PASSED  [ 77%]
tests/test_borrow.py::test_unauthenticated_cannot_borrow  PASSED  [ 88%]
tests/test_borrow.py::test_max_active_borrows_limit       PASSED  [100%]

======================= 9 passed, 15 warnings in 2.82s ========================
```

</details>

---

## E2E Test Results

| Metric | Value |
|--------|-------|
| Total  | 6     |
| Passed | 6     |
| Failed | 0     |
| Pass % | 100.0% |
| Threshold | ≥ 80% |
| Status | ✅ PASS |

### Breakdown
| Suite | Test | Result |
|-------|------|--------|
| Deployment | Backend API is accessible | ✅ PASS |
| Deployment | Frontend is accessible | ✅ PASS |
| Deployment | Can login with admin user | ✅ PASS |
| Deployment | Books page is accessible | ✅ PASS |
| Deployment | Borrow API endpoint exists | ✅ PASS |
| Deployment | Can access books via API | ✅ PASS |

> **Note**: One test (`Borrow API endpoint exists`) was fixed during this session — the expected HTTP status set was updated to include `422` and `403`, which the borrow endpoint correctly returns for a non-UUID book ID after TASK-10's UUID path param change.

---

## Verdict

> **Verification: ✅ PASSED**

| Check | Result |
|-------|--------|
| Unit tests ≥ 90% (100.0%) | ✅ PASS |
| E2E tests ≥ 80% (100.0%) | ✅ PASS |
