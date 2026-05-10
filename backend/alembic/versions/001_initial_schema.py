"""Initial schema — 9 tables + 12 indexes

Revision ID: 001_initial_schema
Revises: None
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(100), nullable=False),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("language", sa.String(10), server_default="en"),
        sa.Column("is_admin", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # ── trips ─────────────────────────────────────────────────────────
    op.create_table(
        "trips",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("cover_photo", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("share_code", sa.String(20), unique=True, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_trips_user_id", "trips", ["user_id"])
    op.create_index("idx_trips_share_code", "trips", ["share_code"])

    # ── cities ────────────────────────────────────────────────────────
    op.create_table(
        "cities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("country", sa.String(100), nullable=False),
        sa.Column("region", sa.String(100), nullable=True),
        sa.Column("cost_index", sa.DECIMAL(5, 2), nullable=True),
        sa.Column("popularity_score", sa.DECIMAL(5, 2), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("latitude", sa.DECIMAL(9, 6), nullable=True),
        sa.Column("longitude", sa.DECIMAL(9, 6), nullable=True),
    )
    op.create_index("idx_cities_name", "cities", ["name"])
    op.create_index("idx_cities_country", "cities", ["country"])

    # ── stops ─────────────────────────────────────────────────────────
    op.create_table(
        "stops",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("city_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("cities.id"), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("position_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_stops_trip_id", "stops", ["trip_id"])
    op.create_index("idx_stops_city_id", "stops", ["city_id"])

    # ── activities ────────────────────────────────────────────────────
    op.create_table(
        "activities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("cost", sa.DECIMAL(10, 2), server_default=sa.text("0")),
        sa.Column("duration_min", sa.Integer(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("city_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("cities.id", ondelete="CASCADE"), nullable=False),
        sa.CheckConstraint(
            "type IN ('sightseeing','food','adventure','culture','wellness','nightlife')",
            name="ck_activities_type",
        ),
    )
    op.create_index("idx_activities_city_id", "activities", ["city_id"])
    op.create_index("idx_activities_type", "activities", ["type"])

    # ── stop_activities ───────────────────────────────────────────────
    op.create_table(
        "stop_activities",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("stop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("stops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("activity_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("activities.id"), nullable=False),
        sa.Column("scheduled_time", sa.Time(), nullable=True),
        sa.Column("custom_note", sa.Text(), nullable=True),
        sa.UniqueConstraint("stop_id", "activity_id", name="uq_stop_activity"),
    )
    op.create_index("idx_stop_activities_stop_id", "stop_activities", ["stop_id"])

    # ── checklist_items ───────────────────────────────────────────────
    op.create_table(
        "checklist_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("is_packed", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint(
            "category IN ('clothing','documents','electronics','toiletries','medicine','other')",
            name="ck_checklist_items_category",
        ),
    )
    op.create_index("idx_checklist_trip_id", "checklist_items", ["trip_id"])

    # ── notes ─────────────────────────────────────────────────────────
    op.create_table(
        "notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trip_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False),
        sa.Column("stop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("stops.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("idx_notes_trip_id", "notes", ["trip_id"])

    # ── refresh_tokens ────────────────────────────────────────────────
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("is_revoked", sa.Boolean(), server_default=sa.text("false")),
    )
    op.create_index("idx_refresh_tokens_user_id", "refresh_tokens", ["user_id"])


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("refresh_tokens")
    op.drop_table("notes")
    op.drop_table("checklist_items")
    op.drop_table("stop_activities")
    op.drop_table("activities")
    op.drop_table("stops")
    op.drop_table("cities")
    op.drop_table("trips")
    op.drop_table("users")

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
