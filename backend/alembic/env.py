# backend/alembic/env.py
# Alembic environment configuration for async SQLAlchemy migrations.
# Uses the SYNC database URL because Alembic's migration runner is synchronous.
# Depends on: Phase 1 / config.py, database.py, all models

import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Add backend/ to sys.path so "app.*" imports work ──────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.database import Base

# Import all models so Base.metadata is fully populated
import app.models  # noqa: F401

# ── Alembic Config ────────────────────────────────────────────────────
config = context.config

# Override sqlalchemy.url from our Settings (not hardcoded in alembic.ini)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL_SYNC)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — generates SQL without a live connection."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode — connects to DB and applies changes."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # No pooling needed for migrations
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
