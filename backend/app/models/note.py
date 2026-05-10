# backend/app/models/note.py
# Note model — free-text notes attached to a trip and optionally a stop.
# Depends on: Phase 1 / database.Base, User model, Trip model, Stop model

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # idx_notes_trip_id
    )
    stop_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stops.id", ondelete="SET NULL"),
        nullable=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="notes")  # noqa: F821
    trip: Mapped["Trip"] = relationship("Trip", back_populates="notes")  # noqa: F821
    stop: Mapped["Stop | None"] = relationship("Stop", back_populates="notes")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Note trip={self.trip_id} stop={self.stop_id}>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
