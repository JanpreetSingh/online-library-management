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
    db.close()
    return create_access_token({"sub": user.id, "role": user.role.value, "name": user.name})


@pytest.fixture
def guest_token():
    """Return a guest JWT token"""
    return create_access_token({"sub": "guest-temp", "role": "guest", "name": "Guest User"})


@pytest.fixture
def sample_book(test_db):
    """Create a sample book with 3 copies"""
    db = TestingSessionLocal()
    book = Book(
        id="book-123",
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
    """Test that guest users cannot borrow books"""
    response = client.post(
        f"/api/borrow/{sample_book.id}",
        headers={"Authorization": f"Bearer {guest_token}"}
    )
    assert response.status_code == 403
    assert "guest" in response.json()["detail"].lower()


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
        id="book-unavailable",
        title="Popular Book",
        author="Famous Author",
        isbn="9999999999",
        category="Fiction",
        total_copies=1,
        available_copies=0,
    )
    db.add(book)
    db.commit()
    db.close()
    
    response = client.post(
        f"/api/borrow/{book.id}",
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
    assert response2.status_code == 400
    assert "already have an active borrow" in response2.json()["detail"].lower()


def test_book_not_found(client, member_token):
    """Test borrowing a non-existent book"""
    response = client.post(
        "/api/borrow/nonexistent-book-id",
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
    
    # Create 5 books and borrow all of them
    for i in range(5):
        book = Book(
            id=f"book-{i}",
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
            f"/api/borrow/book-{i}",
            headers={"Authorization": f"Bearer {member_token}"}
        )
        assert response.status_code == 200
    
    # Try to borrow a 6th book - should fail
    db = TestingSessionLocal()
    book6 = Book(
        id="book-6",
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
        "/api/borrow/book-6",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert response.status_code == 400
    assert "maximum limit" in response.json()["detail"].lower()
