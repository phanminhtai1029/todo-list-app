from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


# Request schemas
class BoardCreate(BaseModel):
    """Schema for creating a board"""
    title: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    background_color: str = Field(default="#3b82f6")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "My Project",
                "description": "Project management board",
                "background_color": "#3b82f6"
            }
        }


class BoardUpdate(BaseModel):
    """Schema for updating a board"""
    title: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    background_color: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated Project Name",
                "description": "Updated description",
                "background_color": "#ef4444"
            }
        }


# Response schemas
class BoardResponse(BaseModel):
    """Schema for board response"""
    id: str
    title: str
    description: Optional[str]
    background_color: str
    owner_id: str
    created_at: str
    updated_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "title": "My Project",
                "description": "Project management board",
                "background_color": "#3b82f6",
                "owner_id": "507f1f77bcf86cd799439012",
                "created_at": "2024-12-13T00:00:00",
                "updated_at": "2024-12-13T00:00:00"
            }
        }


class BoardListResponse(BaseModel):
    """Schema for list of boards response"""
    boards: list[BoardResponse]
    total: int

    class Config:
        json_schema_extra = {
            "example": {
                "boards": [
                    {
                        "id": "507f1f77bcf86cd799439011",
                        "title": "My Project",
                        "description": "Project board",
                        "background_color": "#3b82f6",
                        "owner_id": "507f1f77bcf86cd799439012",
                        "created_at": "2024-12-13T00:00:00",
                        "updated_at": "2024-12-13T00:00:00"
                    }
                ],
                "total": 1
            }
        }
