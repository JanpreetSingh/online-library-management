from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole


class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

    @field_validator("role")
    @classmethod
    def role_must_not_be_admin_or_guest(cls, v: UserRole) -> UserRole:
        if v in (UserRole.admin, UserRole.guest):
            raise ValueError("Cannot register as admin or guest via this endpoint")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class GuestLoginRequest(BaseModel):
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str | None
    role: UserRole
    phone: str | None
    address: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
