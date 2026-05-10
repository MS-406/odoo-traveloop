# backend/app/models/checklist.py
# ChecklistItem model — packing list items grouped by category.
# Depends on: Phase 1 / database.Base, Trip model

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

CHECKLIST_CATEGORIES = ("clothing", "documents", "electronics", "toiletries", "medicine", "other")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    __table_args__ = (
        CheckConstraint(
            f"category IN {CHECKLIST_CATEGORIES}",
            name="ck_checklist_items_category",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # idx_checklist_trip_id
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    is_packed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────────────
    trip: Mapped["Trip"] = relationship("Trip", back_populates="checklist_items")  # noqa: F821

    def __repr__(self) -> str:
        return f"<ChecklistItem {self.name} ({self.category})>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
