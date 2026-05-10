# backend/app/models/stop.py
# Stop model — a city visit within a trip, ordered by position.
# Depends on: Phase 1 / database.Base, Trip model, City model

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Stop(Base):
    __tablename__ = "stops"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # idx_stops_trip_id
    )
    city_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cities.id"),
        nullable=False,
        index=True,  # idx_stops_city_id
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    position_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────────────
    trip: Mapped["Trip"] = relationship("Trip", back_populates="stops")  # noqa: F821
    city: Mapped["City"] = relationship("City", back_populates="stops")  # noqa: F821
    stop_activities: Mapped[list["StopActivity"]] = relationship(  # noqa: F821
        "StopActivity", back_populates="stop", cascade="all, delete-orphan"
    )
    notes: Mapped[list["Note"]] = relationship("Note", back_populates="stop")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Stop trip={self.trip_id} city={self.city_id} pos={self.position_order}>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
