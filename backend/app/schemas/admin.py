# backend/app/schemas/admin.py
# Admin panel schemas.
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AdminUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: str
    full_name: str
    is_admin: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_trips: int
    total_cities: int
    total_activities: int


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
