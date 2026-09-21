from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class CrmSource(Base):
    __tablename__ = "crm_sources"

    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(80), nullable=False)
    access_class: Mapped[str] = mapped_column(String(40), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class CrmCompany(Base):
    __tablename__ = "crm_companies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canonical_name: Mapped[str] = mapped_column(String(255), nullable=False)
    match_key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    website: Mapped[str | None] = mapped_column(Text)
    linkedin_url: Mapped[str | None] = mapped_column(Text)
    country: Mapped[str | None] = mapped_column(String(120))
    region: Mapped[str | None] = mapped_column(String(80))
    verification_state: Mapped[str] = mapped_column(String(40), default="unverified", nullable=False)
    sector_relevance_score: Mapped[int | None]
    commercial_engagement_score: Mapped[int | None]
    specialties: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    aliases: Mapped[list["CrmCompanyAlias"]] = relationship(back_populates="company", cascade="all, delete-orphan")
    people: Mapped[list["CrmPerson"]] = relationship(back_populates="company")


class CrmCompanyAlias(Base):
    __tablename__ = "crm_company_aliases"
    __table_args__ = (UniqueConstraint("company_id", "alias_match_key", name="uq_crm_company_alias"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_companies.id", ondelete="CASCADE"), nullable=False)
    alias_name: Mapped[str] = mapped_column(String(255), nullable=False)
    alias_match_key: Mapped[str] = mapped_column(String(255), nullable=False)
    source_id: Mapped[str | None] = mapped_column(String(160), ForeignKey("crm_sources.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    company: Mapped[CrmCompany] = relationship(back_populates="aliases")


class CrmPerson(Base):
    __tablename__ = "crm_people"
    __table_args__ = (
        Index("ix_crm_people_company_id", "company_id"),
        Index("ix_crm_people_routesurvey_user_id", "routesurvey_user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_companies.id", ondelete="SET NULL"))
    routesurvey_user_id: Mapped[str | None] = mapped_column(String(120))
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255))
    linkedin_url: Mapped[str | None] = mapped_column(Text)
    country: Mapped[str | None] = mapped_column(String(120))
    region: Mapped[str | None] = mapped_column(String(80))
    languages: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    credentials: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    specialties: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    verification_state: Mapped[str] = mapped_column(String(40), default="unverified", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    company: Mapped[CrmCompany | None] = relationship(back_populates="people")


class CrmEmail(Base):
    __tablename__ = "crm_emails"
    __table_args__ = (
        UniqueConstraint("email", name="uq_crm_email"),
        Index("ix_crm_emails_person_id", "person_id"),
        Index("ix_crm_emails_company_id", "company_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    person_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_people.id", ondelete="CASCADE"))
    company_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_companies.id", ondelete="CASCADE"))
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    email_type: Mapped[str] = mapped_column(String(40), default="unknown", nullable=False)
    basis: Mapped[str | None] = mapped_column(Text)
    verification_status: Mapped[str] = mapped_column(String(40), default="unverified", nullable=False)
    verification_provider: Mapped[str | None] = mapped_column(String(80))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class CrmEvidence(Base):
    __tablename__ = "crm_evidence"
    __table_args__ = (
        Index("ix_crm_evidence_company_id", "company_id"),
        Index("ix_crm_evidence_person_id", "person_id"),
        Index("ix_crm_evidence_source_id", "source_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_companies.id", ondelete="CASCADE"))
    person_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_people.id", ondelete="CASCADE"))
    source_id: Mapped[str] = mapped_column(String(160), ForeignKey("crm_sources.id"), nullable=False)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    source_url: Mapped[str | None] = mapped_column(Text)
    observed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    evidence_type: Mapped[str] = mapped_column(String(80), default="observation", nullable=False)
    confidence: Mapped[str] = mapped_column(String(40), default="unknown", nullable=False)
    verification_state: Mapped[str] = mapped_column(String(40), default="source_observed", nullable=False)
    raw_text: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class CrmActivity(Base):
    __tablename__ = "crm_activities"
    __table_args__ = (
        Index("ix_crm_activities_company_id", "company_id"),
        Index("ix_crm_activities_person_id", "person_id"),
        Index("ix_crm_activities_occurred_at", "occurred_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_companies.id", ondelete="CASCADE"))
    person_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_people.id", ondelete="CASCADE"))
    activity_type: Mapped[str] = mapped_column(String(80), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255))
    detail: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
