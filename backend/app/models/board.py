from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field


class Board(Document):
    """Board model for database."""
    title: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    background_color: str = Field(default="#3b82f6")  # Default blue
    owner_id: Indexed(str)  # Reference to User
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "boards"
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "My Project",
                "description": "Project management board",
                "background_color": "#3b82f6",
                "owner_id": "507f1f77bcf86cd799439011"
            }
        }
