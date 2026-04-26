import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    GuestLoginRequest,
    TokenResponse,
    UserProfileResponse,
)
from app.auth.passwords import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.dependencies import require_roles

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user: User | None = (
        db.query(User).filter(User.email == payload.email).first()
    )
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    token = create_access_token(
        {"sub": user.id, "name": user.name, "email": user.email, "role": user.role.value}
    )
    return TokenResponse(access_token=token)


@router.post("/guest-login", response_model=TokenResponse)
def guest_login(payload: GuestLoginRequest):
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Name must be at least 2 characters",
        )
    guest_id = str(uuid.uuid4())
    token = create_access_token(
        {"sub": guest_id, "name": name, "role": UserRole.guest.value}
    )
    return TokenResponse(access_token=token)


@router.post(
    "/register",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles([UserRole.admin]))],
)
def register_user(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
