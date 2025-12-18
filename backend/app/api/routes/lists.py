from datetime import datetime
from typing import List as ListType
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.list import List
from app.models.card import Card
from app.models.board import Board
from app.models.user import User
from app.schemas.list import ListCreate, ListUpdate, ListReorder, ListResponse, ListWithCardsResponse
from app.schemas.card import CardResponse
from app.api.dependencies.auth import get_current_active_user

router = APIRouter(prefix="/lists", tags=["Lists"])


async def verify_board_ownership(board_id: str, user_id: str) -> Board:
    """Helper function to verify board ownership"""
    board = await Board.get(board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    if board.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this board"
        )
    return board


@router.post("/{board_id}", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
async def create_list(
    board_id: str,
    list_data: ListCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new list in a board.

    - **board_id**: ID of the board
    - **title**: List title (3-50 characters)
    - **order**: Optional order number (default: auto-incremented)

    User must be the owner of the board.
    """
    # Verify board ownership
    await verify_board_ownership(board_id, str(current_user.id))

    # Determine order
    if list_data.order is None:
        # Auto-increment: get max order + 1
        existing_lists = await List.find(List.board_id == board_id).to_list()
        max_order = max([l.order for l in existing_lists], default=-1)
        order = max_order + 1
    else:
        order = list_data.order

    # Create list
    new_list = List(
        title=list_data.title,
        order=order,
        board_id=board_id
    )

    await new_list.insert()

    return ListResponse(
        id=str(new_list.id),
        title=new_list.title,
        order=new_list.order,
        board_id=new_list.board_id,
        created_at=new_list.created_at.isoformat(),
        updated_at=new_list.updated_at.isoformat()
    )


@router.get("/{board_id}", response_model=ListType[ListWithCardsResponse])
async def get_board_lists(
    board_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all lists in a board with their cards.

    Returns lists sorted by order, each with their cards.
    User must be the owner of the board.
    """
    # Verify board ownership
    await verify_board_ownership(board_id, str(current_user.id))

    # Get all lists, sorted by order
    lists = await List.find(List.board_id == board_id).sort("+order").to_list()

    # Get all cards for these lists
    list_ids = [str(l.id) for l in lists]
    all_cards = await Card.find({"list_id": {"$in": list_ids}}).sort("+order").to_list()

    # Group cards by list_id
    cards_by_list = {}
    for card in all_cards:
        if card.list_id not in cards_by_list:
            cards_by_list[card.list_id] = []
        cards_by_list[card.list_id].append(
            CardResponse(
                id=str(card.id),
                title=card.title,
                description=card.description,
                labels=card.labels,
                due_date=card.due_date.isoformat().replace('+00:00', 'Z') if card.due_date else None,
                checklist=[item.dict() if hasattr(item, 'dict') else item for item in card.checklist],
                order=card.order,
                list_id=card.list_id,
                created_at=card.created_at.isoformat(),
                updated_at=card.updated_at.isoformat()
            )
        )

    # Build response
    list_responses = []
    for lst in lists:
        list_id = str(lst.id)
        list_responses.append(
            ListWithCardsResponse(
                id=list_id,
                title=lst.title,
                order=lst.order,
                board_id=lst.board_id,
                created_at=lst.created_at.isoformat(),
                updated_at=lst.updated_at.isoformat(),
                cards=cards_by_list.get(list_id, [])
            )
        )

    return list_responses


@router.put("/{list_id}", response_model=ListResponse)
async def update_list(
    list_id: str,
    list_data: ListUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a list.

    User must be the owner of the board containing this list.
    """
    lst = await List.get(list_id)

    if not lst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Verify board ownership
    await verify_board_ownership(lst.board_id, str(current_user.id))

    # Update fields
    update_data = list_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(lst, field, value)

    lst.updated_at = datetime.utcnow()

    await lst.save()

    return ListResponse(
        id=str(lst.id),
        title=lst.title,
        order=lst.order,
        board_id=lst.board_id,
        created_at=lst.created_at.isoformat(),
        updated_at=lst.updated_at.isoformat()
    )


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list(
    list_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a list and all its cards.

    User must be the owner of the board containing this list.
    """
    lst = await List.get(list_id)

    if not lst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Verify board ownership
    await verify_board_ownership(lst.board_id, str(current_user.id))

    # Delete all cards in this list
    await Card.find(Card.list_id == list_id).delete()

    # Delete the list
    await lst.delete()

    return None


@router.post("/{board_id}/reorder", response_model=dict)
async def reorder_lists(
    board_id: str,
    reorder_data: ListReorder,
    current_user: User = Depends(get_current_active_user)
):
    """
    Reorder lists in a board.

    Provide a dictionary of {list_id: new_order}.
    User must be the owner of the board.
    """
    # Verify board ownership
    await verify_board_ownership(board_id, str(current_user.id))

    # Update each list's order
    for list_id, new_order in reorder_data.list_orders.items():
        lst = await List.get(list_id)
        if lst and lst.board_id == board_id:
            lst.order = new_order
            lst.updated_at = datetime.utcnow()
            await lst.save()

    return {"message": "Lists reordered successfully"}
