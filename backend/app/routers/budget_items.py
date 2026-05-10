# backend/app/routers/budget_items.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid as _uuid

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.budget_item import BudgetItem
from app.schemas.budget import BudgetItemCreate, BudgetItemResponse

router = APIRouter(tags=["budget_items"])

@router.post("/trips/{trip_id}/budget/items", response_model=BudgetItemResponse, status_code=status.HTTP_201_CREATED)
async def create_budget_item(
    trip_id: str,
    item: BudgetItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    # Verify trip ownership
    result = await db.execute(select(Trip).where(Trip.id == tid, Trip.user_id == user.id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    new_item = BudgetItem(
        trip_id=tid,
        title=item.title,
        category=item.category,
        amount=item.amount,
        notes=item.notes
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.delete("/budget/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget_item(
    item_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        iid = _uuid.UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    # Find item and verify trip ownership
    q = select(BudgetItem).join(Trip).where(BudgetItem.id == iid, Trip.user_id == user.id)
    result = await db.execute(q)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")

    await db.delete(item)
    await db.commit()
    return None

@router.patch("/budget/items/{item_id}", response_model=BudgetItemResponse)
async def update_budget_item(
    item_id: str,
    item_update: BudgetItemCreate, # Reuse create schema or make a partial one
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        iid = _uuid.UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    q = select(BudgetItem).join(Trip).where(BudgetItem.id == iid, Trip.user_id == user.id)
    result = await db.execute(q)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")

    item.title = item_update.title
    item.category = item_update.category
    item.amount = item_update.amount
    item.notes = item_update.notes

    await db.commit()
    await db.refresh(item)
    return item
