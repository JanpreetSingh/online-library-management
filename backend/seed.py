"""
Seed script — creates the default admin user if not already present.
Run from the backend/ directory:
    python seed.py
"""
import sys
import os

# Ensure backend/ is on the path so 'app' imports work
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole  # noqa: F401 — registers model
from app.auth.passwords import hash_password
from app.config import settings


def seed():
    # Create tables if they don't exist (idempotent in dev)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if existing:
            print(f"Admin already exists: {settings.FIRST_ADMIN_EMAIL}")
            return

        admin = User(
            name=settings.FIRST_ADMIN_NAME,
            email=settings.FIRST_ADMIN_EMAIL,
            password_hash=hash_password(settings.FIRST_ADMIN_PASSWORD),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
        print(f"✓ Admin created: {settings.FIRST_ADMIN_EMAIL} / {settings.FIRST_ADMIN_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
