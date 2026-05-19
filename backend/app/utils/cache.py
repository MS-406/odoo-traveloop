# backend/app/utils/cache.py
# Lightweight in-memory TTL cache — no Redis dependency required.
# Used to cache expensive reads (cities list, activities list, AI results).

import time
import hashlib
import json
from threading import Lock
from typing import Any

_store: dict[str, tuple[Any, float]] = {}  # key -> (value, expires_at)
_lock = Lock()


def _make_key(namespace: str, data: Any) -> str:
    """Create a deterministic cache key from namespace + JSON-serializable data."""
    raw = json.dumps(data, sort_keys=True, default=str)
    h = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"{namespace}:{h}"


def cache_get(key: str) -> Any | None:
    """Return cached value if not expired, else None."""
    with _lock:
        entry = _store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.monotonic() > expires_at:
            del _store[key]
            return None
        return value


def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """Store a value with a TTL (default 5 minutes)."""
    with _lock:
        _store[key] = (value, time.monotonic() + ttl_seconds)


def cache_delete(key: str) -> None:
    """Invalidate a single cache entry."""
    with _lock:
        _store.pop(key, None)


def cache_clear_namespace(namespace: str) -> None:
    """Invalidate all entries whose key starts with namespace."""
    with _lock:
        to_delete = [k for k in _store if k.startswith(f"{namespace}:")]
        for k in to_delete:
            del _store[k]


def make_key(namespace: str, data: Any) -> str:
    """Public wrapper for _make_key."""
    return _make_key(namespace, data)
