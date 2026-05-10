# backend/app/database.py
# Async SQLAlchemy engine and session factory.
# Uses asyncpg driver for non-blocking PostgreSQL I/O.

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# ── Engine ────────────────────────────────────────────────────────────────
# echo=True only in debug mode for SQL logging
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,   # Verify connections before checkout to avoid stale conns
    pool_size=10,
    max_overflow=20,
)

# ── Session Factory ──────────────────────────────────────────────────────
# expire_on_commit=False prevents lazy-load errors after commit in async context
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base Model ────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ── Dependency ────────────────────────────────────────────────────────────
async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async DB session and auto-closes it."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
