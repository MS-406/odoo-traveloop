# backend/app/models/__init__.py
# Central import for all models — ensures Alembic metadata picks up every table.
# When adding a new model, import it here so migrations auto-detect it.

from app.models.user import User
from app.models.trip import Trip
from app.models.city import City
from app.models.stop import Stop
from app.models.activity import Activity
from app.models.stop_activity import StopActivity
from app.models.checklist import ChecklistItem
from app.models.note import Note
from app.models.refresh_token import RefreshToken
from app.models.budget_item import BudgetItem

__all__ = [
    "User",
    "Trip",
    "City",
    "Stop",
    "Activity",
    "StopActivity",
    "ChecklistItem",
    "Note",
    "RefreshToken",
    "BudgetItem",
]
