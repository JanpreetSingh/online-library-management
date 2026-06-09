from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BorrowTransactionResponse(BaseModel):
    id: str
    book_id: str
    user_id: str
    borrowed_at: datetime
    due_date: datetime
    status: str
    returned_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class BorrowBookResponse(BaseModel):
    transaction_id: str
    book_id: str
    user_id: str
    borrowed_at: datetime
    due_date: datetime
    status: str

    model_config = {"from_attributes": True}
