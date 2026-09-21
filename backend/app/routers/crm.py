from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import AdminPrincipal, require_crm_admin
from app.db.session import get_db
from app.schemas.crm import (
    ActivityCreate,
    ActivityOut,
    CompanyCreate,
    CompanyOut,
    EmailCreate,
    EmailOut,
    EvidenceCreate,
    EvidenceOut,
    PersonCreate,
    PersonOut,
    ReviewQueueItem,
    SourceOut,
    SourceUpsert,
)
from app.services import crm_service

router = APIRouter(prefix="/crm", tags=["crm"])


@router.get("/health")
async def crm_health(principal: AdminPrincipal = Depends(require_crm_admin)):
    return {"status": "healthy", "role": principal.role}


@router.put("/sources/{source_id}", response_model=SourceOut)
async def put_source(
    source_id: str,
    payload: SourceUpsert,
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    if payload.id != source_id:
        payload = payload.model_copy(update={"id": source_id})
    return await crm_service.upsert_source(db, payload)


@router.get("/companies", response_model=list[CompanyOut])
async def get_companies(
    q: str | None = None,
    verification_state: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.list_companies(db, q, verification_state, limit, offset)


@router.post("/companies", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
async def post_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.upsert_company(db, payload)


@router.get("/people", response_model=list[PersonOut])
async def get_people(
    q: str | None = None,
    verification_state: str | None = None,
    company_id: UUID | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.list_people(db, q, verification_state, company_id, limit, offset)


@router.post("/people", response_model=PersonOut, status_code=status.HTTP_201_CREATED)
async def post_person(
    payload: PersonCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.create_person(db, payload)


@router.post("/emails", response_model=EmailOut, status_code=status.HTTP_201_CREATED)
async def post_email(
    payload: EmailCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.create_email(db, payload)


@router.post("/evidence", response_model=EvidenceOut, status_code=status.HTTP_201_CREATED)
async def post_evidence(
    payload: EvidenceCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.create_evidence(db, payload)


@router.post("/activities", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
async def post_activity(
    payload: ActivityCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.create_activity(db, payload)


@router.get("/review-queue", response_model=list[ReviewQueueItem])
async def get_review_queue(
    limit: int = Query(default=200, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _: AdminPrincipal = Depends(require_crm_admin),
):
    return await crm_service.review_queue(db, limit)
