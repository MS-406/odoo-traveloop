# backend/app/routers/budget.py
# Budget summary router — computes trip budget from stop_activities.
# Depends on: Phase 2 / auth dependencies
# Depends on: Phase 4 / budget_service, budget schemas

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

import uuid as _uuid

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetSummary
from app.services.budget_service import BudgetService

router = APIRouter(tags=["budget"])


# ── GET /trips/{id}/budget ───────────────────────────────────────────
@router.get(
    "/trips/{trip_id}/budget",
    response_model=BudgetSummary,
    summary="Get trip budget breakdown",
    description="Computes budget from all activities attached to stops in this trip.",
)
async def get_budget(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        tid = _uuid.UUID(trip_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid trip ID format")

    service = BudgetService(db)
    budget = await service.compute_budget(tid, user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Trip not found")
    return budget

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
