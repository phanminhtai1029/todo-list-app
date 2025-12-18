from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.card import Card
from app.models.list import List
from app.models.board import Board
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate, CardReorder, CardMove, CardResponse
from app.api.dependencies.auth import get_current_active_user

router = APIRouter(prefix="/cards", tags=["Cards"])


async def verify_list_ownership(list_id: str, user_id: str) -> List:
    """Helper function to verify list ownership through board"""
    lst = await List.get(list_id)
    if not lst:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Verify board ownership
    board = await Board.get(lst.board_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    if board.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this list"
        )

    return lst


@router.post("/{list_id}", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    list_id: str,
    card_data: CardCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new card in a list.

    - **list_id**: ID of the list
    - **title**: Card title (3-100 characters)
    - **description**: Optional description (max 500 characters)
    - **order**: Optional order number (default: auto-incremented)

    User must be the owner of the board containing this list.
    """
    # Verify list ownership
    await verify_list_ownership(list_id, str(current_user.id))

    # Determine order
    if card_data.order is None:
        # Auto-increment: get max order + 1
        existing_cards = await Card.find(Card.list_id == list_id).to_list()
        max_order = max([c.order for c in existing_cards], default=-1)
        order = max_order + 1
    else:
        order = card_data.order

    # Create card
    new_card = Card(
        title=card_data.title,
        description=card_data.description,
        labels=card_data.labels if card_data.labels else [],
        due_date=card_data.due_date,
        checklist=[item.dict() for item in card_data.checklist] if card_data.checklist else [],
        order=order,
        list_id=list_id
    )

    await new_card.insert()

    return CardResponse(
        id=str(new_card.id),
        title=new_card.title,
        description=new_card.description,
        labels=new_card.labels,
        due_date=new_card.due_date.isoformat().replace('+00:00', 'Z') if new_card.due_date else None,
        checklist=[item.dict() if hasattr(item, 'dict') else item for item in new_card.checklist],
        order=new_card.order,
        list_id=new_card.list_id,
        created_at=new_card.created_at.isoformat(),
        updated_at=new_card.updated_at.isoformat()
    )


@router.put("/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: str,
    card_data: CardUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a card.

    User must be the owner of the board containing this card.
    """
    card = await Card.get(card_id)

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    # Verify list ownership
    await verify_list_ownership(card.list_id, str(current_user.id))

    # Update fields
    update_data = card_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(card, field, value)

    card.updated_at = datetime.utcnow()

    await card.save()

    return CardResponse(
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


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a card.

    User must be the owner of the board containing this card.
    """
    card = await Card.get(card_id)

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    # Verify list ownership
    await verify_list_ownership(card.list_id, str(current_user.id))

    # Delete the card
    await card.delete()

    return None


@router.post("/{list_id}/reorder", response_model=dict)
async def reorder_cards(
    list_id: str,
    reorder_data: CardReorder,
    current_user: User = Depends(get_current_active_user)
):
    """
    Reorder cards within a list.

    Provide a dictionary of {card_id: new_order}.
    User must be the owner of the board.
    """
    # Verify list ownership
    await verify_list_ownership(list_id, str(current_user.id))

    # Update each card's order
    for card_id, new_order in reorder_data.card_orders.items():
        card = await Card.get(card_id)
        if card and card.list_id == list_id:
            card.order = new_order
            card.updated_at = datetime.utcnow()
            await card.save()

    return {"message": "Cards reordered successfully"}


@router.post("/{card_id}/move", response_model=CardResponse)
async def move_card(
    card_id: str,
    move_data: CardMove,
    current_user: User = Depends(get_current_active_user)
):
    """
    Move a card to another list.

    - **target_list_id**: ID of the destination list
    - **new_order**: New order in the destination list

    User must be the owner of the board.
    """
    card = await Card.get(card_id)

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    # Verify ownership of both source and target lists
    await verify_list_ownership(card.list_id, str(current_user.id))
    await verify_list_ownership(move_data.target_list_id, str(current_user.id))

    # Move card
    card.list_id = move_data.target_list_id
    card.order = move_data.new_order
    card.updated_at = datetime.utcnow()

    await card.save()

    return CardResponse(
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
