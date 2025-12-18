from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field, BaseModel


class ChecklistItem(BaseModel):
    """Checklist item for a card."""
    id: str  # UUID
    text: str = Field(..., min_length=1, max_length=200)
    completed: bool = Field(default=False)


class Card(Document):
    """Card model for database."""
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    labels: List[str] = Field(default_factory=list)
    due_date: Optional[datetime] = None
    checklist: List[ChecklistItem] = Field(default_factory=list)  # NEW
    order: int = Field(default=0, ge=0)
    list_id: Indexed(str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "cards"

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Write documentation",
                "description": "Create comprehensive API docs",
                "labels": ["red", "blue"],
                "due_date": "2024-12-31T23:59:59",
                "checklist": [
                    {"id": "1", "text": "Write README", "completed": True},
                    {"id": "2", "text": "Write API docs", "completed": False}
                ],
                "order": 0,
                "list_id": "507f1f77bcf86cd799439011"
            }
        }
