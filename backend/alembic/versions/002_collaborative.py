"""Add collaborative trip planning tables

Revision ID: 002_collaborative
Revises: 81ef354f0f17
Create Date: 2026-05-10 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "002_collaborative"
down_revision: Union[str, None] = "81ef354f0f17"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── collaborative_trips ──────────────────────────────────────────
    op.create_table(
        "collaborative_trips",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), server_default="planning", nullable=False),
        sa.Column("invite_code", sa.String(12), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("status IN ('planning','finalized','archived')", name="ck_collab_trips_status"),
    )
    op.create_index("ix_collab_trips_invite", "collaborative_trips", ["invite_code"], unique=True)

    # ── collab_members ───────────────────────────────────────────────
    op.create_table(
        "collab_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("trip_id", "user_id", name="uq_collab_member"),
        sa.CheckConstraint("role IN ('owner','editor','viewer')", name="ck_collab_members_role"),
    )
    op.create_index("ix_collab_members_trip", "collab_members", ["trip_id"])
    op.create_index("ix_collab_members_user", "collab_members", ["user_id"])

    # ── collab_stops ─────────────────────────────────────────────────
    op.create_table(
        "collab_stops",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("city_name", sa.String(100), nullable=False),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("added_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("position_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_collab_stops_trip", "collab_stops", ["trip_id"])

    # ── collab_votes ─────────────────────────────────────────────────
    op.create_table(
        "collab_votes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("stop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("collab_stops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vote", sa.String(10), nullable=False),
        sa.UniqueConstraint("stop_id", "user_id", name="uq_collab_vote"),
        sa.CheckConstraint("vote IN ('yes','no','maybe')", name="ck_collab_votes_vote"),
    )
    op.create_index("ix_collab_votes_stop", "collab_votes", ["stop_id"])

    # ── collab_comments ──────────────────────────────────────────────
    op.create_table(
        "collab_comments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("collaborative_trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("stop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("collab_stops.id", ondelete="CASCADE"), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_collab_comments_trip", "collab_comments", ["trip_id"])


def downgrade() -> None:
    op.drop_table("collab_comments")
    op.drop_table("collab_votes")
    op.drop_table("collab_stops")
    op.drop_table("collab_members")
    op.drop_table("collaborative_trips")
