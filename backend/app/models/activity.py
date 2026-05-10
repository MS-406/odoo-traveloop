# backend/app/models/activity.py
# Activity model — things to do in a city, categorized by type.
# Depends on: Phase 1 / database.Base, City model

import uuid

from sqlalchemy import DECIMAL, CheckConstraint, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Valid activity types — enforced at DB level via CHECK constraint
ACTIVITY_TYPES = ("sightseeing", "food", "adventure", "culture", "wellness", "nightlife")


class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = (
        CheckConstraint(
            f"type IN {ACTIVITY_TYPES}",
            name="ck_activities_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True  # idx_activities_type
    )
    cost: Mapped[float] = mapped_column(DECIMAL(10, 2), default=0)
    duration_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    city_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # idx_activities_city_id
    )

    # ── Relationships ─────────────────────────────────────────────────
    city: Mapped["City"] = relationship("City", back_populates="activities")  # noqa: F821
    stop_activities: Mapped[list["StopActivity"]] = relationship(  # noqa: F821
        "StopActivity", back_populates="activity"
    )

    def __repr__(self) -> str:
        return f"<Activity {self.name} ({self.type})>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
