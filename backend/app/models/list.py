from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field


class List(Document):
    """List model for database."""
    title: str = Field(..., min_length=3, max_length=50)
    order: int = Field(default=0, ge=0)  # Greater or equal to 0
    board_id: Indexed(str)  # Reference to Board
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "lists"

    class Config:
        json_schema_extra = {
            "example": {
                "title": "To Do",
                "order": 0,
                "board_id": "507f1f77bcf86cd799439011"
            }
        }
