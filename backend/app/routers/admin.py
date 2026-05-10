# backend/app/routers/admin.py
# Admin panel router — requires admin role.
import uuid as _uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.schemas.admin import AdminUserRead, AdminStats
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=list[AdminUserRead], summary="List all users (admin)")
async def list_users(admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    svc = AdminService(db)
    return await svc.list_users()

@router.get("/stats", response_model=AdminStats, summary="App-wide stats (admin)")
async def get_stats(admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    svc = AdminService(db)
    return await svc.get_stats()

@router.patch("/users/{user_id}/toggle", response_model=AdminUserRead, summary="Toggle user active status")
async def toggle_user(user_id: str, admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    try: uid = _uuid.UUID(user_id)
    except ValueError: raise HTTPException(400, "Invalid user ID")
    svc = AdminService(db)
    user = await svc.toggle_user_active(uid)
    if not user: raise HTTPException(404, "User not found")
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete user (admin)")
async def delete_user(user_id: str, admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    try: uid = _uuid.UUID(user_id)
    except ValueError: raise HTTPException(400, "Invalid user ID")
    if uid == admin.id: raise HTTPException(400, "Cannot delete yourself")
    svc = AdminService(db)
    if not await svc.delete_user(uid): raise HTTPException(404, "User not found")

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
