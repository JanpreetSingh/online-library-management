"""
Integration tests for the borrow functionality (FR-3.1: Borrow a Book).

These tests verify:
- Guest users cannot borrow books
- Users can borrow available books
- Users cannot borrow when no copies available
- Users cannot borrow the same book twice
- Users cannot exceed maximum active borrows limit
- Available copies are decremented correctly
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
import uuid

from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.models.book import Book
from app.models.borrow_transaction import BorrowTransaction, BorrowStatus
from app.auth.passwords import hash_password
from app.auth.jwt import create_access_token

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    """Create fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def member_token(test_db):
    """Create a member user and return JWT token"""
    db = TestingSessionLocal()
    user = User(
        id="member-123",
        name="Test Member",
        email="member@test.com",
        password_hash=hash_password("password123"),
        role=UserRole.member,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id, user_role, user_name = user.id, user.role.value, user.name
    db.close()
    return create_access_token({"sub": user_id, "role": user_role, "name": user_name})


@pytest.fixture
def guest_token():
    """Return a guest JWT token"""
    return create_access_token({"sub": "guest-temp", "role": "guest", "name": "Guest User"})


@pytest.fixture
def admin_token(test_db):
    """Create an admin user and return JWT token"""
    db = TestingSessionLocal()
    user = User(
        id="admin-123",
        name="Test Admin",
        email="admin@test.com",
        password_hash=hash_password("password123"),
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id, user_role, user_name = user.id, user.role.value, user.name
    db.close()
    return create_access_token({"sub": user_id, "role": user_role, "name": user_name})


@pytest.fixture
def librarian_token(test_db):
    """Create a librarian user and return JWT token"""
    db = TestingSessionLocal()
    user = User(
        id="librarian-123",
        name="Test Librarian",
        email="librarian@test.com",
        password_hash=hash_password("password123"),
        role=UserRole.librarian,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id, user_role, user_name = user.id, user.role.value, user.name
    db.close()
    return create_access_token({"sub": user_id, "role": user_role, "name": user_name})


@pytest.fixture
def sample_book(test_db):
    """Create a sample book with 3 copies"""
    db = TestingSessionLocal()
    book = Book(
        id=str(uuid.uuid4()),
        title="Test Book",
        author="Test Author",
        isbn="1234567890",
        category="Fiction",
        total_copies=3,
        available_copies=3,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    db.close()
    return book


def test_guest_cannot_borrow(client, guest_token, sample_book):
    """Test that guest users cannot borrow books (AC-5)"""
    response = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {guest_token}"}
    )
    assert response.status_code == 403
    assert "members" in response.json()["detail"].lower()


def test_admin_cannot_borrow(client, admin_token, sample_book):
    """Test that admin users cannot borrow books (AC-5: only members may borrow)"""
    response = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 403
    assert "members" in response.json()["detail"].lower()


def test_librarian_cannot_borrow(client, librarian_token, sample_book):
    """Test that librarian users cannot borrow books (AC-5: only members may borrow)"""
    response = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {librarian_token}"}
    )
    assert response.status_code == 403
    assert "members" in response.json()["detail"].lower()


def test_successful_borrow(client, member_token, sample_book):
    """Test successful borrowing of a book"""
    response = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["book_id"] == sample_book.id
    assert data["status"] == "Borrowed"
    assert "transaction_id" in data
    assert "due_date" in data
    
    # Verify available copies decreased
    db = TestingSessionLocal()
    book = db.query(Book).filter(Book.id == sample_book.id).first()
    assert book.available_copies == 2
    db.close()


def test_cannot_borrow_unavailable_book(client, member_token, test_db):
    """Test that users cannot borrow when no copies are available"""
    db = TestingSessionLocal()
    book = Book(
        id=str(uuid.uuid4()),
        title="Popular Book",
        author="Famous Author",
        isbn="9999999999",
        category="Fiction",
        total_copies=1,
        available_copies=0,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    book_id = book.id
    db.close()
    
    response = client.post(
        f"/api/borrow/{book_id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 409
    assert "no copies available" in response.json()["detail"].lower()


def test_cannot_borrow_same_book_twice(client, member_token, sample_book):
    """Test that users cannot borrow the same book twice"""
    # First borrow - should succeed
    response1 = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response1.status_code == 200
    
    # Second borrow - should fail
    response2 = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response2.status_code == 409
    assert "already have an active borrow" in response2.json()["detail"].lower()


def test_book_not_found(client, member_token):
    """Test borrowing a non-existent book returns 404 (valid UUID, no DB row)"""
    nonexistent_id = str(uuid.uuid4())
    response = client.post(
        f"/api/borrow/{nonexistent_id}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_unauthenticated_cannot_borrow(client, sample_book):
    """Test that unauthenticated users cannot borrow"""
    response = client.post(f"/api/borrow/{sample_book.id}")
    assert response.status_code == 401


def test_max_active_borrows_limit(client, member_token, test_db):
    """Test that users cannot exceed maximum active borrows limit (5)"""
    db = TestingSessionLocal()
    book_ids = [str(uuid.uuid4()) for _ in range(6)]

    # Create 5 books and borrow all of them
    for i in range(5):
        book = Book(
            id=book_ids[i],
            title=f"Book {i}",
            author="Author",
            isbn=f"ISBN{i}",
            category="Fiction",
            total_copies=1,
            available_copies=1,
        )
        db.add(book)
    db.commit()
    db.close()

    # Borrow 5 books successfully
    for i in range(5):
        response = client.post(
            f"/api/borrow/{book_ids[i]}",
            headers={"Authorization": f"Bearer {member_token}"}
        )
        assert response.status_code == 200

    # Try to borrow a 6th book - should fail
    db = TestingSessionLocal()
    book6 = Book(
        id=book_ids[5],
        title="Book 6",
        author="Author",
        isbn="ISBN6",
        category="Fiction",
        total_copies=1,
        available_copies=1,
    )
    db.add(book6)
    db.commit()
    db.close()

    response = client.post(
        f"/api/borrow/{book_ids[5]}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 409
    assert "maximum limit" in response.json()["detail"].lower()


def test_invalid_uuid_format(client, member_token):
    """Test borrowing with invalid UUID format returns 422"""
    invalid_uuid = "not-a-valid-uuid"
    response = client.post(
        f"/api/borrow/{invalid_uuid}",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 422
    assert "detail" in response.json()


@pytest.mark.skip(reason="Requires PostgreSQL row-level locking (SELECT FOR UPDATE). SQLite used in tests doesn't fully support this.")
def test_concurrent_borrow_last_copy(test_db, member_token):
    """Test that concurrent borrow attempts for last copy maintain data integrity

    NOTE: This test is skipped in SQLite test environment but would pass with PostgreSQL.
    PostgreSQL's SELECT FOR UPDATE provides proper row-level locking that serializes
    concurrent borrow attempts. To test this behavior, run against a PostgreSQL database.
    """
    import threading
    import time

    # Create a book with 1 copy
    db = TestingSessionLocal()
    book = Book(
        id=str(uuid.uuid4()),
        title="Last Copy Book",
        author="Author",
        isbn="CONCURRENT123",
        category="Fiction",
        total_copies=1,
        available_copies=1,
    )
    db.add(book)
    db.commit()
    book_id = book.id
    db.close()

    # Create multiple member users
    db = TestingSessionLocal()
    user_ids = []
    tokens = []
    for i in range(3):
        user = User(
            id=f"member-concurrent-{i}",
            name=f"Member {i}",
            email=f"member{i}@concurrent.com",
            password_hash=hash_password("password123"),
            role=UserRole.member,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_ids.append(user.id)
        tokens.append(create_access_token({
            "sub": user.id,
            "role": user.role.value,
            "name": user.name
        }))
    db.close()

    # Function to attempt borrow
    results = []
    def attempt_borrow(token, index):
        client = TestClient(app)
        response = client.post(
            f"/api/borrow/{book_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        results.append({
            "index": index,
            "status": response.status_code,
            "data": response.json()
        })

    # Launch concurrent requests
    threads = []
    for i, token in enumerate(tokens):
        thread = threading.Thread(target=attempt_borrow, args=(token, i))
        threads.append(thread)
        thread.start()

    # Wait for all threads to complete
    for thread in threads:
        thread.join()

    # Verify exactly one succeeded and others failed
    success_count = sum(1 for r in results if r["status"] == 200)
    conflict_count = sum(1 for r in results if r["status"] == 409)

    assert success_count == 1, f"Expected exactly 1 success, got {success_count}"
    assert conflict_count == 2, f"Expected 2 conflicts, got {conflict_count}"

    # Verify final book state
    db = TestingSessionLocal()
    final_book = db.query(Book).filter(Book.id == book_id).first()
    assert final_book.available_copies == 0, "Book should have 0 available copies"

    # Verify exactly one transaction was created
    transaction_count = db.query(BorrowTransaction).filter(
        BorrowTransaction.book_id == book_id
    ).count()
    assert transaction_count == 1, f"Expected 1 transaction, found {transaction_count}"
    db.close()
