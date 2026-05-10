# backend/app/models/trip.py
# Trip model — a user's travel plan with date range, sharing, and cover photo.
# Depends on: Phase 1 / database.Base, User model

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # idx_trips_user_id
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    cover_photo: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_code: Mapped[str | None] = mapped_column(
        String(20), unique=True, nullable=True, index=True  # idx_trips_share_code
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="trips")  # noqa: F821
    stops: Mapped[list["Stop"]] = relationship(  # noqa: F821
        "Stop", back_populates="trip", cascade="all, delete-orphan",
        order_by="Stop.position_order",
    )
    checklist_items: Mapped[list["ChecklistItem"]] = relationship(  # noqa: F821
        "ChecklistItem", back_populates="trip", cascade="all, delete-orphan"
    )
    notes: Mapped[list["Note"]] = relationship(  # noqa: F821
        "Note", back_populates="trip", cascade="all, delete-orphan"
    )
    budget_items: Mapped[list["BudgetItem"]] = relationship(  # noqa: F821
        "BudgetItem", back_populates="trip", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Trip {self.name}>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
