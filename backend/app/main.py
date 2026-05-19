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
# Allow the React frontend (local dev + production Vercel URL)
# FRONTEND_URL can be comma-separated: "http://localhost:5173,https://my-app.vercel.app"
_origins = [o.strip() for o in settings.FRONTEND_URL.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,          # Required for HTTP-only refresh cookies
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/health", tags=["system"], summary="Health check")
async def health_check():
    """Returns 200 if the API is running."""
    return {"status": "healthy", "app": settings.APP_NAME}


# ── Router Registration ──────────────────────────────────────────────
from app.routers.auth import router as auth_router  # noqa: E402
from app.routers.trips import router as trips_router  # noqa: E402 — Phase 3
from app.routers.stops import router as stops_router  # noqa: E402 — Phase 3
from app.routers.cities import router as cities_router  # noqa: E402 — Phase 4
from app.routers.activities import router as activities_router  # noqa: E402 — Phase 4
from app.routers.budget import router as budget_router  # noqa: E402 — Phase 4
from app.routers.budget_items import router as budget_items_router  # noqa: E402 — Phase 4
from app.routers.notes import router as notes_router  # noqa: E402 — Phase 5
from app.routers.checklist import router as checklist_router  # noqa: E402 — Phase 5
from app.routers.admin import router as admin_router  # noqa: E402 — Phase 6
from app.routers.ai_optimizer import router as ai_router  # noqa: E402 — Feature 1
from app.routers.collaborative import router as collab_router  # noqa: E402 — Feature 2
from app.routers.map_route import router as map_router  # noqa: E402 — Feature 3

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(stops_router)
app.include_router(cities_router)
app.include_router(activities_router)
app.include_router(budget_router)
app.include_router(budget_items_router)
app.include_router(notes_router)
app.include_router(checklist_router)
app.include_router(admin_router)
app.include_router(ai_router)
app.include_router(collab_router)
app.include_router(map_router)

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
