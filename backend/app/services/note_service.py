# backend/app/services/note_service.py
# Business logic for Note CRUD scoped to trip ownership.
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.note import Note
from app.models.trip import Trip


class NoteService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_notes(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> list[Note]:
        trip = await self._get_owned_trip(trip_id, user_id)
        if not trip:
            raise ValueError("TRIP_NOT_FOUND")
        result = await self.db.execute(
            select(Note).where(Note.trip_id == trip_id, Note.user_id == user_id)
            .order_by(Note.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_note(self, trip_id: uuid.UUID, user_id: uuid.UUID,
                          content: str, stop_id: uuid.UUID | None = None) -> Note:
        trip = await self._get_owned_trip(trip_id, user_id)
        if not trip:
            raise ValueError("TRIP_NOT_FOUND")
        note = Note(trip_id=trip_id, user_id=user_id, content=content, stop_id=stop_id)
        self.db.add(note)
        await self.db.flush()
        return note

    async def update_note(self, note_id: uuid.UUID, user_id: uuid.UUID, data: dict) -> Note | None:
        note = await self._get_owned_note(note_id, user_id)
        if not note:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(note, k, v)
        await self.db.flush()
        await self.db.refresh(note)
        return note

    async def delete_note(self, note_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        note = await self._get_owned_note(note_id, user_id)
        if not note:
            return False
        await self.db.delete(note)
        return True

    async def _get_owned_trip(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> Trip | None:
        result = await self.db.execute(
            select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id))
        return result.scalar_one_or_none()

    async def _get_owned_note(self, note_id: uuid.UUID, user_id: uuid.UUID) -> Note | None:
        result = await self.db.execute(
            select(Note).where(Note.id == note_id, Note.user_id == user_id))
        return result.scalar_one_or_none()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
