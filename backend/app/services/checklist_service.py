# backend/app/services/checklist_service.py
# Business logic for ChecklistItem CRUD + toggle.
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.checklist import ChecklistItem
from app.models.trip import Trip


class ChecklistService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_items(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> list[ChecklistItem]:
        trip = await self._get_owned_trip(trip_id, user_id)
        if not trip:
            raise ValueError("TRIP_NOT_FOUND")
        result = await self.db.execute(
            select(ChecklistItem).where(ChecklistItem.trip_id == trip_id)
            .order_by(ChecklistItem.category, ChecklistItem.name)
        )
        return list(result.scalars().all())

    async def create_item(self, trip_id: uuid.UUID, user_id: uuid.UUID,
                          name: str, category: str) -> ChecklistItem:
        trip = await self._get_owned_trip(trip_id, user_id)
        if not trip:
            raise ValueError("TRIP_NOT_FOUND")
        item = ChecklistItem(trip_id=trip_id, name=name, category=category)
        self.db.add(item)
        await self.db.flush()
        return item

    async def update_item(self, item_id: uuid.UUID, user_id: uuid.UUID, data: dict) -> ChecklistItem | None:
        item = await self._get_owned_item(item_id, user_id)
        if not item:
            return None
        for k, v in data.items():
            if v is not None:
                setattr(item, k, v)
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def toggle_packed(self, item_id: uuid.UUID, user_id: uuid.UUID) -> ChecklistItem | None:
        item = await self._get_owned_item(item_id, user_id)
        if not item:
            return None
        item.is_packed = not item.is_packed
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def delete_item(self, item_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        item = await self._get_owned_item(item_id, user_id)
        if not item:
            return False
        await self.db.delete(item)
        return True

    async def _get_owned_trip(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> Trip | None:
        result = await self.db.execute(
            select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id))
        return result.scalar_one_or_none()

    async def _get_owned_item(self, item_id: uuid.UUID, user_id: uuid.UUID) -> ChecklistItem | None:
        result = await self.db.execute(
            select(ChecklistItem).join(Trip)
            .where(ChecklistItem.id == item_id, Trip.user_id == user_id))
        return result.scalar_one_or_none()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
