# Unit Test Results

**Date**: 2026-06-04
**Command**: `cd backend && .venv/Scripts/python -m pytest tests/ -v`

## Summary
| Metric | Value |
|--------|-------|
| Total  | 9     |
| Passed | 9     |
| Failed | 0     |
| Errors | 0     |

## Details
```
============================= test session starts =============================
platform win32 -- Python 3.13.13, pytest-9.0.3, pluggy-1.6.0
rootdir: backend
plugins: anyio-4.13.0
collected 9 items

tests/test_borrow.py::test_guest_cannot_borrow           PASSED  [ 11%]
tests/test_borrow.py::test_admin_cannot_borrow           PASSED  [ 22%]
tests/test_borrow.py::test_librarian_cannot_borrow       PASSED  [ 33%]
tests/test_borrow.py::test_successful_borrow             PASSED  [ 44%]
tests/test_borrow.py::test_cannot_borrow_unavailable_book PASSED [ 55%]
tests/test_borrow.py::test_cannot_borrow_same_book_twice  PASSED [ 66%]
tests/test_borrow.py::test_book_not_found                PASSED  [ 77%]
tests/test_borrow.py::test_unauthenticated_cannot_borrow PASSED  [ 88%]
tests/test_borrow.py::test_max_active_borrows_limit      PASSED  [100%]

======================= 9 passed, 15 warnings in 2.82s ========================
```
