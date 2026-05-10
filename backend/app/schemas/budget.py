# backend/app/schemas/budget.py
# Pydantic v2 schemas for budget breakdown responses.
# Depends on: Phase 4 / budget_service.py

from decimal import Decimal

from pydantic import BaseModel


class CategoryBreakdown(BaseModel):
    """Budget breakdown for a single activity category."""
    category: str
    total_cost: Decimal
    activity_count: int
    percentage: float  # 0-100


class StopBudget(BaseModel):
    """Budget for a single stop (city visit)."""
    stop_id: str
    city_name: str
    total_cost: Decimal
    activity_count: int


class BudgetSummary(BaseModel):
    """Complete budget summary for a trip."""
    trip_id: str
    trip_name: str
    total_budget: Decimal
    cost_per_day: Decimal
    trip_duration_days: int
    category_breakdown: list[CategoryBreakdown]
    stop_breakdown: list[StopBudget]

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
