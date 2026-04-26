from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CreateBookRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    isbn: str = Field(..., min_length=1, max_length=20)
    category: str = Field(..., min_length=1, max_length=100)
    publisher: Optional[str] = Field(None, max_length=255)
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    total_copies: int = Field(1, ge=1)
    cover_image_url: Optional[str] = None


class UpdateBookRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    author: Optional[str] = Field(None, min_length=1, max_length=255)
    isbn: Optional[str] = Field(None, min_length=1, max_length=20)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    publisher: Optional[str] = Field(None, max_length=255)
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    total_copies: Optional[int] = Field(None, ge=1)
    cover_image_url: Optional[str] = None


class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    isbn: str
    category: str
    publisher: Optional[str]
    publication_year: Optional[int]
    total_copies: int
    available_copies: int
    cover_image_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
