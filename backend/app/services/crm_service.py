from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crm import (
    CrmActivity,
    CrmCompany,
    CrmEmail,
    CrmEvidence,
    CrmPerson,
    CrmSource,
)
from app.schemas.crm import (
    ActivityCreate,
    CompanyCreate,
    EmailCreate,
    EvidenceCreate,
    PersonCreate,
    SourceUpsert,
)


async def upsert_source(db: AsyncSession, payload: SourceUpsert) -> CrmSource:
    source = await db.get(CrmSource, payload.id)
    data = payload.model_dump()
    if source is None:
        source = CrmSource(**data)
        db.add(source)
    else:
        for key, value in data.items():
            setattr(source, key, value)
    await db.commit()
    await db.refresh(source)
    return source


async def list_companies(
    db: AsyncSession,
    query: str | None = None,
    verification_state: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[CrmCompany]:
    stmt = select(CrmCompany)
    if query:
        term = f"%{query.strip()}%"
        stmt = stmt.where(
            or_(
                CrmCompany.canonical_name.ilike(term),
                CrmCompany.website.ilike(term),
                CrmCompany.country.ilike(term),
            )
        )
    if verification_state:
        stmt = stmt.where(CrmCompany.verification_state == verification_state)
    stmt = stmt.order_by(CrmCompany.updated_at.desc()).limit(limit).offset(offset)
    return list((await db.scalars(stmt)).all())


async def upsert_company(db: AsyncSession, payload: CompanyCreate) -> CrmCompany:
    stmt = select(CrmCompany).where(CrmCompany.match_key == payload.match_key)
    company = await db.scalar(stmt)
    data = payload.model_dump()
    if company is None:
        company = CrmCompany(**data)
        db.add(company)
    else:
        for key, value in data.items():
            if value is not None:
                setattr(company, key, value)
    await db.commit()
    await db.refresh(company)
    return company


async def list_people(
    db: AsyncSession,
    query: str | None = None,
    verification_state: str | None = None,
    company_id: UUID | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[CrmPerson]:
    stmt = select(CrmPerson)
    if query:
        term = f"%{query.strip()}%"
        stmt = stmt.where(or_(CrmPerson.full_name.ilike(term), CrmPerson.title.ilike(term)))
    if verification_state:
        stmt = stmt.where(CrmPerson.verification_state == verification_state)
    if company_id:
        stmt = stmt.where(CrmPerson.company_id == company_id)
    stmt = stmt.order_by(CrmPerson.updated_at.desc()).limit(limit).offset(offset)
    return list((await db.scalars(stmt)).all())


async def create_person(db: AsyncSession, payload: PersonCreate) -> CrmPerson:
    person = CrmPerson(**payload.model_dump())
    db.add(person)
    await db.commit()
    await db.refresh(person)
    return person


async def create_email(db: AsyncSession, payload: EmailCreate) -> CrmEmail:
    existing = await db.scalar(select(CrmEmail).where(CrmEmail.email == str(payload.email).lower()))
    data = payload.model_dump()
    data["email"] = str(payload.email).lower()
    if existing:
        for key, value in data.items():
            if value is not None:
                setattr(existing, key, value)
        email = existing
    else:
        email = CrmEmail(**data)
        db.add(email)
    await db.commit()
    await db.refresh(email)
    return email


async def create_evidence(db: AsyncSession, payload: EvidenceCreate) -> CrmEvidence:
    evidence = CrmEvidence(**payload.model_dump())
    db.add(evidence)
    await db.commit()
    await db.refresh(evidence)
    return evidence


async def create_activity(db: AsyncSession, payload: ActivityCreate) -> CrmActivity:
    data = payload.model_dump()
    if data["occurred_at"] is None:
        data["occurred_at"] = datetime.now(timezone.utc)
    activity = CrmActivity(**data)
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity


async def review_queue(db: AsyncSession, limit: int = 200) -> list[dict]:
    company_counts = (
        select(
            CrmEvidence.company_id.label("entity_id"),
            func.count(CrmEvidence.id).label("evidence_count"),
        )
        .where(CrmEvidence.company_id.is_not(None))
        .group_by(CrmEvidence.company_id)
        .subquery()
    )
    person_counts = (
        select(
            CrmEvidence.person_id.label("entity_id"),
            func.count(CrmEvidence.id).label("evidence_count"),
        )
        .where(CrmEvidence.person_id.is_not(None))
        .group_by(CrmEvidence.person_id)
        .subquery()
    )

    company_stmt = (
        select(CrmCompany, func.coalesce(company_counts.c.evidence_count, 0))
        .outerjoin(company_counts, company_counts.c.entity_id == CrmCompany.id)
        .where(CrmCompany.verification_state != "verified")
        .order_by(CrmCompany.sector_relevance_score.desc().nullslast(), CrmCompany.updated_at.desc())
        .limit(limit)
    )
    person_stmt = (
        select(CrmPerson, CrmCompany.canonical_name, func.coalesce(person_counts.c.evidence_count, 0))
        .outerjoin(CrmCompany, CrmCompany.id == CrmPerson.company_id)
        .outerjoin(person_counts, person_counts.c.entity_id == CrmPerson.id)
        .where(CrmPerson.verification_state != "verified")
        .order_by(CrmPerson.updated_at.desc())
        .limit(limit)
    )

    items: list[dict] = []
    for company, evidence_count in (await db.execute(company_stmt)).all():
        items.append(
            {
                "entity_type": "company",
                "id": company.id,
                "display_name": company.canonical_name,
                "company_name": company.canonical_name,
                "country": company.country,
                "region": company.region,
                "verification_state": company.verification_state,
                "evidence_count": evidence_count,
            }
        )

    for person, company_name, evidence_count in (await db.execute(person_stmt)).all():
        items.append(
            {
                "entity_type": "person",
                "id": person.id,
                "display_name": person.full_name,
                "company_name": company_name,
                "country": person.country,
                "region": person.region,
                "verification_state": person.verification_state,
                "evidence_count": evidence_count,
            }
        )

    return items[:limit]
