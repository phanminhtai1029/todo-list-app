from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class ChecklistItemSchema(BaseModel):
    """Schema for checklist item"""
    id: str
    text: str = Field(..., min_length=1, max_length=200)
    completed: bool = Field(default=False)


# Request schemas
class CardCreate(BaseModel):
    """Schema for creating a card"""
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    labels: Optional[List[str]] = Field(default_factory=list)
    due_date: Optional[datetime] = None
    checklist: Optional[List[ChecklistItemSchema]] = Field(default_factory=list)
    order: Optional[int] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Write documentation",
                "description": "Create comprehensive API docs",
                "labels": ["red", "blue"],
                "due_date": "2024-12-31T23:59:59",
                "order": 0
            }
        }


class CardUpdate(BaseModel):
    """Schema for updating a card"""
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    labels: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    checklist: Optional[List[ChecklistItemSchema]] = None
    order: Optional[int] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated task",
                "description": "Updated description",
                "labels": ["green"],
                "due_date": "2024-12-31T23:59:59",
                "order": 1
            }
        }


class CardReorder(BaseModel):
    """Schema for reordering cards within a list"""
    card_orders: dict[str, int]

    class Config:
        json_schema_extra = {
            "example": {
                "card_orders": {
                    "507f1f77bcf86cd799439011": 0,
                    "507f1f77bcf86cd799439012": 1,
                    "507f1f77bcf86cd799439013": 2
                }
            }
        }


class CardMove(BaseModel):
    """Schema for moving card to another list"""
    target_list_id: str
    new_order: int = Field(ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "target_list_id": "507f1f77bcf86cd799439012",
                "new_order": 0
            }
        }


# Response schemas
class CardResponse(BaseModel):
    """Schema for card response"""
    id: str
    title: str
    description: Optional[str]
    labels: List[str]
    due_date: Optional[str]
    checklist: List[ChecklistItemSchema]
    order: int
    list_id: str
    created_at: str
    updated_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "Write documentation",
                "description": "Create comprehensive API docs",
                "labels": ["red", "blue"],
                "due_date": "2024-12-31T23:59:59",
                "order": 0,
                "list_id": "507f1f77bcf86cd799439012",
                "created_at": "2024-12-13T00:00:00",
                "updated_at": "2024-12-13T00:00:00"
            }
        }
