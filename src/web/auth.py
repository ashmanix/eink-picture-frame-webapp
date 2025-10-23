import time, secrets
from fastapi import Request, HTTPException, status, Depends
from secrets import compare_digest

from web.constants import TOKEN_TTL_SECS, ADMIN_USER, ADMIN_PASSWORD

TOKENS: dict[str, float] = {}


def _now():
    return time.time()


def _extract_token(request: Request) -> str | None:
    return request.cookies.get("session") or request.headers.get("X-Session")


def check_credentials(username: str, password: str) -> bool:
    if not ADMIN_USER or not ADMIN_PASSWORD:
        return False
    return compare_digest(username, ADMIN_USER) and compare_digest(
        password, ADMIN_PASSWORD
    )


def issue_token() -> str:
    token = secrets.token_urlsafe(32)  # ~192 bits
    TOKENS[token] = _now() + TOKEN_TTL_SECS
    return token


def revoke_token(token: str):
    TOKENS.pop(token, None)


def validate_token(request: Request):
    token = _extract_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )

    # token = request.headers.get("X-Session", "")
    exp = TOKENS.get(token)
    if not exp or exp < _now():
        TOKENS.pop(token, None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )
    return token


def require_session(token: str = Depends(validate_token)):
    return True
