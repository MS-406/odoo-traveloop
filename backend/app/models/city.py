# backend/app/models/city.py
# City model — reference data for searchable destinations.
# Depends on: Phase 1 / database.Base

import uuid

from sqlalchemy import DECIMAL, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class City(Base):
    __tablename__ = "cities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True  # idx_cities_name
    )
    country: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True  # idx_cities_country
    )
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cost_index: Mapped[float | None] = mapped_column(
        DECIMAL(5, 2), nullable=True  # 1.0 = cheap, 5.0 = expensive
    )
    popularity_score: Mapped[float | None] = mapped_column(
        DECIMAL(5, 2), nullable=True  # 1.0–10.0 scale
    )
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(DECIMAL(9, 6), nullable=True)
    longitude: Mapped[float | None] = mapped_column(DECIMAL(9, 6), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────
    stops: Mapped[list["Stop"]] = relationship("Stop", back_populates="city")  # noqa: F821
    activities: Mapped[list["Activity"]] = relationship(  # noqa: F821
        "Activity", back_populates="city", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<City {self.name}, {self.country}>"

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled N/A
