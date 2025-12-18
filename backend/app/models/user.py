from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import EmailStr, Field

class User(Document):
    email: EmailStr = Field(..., unique=True, index=True)
    username: str = Field(..., min_length=3, max_length=50)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
