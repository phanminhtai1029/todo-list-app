from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.board import Board
from app.models.user import User
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse, BoardListResponse
from app.api.dependencies.auth import get_current_active_user
from app.core.config import settings

router = APIRouter(prefix="/boards", tags=["Boards"])


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(
    board_data: BoardCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new board.

    - **title**: Board title (3-50 characters)
    - **description**: Optional description (max 200 characters)
    - **background_color**: Hex color code (default: #3b82f6)

    Maximum 7 boards per user.
    """
    # Check board limit
    user_boards_count = await Board.find(Board.owner_id == str(current_user.id)).count()

    if user_boards_count >= settings.MAX_BOARDS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {settings.MAX_BOARDS_PER_USER} boards per user"
        )

    # Create board
    new_board = Board(
        title=board_data.title,
        description=board_data.description,
        background_color=board_data.background_color,
        owner_id=str(current_user.id)
    )

    await new_board.insert()

    return BoardResponse(
        id=str(new_board.id),
        title=new_board.title,
        description=new_board.description,
        background_color=new_board.background_color,
        owner_id=new_board.owner_id,
        created_at=new_board.created_at.isoformat(),
        updated_at=new_board.updated_at.isoformat()
    )


@router.get("/", response_model=BoardListResponse)
async def get_user_boards(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all boards owned by current user.

    Returns list of boards with total count.
    """
    boards = await Board.find(Board.owner_id == str(current_user.id)).to_list()

    board_responses = [
        BoardResponse(
            id=str(board.id),
            title=board.title,
            description=board.description,
            background_color=board.background_color,
            owner_id=board.owner_id,
            created_at=board.created_at.isoformat(),
            updated_at=board.updated_at.isoformat()
        )
        for board in boards
    ]

    return BoardListResponse(
        boards=board_responses,
        total=len(board_responses)
    )


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a single board by ID.

    User must be the owner of the board.
    """
    board = await Board.get(board_id)

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )

    # Check ownership
    if board.owner_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this board"
        )

    return BoardResponse(
        id=str(board.id),
        title=board.title,
        description=board.description,
        background_color=board.background_color,
        owner_id=board.owner_id,
        created_at=board.created_at.isoformat(),
        updated_at=board.updated_at.isoformat()
    )


@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: str,
    board_data: BoardUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a board.

    User must be the owner of the board.
    Only provided fields will be updated.
    """
    board = await Board.get(board_id)

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )

    # Check ownership
    if board.owner_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this board"
        )

    # Update fields
    update_data = board_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(board, field, value)

    board.updated_at = datetime.utcnow()

    await board.save()

    return BoardResponse(
        id=str(board.id),
        title=board.title,
        description=board.description,
        background_color=board.background_color,
        owner_id=board.owner_id,
        created_at=board.created_at.isoformat(),
        updated_at=board.updated_at.isoformat()
    )


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    board_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a board.

    User must be the owner of the board.
    """
    board = await Board.get(board_id)

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )

    # Check ownership
    if board.owner_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this board"
        )

    await board.delete()

    return None
