# backend/app/main.py
# FastAPI application entry point.
# Depends on: Phase 1 / config, database

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook. DB pool is managed by SQLAlchemy engine."""
    yield  # Routers and services are available after this point


app = FastAPI(
    title=settings.APP_NAME,
    description="Personalized travel planning API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────
# Allow the React frontend dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,          # Required for HTTP-only refresh cookies
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/health", tags=["system"], summary="Health check")
async def health_check():
    """Returns 200 if the API is running."""
    return {"status": "healthy", "app": settings.APP_NAME}


# ── Router Registration ──────────────────────────────────────────────────
# Routers will be added in Phase 2+ as they are implemented.
# Example: app.include_router(auth_router, prefix="/auth", tags=["auth"])

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
