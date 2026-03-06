import base64
import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import timedelta

from django.utils import timezone


SESSION_COOKIE_NAME = 'app_session'
PBKDF2_ITERATIONS = 260000
SESSION_TTL = timedelta(days=7)


def _b64encode(raw: bytes) -> str:
    return base64.b64encode(raw).decode('ascii')


def _b64decode(val: str) -> bytes:
    return base64.b64decode(val.encode('ascii'))


def hash_password(password: str, *, salt_b64: str | None = None, iterations: int = PBKDF2_ITERATIONS) -> tuple[str, str, int]:
    if salt_b64 is None:
        salt = secrets.token_bytes(16)
        salt_b64 = _b64encode(salt)
    else:
        salt = _b64decode(salt_b64)

    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return salt_b64, _b64encode(dk), iterations


def verify_password(password: str, *, salt_b64: str, password_hash_b64: str, iterations: int) -> bool:
    _, computed_hash_b64, _ = hash_password(password, salt_b64=salt_b64, iterations=iterations)
    return hmac.compare_digest(computed_hash_b64, password_hash_b64)


def create_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


@dataclass(frozen=True)
class SessionTimes:
    created_at: timezone.datetime
    expires_at: timezone.datetime


def get_session_times() -> SessionTimes:
    created_at = timezone.now()
    return SessionTimes(created_at=created_at, expires_at=created_at + SESSION_TTL)
