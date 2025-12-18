from typing import Optional
from pydantic import BaseModel, Field


# Request schemas
class ListCreate(BaseModel):
    """Schema for creating a list"""
    title: str = Field(..., min_length=3, max_length=50)
    order: Optional[int] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "To Do",
                "order": 0
            }
        }


class ListUpdate(BaseModel):
    """Schema for updating a list"""
    title: Optional[str] = Field(None, min_length=3, max_length=50)
    order: Optional[int] = Field(None, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "In Progress",
                "order": 1
            }
        }


class ListReorder(BaseModel):
    """Schema for reordering lists"""
    list_orders: dict[str, int]  # {list_id: new_order}

    class Config:
        json_schema_extra = {
            "example": {
                "list_orders": {
                    "507f1f77bcf86cd799439011": 0,
                    "507f1f77bcf86cd799439012": 1,
                    "507f1f77bcf86cd799439013": 2
                }
            }
        }


# Response schemas
class ListResponse(BaseModel):
    """Schema for list response"""
    id: str
    title: str
    order: int
    board_id: str
    created_at: str
    updated_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "To Do",
                "order": 0,
                "board_id": "507f1f77bcf86cd799439012",
                "created_at": "2024-12-13T00:00:00",
                "updated_at": "2024-12-13T00:00:00"
            }
        }


class ListWithCardsResponse(BaseModel):
    """Schema for list with cards"""
    id: str
    title: str
    order: int
    board_id: str
    created_at: str
    updated_at: str
    cards: list = []  # Will be populated with CardResponse

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "To Do",
                "order": 0,
                "board_id": "507f1f77bcf86cd799439012",
                "created_at": "2024-12-13T00:00:00",
                "updated_at": "2024-12-13T00:00:00",
                "cards": []
            }
        }
