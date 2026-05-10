# backend/app/services/collaborative_service.py
# Business logic for collaborative trip planning.

import secrets
import uuid
from datetime import datetime, timezone

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.collaborative import (
    CollabComment,
    CollabMember,
    CollabStop,
    CollabVote,
    CollaborativeTrip,
)
from app.models.user import User


def _generate_invite_code() -> str:
    """Generate a 12-char alphanumeric invite code like TRVL-XXXX-XXXX."""
    chars = secrets.token_hex(4).upper()[:8]
    return f"TRVL-{chars[:4]}-{chars[4:]}"


class CollaborativeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Trip CRUD ────────────────────────────────────────────────────

    async def list_user_trips(self, user_id: uuid.UUID) -> list[dict]:
        """List all collaborative trips where user is a member or owner."""
        q = (
            select(CollaborativeTrip, CollabMember.role)
            .join(CollabMember, CollabMember.trip_id == CollaborativeTrip.id)
            .where(CollabMember.user_id == user_id)
            .order_by(CollaborativeTrip.updated_at.desc())
        )
        result = await self.db.execute(q)
        rows = result.all()

        trips = []
        for trip, role in rows:
            # Count members and stops
            mc = await self.db.execute(
                select(func.count()).where(CollabMember.trip_id == trip.id)
            )
            sc = await self.db.execute(
                select(func.count()).where(CollabStop.trip_id == trip.id)
            )
            trips.append({
                "id": trip.id,
                "title": trip.title,
                "description": trip.description,
                "owner_id": trip.owner_id,
                "status": trip.status,
                "invite_code": trip.invite_code,
                "created_at": trip.created_at,
                "updated_at": trip.updated_at,
                "member_count": mc.scalar_one(),
                "stop_count": sc.scalar_one(),
                "my_role": role,
            })
        return trips

    async def create_trip(self, user_id: uuid.UUID, title: str, description: str | None) -> CollaborativeTrip:
        """Create a new collaborative trip and add creator as owner."""
        trip = CollaborativeTrip(
            title=title,
            description=description,
            owner_id=user_id,
            invite_code=_generate_invite_code(),
        )
        self.db.add(trip)
        await self.db.flush()

        # Add creator as owner member
        member = CollabMember(
            trip_id=trip.id,
            user_id=user_id,
            role="owner",
        )
        self.db.add(member)
        await self.db.flush()
        return trip

    async def get_trip_detail(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> dict | None:
        """Get full trip detail with members, stops, votes, and comments."""
        # Verify membership
        member = await self._get_member(trip_id, user_id)
        if not member:
            return None

        # Get trip
        q = select(CollaborativeTrip).where(CollaborativeTrip.id == trip_id)
        result = await self.db.execute(q)
        trip = result.scalar_one_or_none()
        if not trip:
            return None

        # Get members with user info
        mq = (
            select(CollabMember, User.full_name, User.email, User.avatar_url)
            .join(User, User.id == CollabMember.user_id)
            .where(CollabMember.trip_id == trip_id)
            .order_by(CollabMember.joined_at)
        )
        members_result = await self.db.execute(mq)
        members = [
            {
                "id": m.id,
                "user_id": m.user_id,
                "role": m.role,
                "joined_at": m.joined_at,
                "full_name": full_name,
                "email": email,
                "avatar_url": avatar_url,
            }
            for m, full_name, email, avatar_url in members_result.all()
        ]

        # Get stops with votes
        sq = (
            select(CollabStop)
            .where(CollabStop.trip_id == trip_id)
            .order_by(CollabStop.position_order, CollabStop.created_at)
        )
        stops_result = await self.db.execute(sq)
        stops_raw = stops_result.scalars().all()

        stops = []
        for s in stops_raw:
            # Get added_by user name
            added_by_name = None
            if s.added_by:
                uq = select(User.full_name).where(User.id == s.added_by)
                ur = await self.db.execute(uq)
                added_by_name = ur.scalar_one_or_none()

            # Get votes for this stop
            vq = (
                select(CollabVote, User.full_name)
                .join(User, User.id == CollabVote.user_id)
                .where(CollabVote.stop_id == s.id)
            )
            votes_result = await self.db.execute(vq)
            votes = [
                {
                    "id": v.id,
                    "user_id": v.user_id,
                    "vote": v.vote,
                    "full_name": fn,
                }
                for v, fn in votes_result.all()
            ]

            vote_summary = {"yes": 0, "no": 0, "maybe": 0}
            for v in votes:
                vote_summary[v["vote"]] += 1

            stops.append({
                "id": s.id,
                "trip_id": s.trip_id,
                "city_name": s.city_name,
                "country": s.country,
                "start_date": s.start_date,
                "end_date": s.end_date,
                "notes": s.notes,
                "added_by": s.added_by,
                "added_by_name": added_by_name,
                "position_order": s.position_order,
                "created_at": s.created_at,
                "votes": votes,
                "vote_summary": vote_summary,
            })

        # Get comments
        cq = (
            select(CollabComment, User.full_name, User.avatar_url)
            .join(User, User.id == CollabComment.user_id)
            .where(CollabComment.trip_id == trip_id)
            .order_by(CollabComment.created_at.desc())
            .limit(100)
        )
        comments_result = await self.db.execute(cq)
        comments = [
            {
                "id": c.id,
                "trip_id": c.trip_id,
                "stop_id": c.stop_id,
                "user_id": c.user_id,
                "content": c.content,
                "created_at": c.created_at,
                "full_name": fn,
                "avatar_url": av,
            }
            for c, fn, av in comments_result.all()
        ]

        return {
            "id": trip.id,
            "title": trip.title,
            "description": trip.description,
            "owner_id": trip.owner_id,
            "status": trip.status,
            "invite_code": trip.invite_code,
            "created_at": trip.created_at,
            "updated_at": trip.updated_at,
            "member_count": len(members),
            "stop_count": len(stops),
            "my_role": member.role,
            "members": members,
            "stops": stops,
            "comments": comments,
        }

    async def update_trip(
        self, trip_id: uuid.UUID, user_id: uuid.UUID, data: dict
    ) -> CollaborativeTrip | None:
        """Update trip (owner only)."""
        member = await self._get_member(trip_id, user_id)
        if not member or member.role != "owner":
            return None

        data["updated_at"] = datetime.now(timezone.utc)
        await self.db.execute(
            update(CollaborativeTrip)
            .where(CollaborativeTrip.id == trip_id)
            .values(**{k: v for k, v in data.items() if v is not None})
        )
        await self.db.flush()

        result = await self.db.execute(
            select(CollaborativeTrip).where(CollaborativeTrip.id == trip_id)
        )
        return result.scalar_one_or_none()

    async def delete_trip(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Delete trip (owner only)."""
        member = await self._get_member(trip_id, user_id)
        if not member or member.role != "owner":
            return False

        await self.db.execute(
            delete(CollaborativeTrip).where(CollaborativeTrip.id == trip_id)
        )
        return True

    # ── Membership ───────────────────────────────────────────────────

    async def join_trip(self, invite_code: str, user_id: uuid.UUID) -> CollabMember | None:
        """Join a trip using invite code."""
        q = select(CollaborativeTrip).where(CollaborativeTrip.invite_code == invite_code)
        result = await self.db.execute(q)
        trip = result.scalar_one_or_none()
        if not trip:
            return None

        # Check if already a member
        existing = await self._get_member(trip.id, user_id)
        if existing:
            return existing

        member = CollabMember(
            trip_id=trip.id,
            user_id=user_id,
            role="editor",
        )
        self.db.add(member)
        # Touch updated_at
        await self.db.execute(
            update(CollaborativeTrip)
            .where(CollaborativeTrip.id == trip.id)
            .values(updated_at=datetime.now(timezone.utc))
        )
        await self.db.flush()
        return member

    async def leave_trip(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Leave a trip (non-owners only)."""
        member = await self._get_member(trip_id, user_id)
        if not member or member.role == "owner":
            return False

        await self.db.execute(
            delete(CollabMember)
            .where(CollabMember.trip_id == trip_id, CollabMember.user_id == user_id)
        )
        return True

    async def remove_member(
        self, trip_id: uuid.UUID, owner_id: uuid.UUID, target_user_id: uuid.UUID
    ) -> bool:
        """Remove a member (owner only, can't remove self)."""
        owner_member = await self._get_member(trip_id, owner_id)
        if not owner_member or owner_member.role != "owner":
            return False

        if owner_id == target_user_id:
            return False

        await self.db.execute(
            delete(CollabMember)
            .where(CollabMember.trip_id == trip_id, CollabMember.user_id == target_user_id)
        )
        return True

    async def change_role(
        self, trip_id: uuid.UUID, owner_id: uuid.UUID, target_user_id: uuid.UUID, new_role: str
    ) -> bool:
        """Change a member's role (owner only)."""
        owner_member = await self._get_member(trip_id, owner_id)
        if not owner_member or owner_member.role != "owner":
            return False

        if owner_id == target_user_id:
            return False

        await self.db.execute(
            update(CollabMember)
            .where(CollabMember.trip_id == trip_id, CollabMember.user_id == target_user_id)
            .values(role=new_role)
        )
        return True

    # ── Stops ────────────────────────────────────────────────────────

    async def add_stop(
        self, trip_id: uuid.UUID, user_id: uuid.UUID, data: dict
    ) -> CollabStop | None:
        """Add a stop (editor/owner only)."""
        member = await self._get_member(trip_id, user_id)
        if not member or member.role == "viewer":
            return None

        stop = CollabStop(
            trip_id=trip_id,
            city_name=data["city_name"],
            country=data.get("country"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            notes=data.get("notes"),
            added_by=user_id,
            position_order=data.get("position_order", 0),
        )
        self.db.add(stop)
        await self._touch_updated(trip_id)
        await self.db.flush()
        return stop

    async def update_stop(
        self, trip_id: uuid.UUID, stop_id: uuid.UUID, user_id: uuid.UUID, data: dict
    ) -> CollabStop | None:
        """Update a stop (editor/owner only)."""
        member = await self._get_member(trip_id, user_id)
        if not member or member.role == "viewer":
            return None

        clean_data = {k: v for k, v in data.items() if v is not None}
        if not clean_data:
            result = await self.db.execute(select(CollabStop).where(CollabStop.id == stop_id))
            return result.scalar_one_or_none()

        await self.db.execute(
            update(CollabStop).where(CollabStop.id == stop_id, CollabStop.trip_id == trip_id).values(**clean_data)
        )
        await self._touch_updated(trip_id)
        await self.db.flush()

        result = await self.db.execute(select(CollabStop).where(CollabStop.id == stop_id))
        return result.scalar_one_or_none()

    async def delete_stop(
        self, trip_id: uuid.UUID, stop_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        """Delete a stop (editor/owner only)."""
        member = await self._get_member(trip_id, user_id)
        if not member or member.role == "viewer":
            return False

        await self.db.execute(
            delete(CollabStop).where(CollabStop.id == stop_id, CollabStop.trip_id == trip_id)
        )
        await self._touch_updated(trip_id)
        return True

    # ── Votes ────────────────────────────────────────────────────────

    async def upsert_vote(
        self, trip_id: uuid.UUID, stop_id: uuid.UUID, user_id: uuid.UUID, vote_value: str
    ) -> CollabVote:
        """Upsert a vote on a stop."""
        member = await self._get_member(trip_id, user_id)
        if not member:
            raise PermissionError("Not a member")

        # Check existing vote
        q = select(CollabVote).where(
            CollabVote.stop_id == stop_id, CollabVote.user_id == user_id
        )
        result = await self.db.execute(q)
        existing = result.scalar_one_or_none()

        if existing:
            existing.vote = vote_value
            await self.db.flush()
            return existing
        else:
            vote = CollabVote(
                trip_id=trip_id,
                stop_id=stop_id,
                user_id=user_id,
                vote=vote_value,
            )
            self.db.add(vote)
            await self._touch_updated(trip_id)
            await self.db.flush()
            return vote

    # ── Comments ─────────────────────────────────────────────────────

    async def add_comment(
        self, trip_id: uuid.UUID, user_id: uuid.UUID, content: str, stop_id: uuid.UUID | None = None
    ) -> CollabComment | None:
        """Add a comment (any member)."""
        member = await self._get_member(trip_id, user_id)
        if not member:
            return None

        comment = CollabComment(
            trip_id=trip_id,
            stop_id=stop_id,
            user_id=user_id,
            content=content,
        )
        self.db.add(comment)
        await self._touch_updated(trip_id)
        await self.db.flush()
        return comment

    async def list_comments(
        self, trip_id: uuid.UUID, user_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> list[dict]:
        """List comments for a trip."""
        member = await self._get_member(trip_id, user_id)
        if not member:
            return []

        cq = (
            select(CollabComment, User.full_name, User.avatar_url)
            .join(User, User.id == CollabComment.user_id)
            .where(CollabComment.trip_id == trip_id)
            .order_by(CollabComment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db.execute(cq)
        return [
            {
                "id": c.id,
                "trip_id": c.trip_id,
                "stop_id": c.stop_id,
                "user_id": c.user_id,
                "content": c.content,
                "created_at": c.created_at,
                "full_name": fn,
                "avatar_url": av,
            }
            for c, fn, av in result.all()
        ]

    # ── Polling ──────────────────────────────────────────────────────

    async def poll(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> dict | None:
        """Light polling endpoint returning updated_at and counts."""
        member = await self._get_member(trip_id, user_id)
        if not member:
            return None

        q = select(CollaborativeTrip.updated_at).where(CollaborativeTrip.id == trip_id)
        result = await self.db.execute(q)
        updated_at = result.scalar_one_or_none()
        if not updated_at:
            return None

        mc = await self.db.execute(select(func.count()).where(CollabMember.trip_id == trip_id))
        sc = await self.db.execute(select(func.count()).where(CollabStop.trip_id == trip_id))

        # Latest 5 comments
        cq = (
            select(CollabComment, User.full_name, User.avatar_url)
            .join(User, User.id == CollabComment.user_id)
            .where(CollabComment.trip_id == trip_id)
            .order_by(CollabComment.created_at.desc())
            .limit(5)
        )
        comments_result = await self.db.execute(cq)
        latest = [
            {
                "id": c.id,
                "trip_id": c.trip_id,
                "stop_id": c.stop_id,
                "user_id": c.user_id,
                "content": c.content,
                "created_at": c.created_at,
                "full_name": fn,
                "avatar_url": av,
            }
            for c, fn, av in comments_result.all()
        ]

        return {
            "updated_at": updated_at,
            "member_count": mc.scalar_one(),
            "stop_count": sc.scalar_one(),
            "latest_comments": latest,
        }

    # ── Internal Helpers ─────────────────────────────────────────────

    async def _get_member(self, trip_id: uuid.UUID, user_id: uuid.UUID) -> CollabMember | None:
        q = select(CollabMember).where(
            CollabMember.trip_id == trip_id, CollabMember.user_id == user_id
        )
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def _touch_updated(self, trip_id: uuid.UUID) -> None:
        await self.db.execute(
            update(CollaborativeTrip)
            .where(CollaborativeTrip.id == trip_id)
            .values(updated_at=datetime.now(timezone.utc))
        )
