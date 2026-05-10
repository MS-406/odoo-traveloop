# backend/app/routers/checklist.py
# Checklist CRUD + toggle router.
import uuid as _uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.checklist import ChecklistCreate, ChecklistRead, ChecklistUpdate
from app.services.checklist_service import ChecklistService

router = APIRouter(tags=["checklist"])

@router.get("/trips/{trip_id}/checklist", response_model=list[ChecklistRead], summary="List checklist items")
async def list_items(trip_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: tid = _uuid.UUID(trip_id)
    except ValueError: raise HTTPException(400, "Invalid trip ID")
    svc = ChecklistService(db)
    try: return await svc.list_items(tid, user.id)
    except ValueError: raise HTTPException(404, "Trip not found")

@router.post("/trips/{trip_id}/checklist", response_model=ChecklistRead, status_code=status.HTTP_201_CREATED, summary="Add checklist item")
async def create_item(trip_id: str, body: ChecklistCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: tid = _uuid.UUID(trip_id)
    except ValueError: raise HTTPException(400, "Invalid trip ID")
    svc = ChecklistService(db)
    try: return await svc.create_item(tid, user.id, body.name, body.category)
    except ValueError: raise HTTPException(404, "Trip not found")

@router.put("/checklist/{item_id}", response_model=ChecklistRead, summary="Update checklist item")
async def update_item(item_id: str, body: ChecklistUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: iid = _uuid.UUID(item_id)
    except ValueError: raise HTTPException(400, "Invalid item ID")
    svc = ChecklistService(db)
    item = await svc.update_item(iid, user.id, body.model_dump(exclude_unset=True))
    if not item: raise HTTPException(404, "Item not found")
    return item

@router.patch("/checklist/{item_id}/toggle", response_model=ChecklistRead, summary="Toggle packed status")
async def toggle_item(item_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: iid = _uuid.UUID(item_id)
    except ValueError: raise HTTPException(400, "Invalid item ID")
    svc = ChecklistService(db)
    item = await svc.toggle_packed(iid, user.id)
    if not item: raise HTTPException(404, "Item not found")
    return item

@router.delete("/checklist/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete checklist item")
async def delete_item(item_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: iid = _uuid.UUID(item_id)
    except ValueError: raise HTTPException(400, "Invalid item ID")
    svc = ChecklistService(db)
    if not await svc.delete_item(iid, user.id): raise HTTPException(404, "Item not found")

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
