from dataclasses import dataclass
from typing import Any

import jwt
from fastapi import Header, HTTPException, status

from app.config import get_settings


@dataclass(frozen=True)
class AdminPrincipal:
    subject: str | None
    role: str
    claims: dict[str, Any]


def _extract_role(claims: dict[str, Any]) -> str | None:
    for key in ("role", "type", "userType", "user_type"):
        value = claims.get(key)
        if isinstance(value, str) and value:
            return value

    user = claims.get("user")
    if isinstance(user, dict):
        for key in ("role", "type", "userType", "user_type"):
            value = user.get(key)
            if isinstance(value, str) and value:
                return value

    return None


async def require_crm_admin(authorization: str | None = Header(default=None)) -> AdminPrincipal:
    settings = get_settings()

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        claims = jwt.decode(
            token,
            settings.routesurvey_jwt_secret,
            algorithms=[settings.routesurvey_jwt_algorithm],
            options={"require": ["exp"]},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token") from exc

    role = _extract_role(claims)
    subject_value = claims.get("sub") or claims.get("uid") or claims.get("userId") or claims.get("user_id")
    subject = str(subject_value) if subject_value is not None else None

    role_allowed = role in settings.crm_admin_roles
    subject_allowed = bool(subject and subject in settings.crm_admin_subjects)

    if not role_allowed and not subject_allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CRM admin authorization required")

    return AdminPrincipal(
        subject=subject,
        role=role or "allowlisted-admin",
        claims=claims,
    )
