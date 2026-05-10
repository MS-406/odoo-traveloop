# backend/app/models/stop_activity.py
# StopActivity model — junction table linking stops to activities with scheduling.
# Depends on: Phase 1 / database.Base, Stop model, Activity model

import uuid
from datetime import time

from sqlalchemy import ForeignKey, String, Text, Time, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StopActivity(Base):
    __tablename__ = "stop_activities"
    __table_args__ = (
        UniqueConstraint("stop_id", "activity_id", name="uq_stop_activity"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    stop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("stops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,  # idx_stop_activities_stop_id
    )
    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id"),
        nullable=False,
    )
    scheduled_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    custom_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────
    stop: Mapped["Stop"] = relationship("Stop", back_populates="stop_activities")  # noqa: F821
    activity: Mapped["Activity"] = relationship("Activity", back_populates="stop_activities")  # noqa: F821

    def __repr__(self) -> str:
        return f"<StopActivity stop={self.stop_id} activity={self.activity_id}>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
