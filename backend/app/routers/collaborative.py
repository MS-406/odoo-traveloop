# backend/app/routers/collaborative.py
# Collaborative trip planning API endpoints.
# Depends on: collaborative models, schemas, service

import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.collaborative import (
    CollabCommentCreate,
    CollabCommentRead,
    CollabPollResponse,
    CollabRoleUpdate,
    CollabStopCreate,
    CollabStopUpdate,
    CollabTripCreate,
    CollabTripDetail,
    CollabTripRead,
    CollabTripUpdate,
    CollabVoteCreate,
)
from app.services.collaborative_service import CollaborativeService

router = APIRouter(prefix="/collaborative", tags=["collaborative"])


def _parse_uuid(value: str) -> _uuid.UUID:
    try:
        return _uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")


# ── Trip CRUD ────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=list[CollabTripRead],
    summary="List user's collaborative trips",
)
async def list_collab_trips(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CollaborativeService(db)
    trips = await service.list_user_trips(user.id)
    return trips


@router.post(
    "",
    response_model=CollabTripRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a collaborative trip",
)
async def create_collab_trip(
    body: CollabTripCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CollaborativeService(db)
    trip = await service.create_trip(user.id, body.title, body.description)
    return CollabTripRead(
        id=trip.id,
        title=trip.title,
        description=trip.description,
        owner_id=trip.owner_id,
        status=trip.status,
        invite_code=trip.invite_code,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
        member_count=1,
        stop_count=0,
        my_role="owner",
    )


@router.get(
    "/{trip_id}",
    response_model=CollabTripDetail,
    summary="Get collaborative trip detail",
)
async def get_collab_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    detail = await service.get_trip_detail(tid, user.id)
    if not detail:
        raise HTTPException(status_code=404, detail="Trip not found or access denied")
    return detail


@router.put(
    "/{trip_id}",
    response_model=CollabTripRead,
    summary="Update collaborative trip (owner only)",
)
async def update_collab_trip(
    trip_id: str,
    body: CollabTripUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    trip = await service.update_trip(tid, user.id, body.model_dump(exclude_unset=True))
    if not trip:
        raise HTTPException(status_code=403, detail="Not authorized or trip not found")
    return trip


@router.delete(
    "/{trip_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete collaborative trip (owner only)",
)
async def delete_collab_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    deleted = await service.delete_trip(tid, user.id)
    if not deleted:
        raise HTTPException(status_code=403, detail="Not authorized or trip not found")
    return None


# ── Membership ───────────────────────────────────────────────────────

@router.post(
    "/join/{invite_code}",
    response_model=dict,
    summary="Join a collaborative trip using invite code",
)
async def join_collab_trip(
    invite_code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CollaborativeService(db)
    member = await service.join_trip(invite_code, user.id)
    if not member:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    return {"message": "Joined successfully", "trip_id": str(member.trip_id), "role": member.role}


@router.delete(
    "/{trip_id}/leave",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Leave a collaborative trip",
)
async def leave_collab_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    left = await service.leave_trip(tid, user.id)
    if not left:
        raise HTTPException(status_code=400, detail="Cannot leave (owner cannot leave their own trip)")
    return None


@router.delete(
    "/{trip_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a member (owner only)",
)
async def remove_member(
    trip_id: str,
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    target_uid = _parse_uuid(user_id)
    service = CollaborativeService(db)
    removed = await service.remove_member(tid, user.id, target_uid)
    if not removed:
        raise HTTPException(status_code=403, detail="Not authorized or invalid target")
    return None


@router.patch(
    "/{trip_id}/members/{user_id}/role",
    response_model=dict,
    summary="Change member role (owner only)",
)
async def change_member_role(
    trip_id: str,
    user_id: str,
    body: CollabRoleUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    target_uid = _parse_uuid(user_id)
    service = CollaborativeService(db)
    changed = await service.change_role(tid, user.id, target_uid, body.role)
    if not changed:
        raise HTTPException(status_code=403, detail="Not authorized or invalid target")
    return {"message": "Role updated", "new_role": body.role}


# ── Stops ────────────────────────────────────────────────────────────

@router.post(
    "/{trip_id}/stops",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Add a stop to collaborative trip",
)
async def add_collab_stop(
    trip_id: str,
    body: CollabStopCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    stop = await service.add_stop(tid, user.id, body.model_dump())
    if not stop:
        raise HTTPException(status_code=403, detail="Not authorized (viewer role)")
    return {"id": str(stop.id), "message": "Stop added"}


@router.put(
    "/{trip_id}/stops/{stop_id}",
    response_model=dict,
    summary="Update a stop",
)
async def update_collab_stop(
    trip_id: str,
    stop_id: str,
    body: CollabStopUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    sid = _parse_uuid(stop_id)
    service = CollaborativeService(db)
    stop = await service.update_stop(tid, sid, user.id, body.model_dump(exclude_unset=True))
    if not stop:
        raise HTTPException(status_code=403, detail="Not authorized or stop not found")
    return {"message": "Stop updated"}


@router.delete(
    "/{trip_id}/stops/{stop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a stop",
)
async def delete_collab_stop(
    trip_id: str,
    stop_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    sid = _parse_uuid(stop_id)
    service = CollaborativeService(db)
    deleted = await service.delete_stop(tid, sid, user.id)
    if not deleted:
        raise HTTPException(status_code=403, detail="Not authorized or stop not found")
    return None


# ── Votes ────────────────────────────────────────────────────────────

@router.post(
    "/{trip_id}/stops/{stop_id}/vote",
    response_model=dict,
    summary="Vote on a stop (yes/no/maybe)",
)
async def vote_on_stop(
    trip_id: str,
    stop_id: str,
    body: CollabVoteCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    sid = _parse_uuid(stop_id)
    service = CollaborativeService(db)
    try:
        vote = await service.upsert_vote(tid, sid, user.id, body.vote)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not a member of this trip")
    return {"message": "Vote recorded", "vote": vote.vote}


# ── Comments ─────────────────────────────────────────────────────────

@router.post(
    "/{trip_id}/comments",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Add a comment",
)
async def add_comment(
    trip_id: str,
    body: CollabCommentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    comment = await service.add_comment(tid, user.id, body.content, body.stop_id)
    if not comment:
        raise HTTPException(status_code=403, detail="Not a member of this trip")
    return {"id": str(comment.id), "message": "Comment added"}


@router.get(
    "/{trip_id}/comments",
    response_model=list[CollabCommentRead],
    summary="List comments (paginated)",
)
async def list_comments(
    trip_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    return await service.list_comments(tid, user.id, limit, offset)


# ── Polling ──────────────────────────────────────────────────────────

@router.get(
    "/{trip_id}/poll",
    response_model=CollabPollResponse,
    summary="Poll for updates (use with 10s interval)",
)
async def poll_trip(
    trip_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tid = _parse_uuid(trip_id)
    service = CollaborativeService(db)
    result = await service.poll(tid, user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Trip not found or access denied")
    return result
