from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SourceUpsert(BaseModel):
    id: str
    name: str
    source_type: str
    access_class: str
    source_url: str | None = None
    metadata_json: dict[str, Any] = Field(default_factory=dict)


class SourceOut(SourceUpsert, OrmModel):
    created_at: datetime
    updated_at: datetime


class CompanyCreate(BaseModel):
    canonical_name: str
    match_key: str
    website: str | None = None
    linkedin_url: str | None = None
    country: str | None = None
    region: str | None = None
    verification_state: str = "unverified"
    sector_relevance_score: int | None = Field(default=None, ge=0, le=100)
    commercial_engagement_score: int | None = Field(default=None, ge=0, le=100)
    specialties: list[str] = Field(default_factory=list)
    notes: str | None = None


class CompanyOut(CompanyCreate, OrmModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class PersonCreate(BaseModel):
    company_id: UUID | None = None
    routesurvey_user_id: str | None = None
    full_name: str
    title: str | None = None
    linkedin_url: str | None = None
    country: str | None = None
    region: str | None = None
    languages: list[str] = Field(default_factory=list)
    credentials: list[str] = Field(default_factory=list)
    specialties: list[str] = Field(default_factory=list)
    verification_state: str = "unverified"
    notes: str | None = None


class PersonOut(PersonCreate, OrmModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class EmailCreate(BaseModel):
    person_id: UUID | None = None
    company_id: UUID | None = None
    email: EmailStr
    email_type: str = "unknown"
    basis: str | None = None
    verification_status: str = "unverified"
    verification_provider: str | None = None
    verified_at: datetime | None = None
    is_primary: bool = False

    @model_validator(mode="after")
    def exactly_one_owner(self):
        if bool(self.person_id) == bool(self.company_id):
            raise ValueError("Exactly one of person_id or company_id is required")
        return self


class EmailOut(EmailCreate, OrmModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class EvidenceCreate(BaseModel):
    company_id: UUID | None = None
    person_id: UUID | None = None
    source_id: str
    source_url: str | None = None
    observed_at: datetime | None = None
    evidence_type: str = "observation"
    confidence: str = "unknown"
    verification_state: str = "source_observed"
    raw_text: str | None = None
    metadata_json: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def exactly_one_subject(self):
        if bool(self.company_id) == bool(self.person_id):
            raise ValueError("Exactly one of company_id or person_id is required")
        return self


class EvidenceOut(EvidenceCreate, OrmModel):
    id: UUID
    created_at: datetime


class ActivityCreate(BaseModel):
    company_id: UUID | None = None
    person_id: UUID | None = None
    activity_type: str
    subject: str | None = None
    detail: str | None = None
    metadata_json: dict[str, Any] = Field(default_factory=dict)
    occurred_at: datetime | None = None

    @model_validator(mode="after")
    def at_least_one_subject(self):
        if not self.company_id and not self.person_id:
            raise ValueError("company_id or person_id is required")
        return self


class ActivityOut(ActivityCreate, OrmModel):
    id: UUID
    occurred_at: datetime
    created_at: datetime


class ReviewQueueItem(BaseModel):
    entity_type: str
    id: UUID
    display_name: str
    company_name: str | None = None
    country: str | None = None
    region: str | None = None
    verification_state: str
    evidence_count: int
