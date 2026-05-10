# backend/app/utils/password.py
# Bcrypt password hashing utilities.
# Using bcrypt directly instead of passlib — passlib has compatibility issues
# with bcrypt>=4.1 on Python 3.12+ (detect_wrap_bug ValueError).
# Depends on: Phase 1 / requirements.txt (passlib[bcrypt])

import bcrypt


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    # Encode to bytes, generate salt, and hash
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)  # 12 rounds balances security vs speed
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False

# SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
