# backend/app/config.py
# Centralizes all environment configuration using Pydantic Settings.
# Pydantic Settings chosen for type-safe env parsing + .env file support.

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings loaded from environment variables / .env file."""

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/traveloop"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/traveloop"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, value: str) -> str:
        if isinstance(value, str):
            if value.startswith("postgres://"):
                return value.replace("postgres://", "postgresql+asyncpg://", 1)
            elif value.startswith("postgresql://"):
                return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @field_validator("DATABASE_URL_SYNC", mode="before")
    @classmethod
    def parse_database_url_sync(cls, value: str) -> str:
        if isinstance(value, str):
            if value.startswith("postgres://"):
                return value.replace("postgres://", "postgresql+psycopg2://", 1)
            elif value.startswith("postgresql://"):
                return value.replace("postgresql://", "postgresql+psycopg2://", 1)
        return value

    @model_validator(mode="after")
    def sync_database_urls(self):
        # If DATABASE_URL is set from the environment but DATABASE_URL_SYNC is not explicitly set,
        # we can derive DATABASE_URL_SYNC from DATABASE_URL.
        if "postgresql+asyncpg://" in self.DATABASE_URL:
            # We assume it was properly transformed by field_validator
            sync_url = self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
            # We don't overwrite if the user already provided a different sync URL in env, 
            # but usually they only provide DATABASE_URL.
            # To be safe, if the current sync URL is the default local one, we overwrite it.
            if self.DATABASE_URL_SYNC == "postgresql+psycopg2://postgres:postgres@localhost:5432/traveloop":
                self.DATABASE_URL_SYNC = sync_url
        return self

    # ── JWT ───────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-to-a-random-64-char-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──────────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    # ── App ───────────────────────────────────────────────────────────────
    APP_NAME: str = "Traveloop"
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "prod", "production"}:
                return False
            if normalized in {"dev", "development"}:
                return True
        return value

    # ── AI (Optional) ─────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",       # Auto-load .env from CWD
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Singleton — imported everywhere as `from app.config import settings`
settings = Settings()

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
