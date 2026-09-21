from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException

from app.auth import require_crm_admin


@pytest.mark.asyncio
async def test_admin_role_token_is_accepted():
    token = jwt.encode(
        {
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
            "uid": "123",
            "role": "Admin",
        },
        "change-me-in-env",
        algorithm="HS256",
    )

    principal = await require_crm_admin(f"Bearer {token}")
    assert principal.subject == "123"
    assert principal.role == "Admin"


@pytest.mark.asyncio
async def test_non_admin_token_is_rejected():
    token = jwt.encode(
        {
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
            "uid": "123",
            "role": "User",
        },
        "change-me-in-env",
        algorithm="HS256",
    )

    with pytest.raises(HTTPException) as exc:
        await require_crm_admin(f"Bearer {token}")

    assert exc.value.status_code == 403
