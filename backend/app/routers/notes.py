# backend/app/routers/notes.py
# Note CRUD router — trip-scoped notes with optional stop link.
import uuid as _uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate
from app.services.note_service import NoteService

router = APIRouter(tags=["notes"])

@router.get("/trips/{trip_id}/notes", response_model=list[NoteRead], summary="List trip notes")
async def list_notes(trip_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: tid = _uuid.UUID(trip_id)
    except ValueError: raise HTTPException(400, "Invalid trip ID")
    svc = NoteService(db)
    try: return await svc.list_notes(tid, user.id)
    except ValueError: raise HTTPException(404, "Trip not found")

@router.post("/trips/{trip_id}/notes", response_model=NoteRead, status_code=status.HTTP_201_CREATED, summary="Create note")
async def create_note(trip_id: str, body: NoteCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: tid = _uuid.UUID(trip_id)
    except ValueError: raise HTTPException(400, "Invalid trip ID")
    svc = NoteService(db)
    try: return await svc.create_note(tid, user.id, body.content, body.stop_id)
    except ValueError: raise HTTPException(404, "Trip not found")

@router.put("/notes/{note_id}", response_model=NoteRead, summary="Update note")
async def update_note(note_id: str, body: NoteUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: nid = _uuid.UUID(note_id)
    except ValueError: raise HTTPException(400, "Invalid note ID")
    svc = NoteService(db)
    note = await svc.update_note(nid, user.id, body.model_dump(exclude_unset=True))
    if not note: raise HTTPException(404, "Note not found")
    return note

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete note")
async def delete_note(note_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try: nid = _uuid.UUID(note_id)
    except ValueError: raise HTTPException(400, "Invalid note ID")
    svc = NoteService(db)
    if not await svc.delete_note(nid, user.id): raise HTTPException(404, "Note not found")

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
