# backend/app/models/collaborative.py
# SQLAlchemy models for collaborative trip planning feature.

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CollaborativeTrip(Base):
    __tablename__ = "collaborative_trips"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="planning")
    invite_code: Mapped[str] = mapped_column(String(16), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_id])  # noqa: F821
    members: Mapped[list["CollabMember"]] = relationship(
        "CollabMember", back_populates="trip", cascade="all, delete-orphan"
    )
    stops: Mapped[list["CollabStop"]] = relationship(
        "CollabStop", back_populates="trip", cascade="all, delete-orphan"
    )
    comments: Mapped[list["CollabComment"]] = relationship(
        "CollabComment", back_populates="trip", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<CollaborativeTrip {self.title}>"


class CollabMember(Base):
    __tablename__ = "collab_members"
    __table_args__ = (
        UniqueConstraint("trip_id", "user_id", name="uq_collab_member"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(String(10), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    trip: Mapped["CollaborativeTrip"] = relationship("CollaborativeTrip", back_populates="members")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])  # noqa: F821


class CollabStop(Base):
    __tablename__ = "collab_stops"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    city_name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    start_date = mapped_column(Date, nullable=True)
    end_date = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    added_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    position_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    trip: Mapped["CollaborativeTrip"] = relationship("CollaborativeTrip", back_populates="stops")
    added_by_user: Mapped["User | None"] = relationship("User", foreign_keys=[added_by])  # noqa: F821
    votes: Mapped[list["CollabVote"]] = relationship(
        "CollabVote", back_populates="stop", cascade="all, delete-orphan"
    )


class CollabVote(Base):
    __tablename__ = "collab_votes"
    __table_args__ = (
        UniqueConstraint("stop_id", "user_id", name="uq_collab_vote"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False
    )
    stop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("collab_stops.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    vote: Mapped[str] = mapped_column(String(10), nullable=False)

    # Relationships
    stop: Mapped["CollabStop"] = relationship("CollabStop", back_populates="votes")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])  # noqa: F821


class CollabComment(Base):
    __tablename__ = "collab_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stop_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("collab_stops.id", ondelete="CASCADE"), nullable=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    trip: Mapped["CollaborativeTrip"] = relationship("CollaborativeTrip", back_populates="comments")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])  # noqa: F821
