from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.crm import EmailCreate, EvidenceCreate


def test_email_requires_exactly_one_owner():
    with pytest.raises(ValidationError):
        EmailCreate(email="test@example.com")

    with pytest.raises(ValidationError):
        EmailCreate(
            email="test@example.com",
            person_id=uuid4(),
            company_id=uuid4(),
        )


def test_evidence_requires_exactly_one_subject():
    with pytest.raises(ValidationError):
        EvidenceCreate(source_id="source-1")

    with pytest.raises(ValidationError):
        EvidenceCreate(
            source_id="source-1",
            person_id=uuid4(),
            company_id=uuid4(),
        )
