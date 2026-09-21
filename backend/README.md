# RouteSurvey CRM API

FastAPI persistence service for RouteSurvey CRM.

## Architecture

- FastAPI
- SQLAlchemy 2.x async
- PostgreSQL
- JWT verification against the existing RouteSurvey authentication token
- admin-only CRM routes
- append-oriented evidence records with deterministic fingerprints

Base URL:

```text
http://localhost:8002/api/v1/crm
```

## Local startup

From the repository root:

```bash
export ROUTESURVEY_JWT_SECRET="<same secret as the RouteSurvey auth backend>"
export CRM_ADMIN_SUBJECTS='["<admin-user-id>"]'
docker compose up -d db crm_api
```

In development the FastAPI service creates missing CRM tables from SQLAlchemy metadata.

For controlled/production deployments, apply:

```text
backend/migrations/001_crm_core.sql
```

before starting the service.

## Authorization

The browser sends the existing RouteSurvey `l_t` JWT.

The CRM API:

1. verifies the JWT signature and expiry;
2. accepts an admin role claim when present; or
3. accepts a verified token whose user ID is explicitly listed in `CRM_ADMIN_SUBJECTS`.

The frontend's Admin route state is never considered sufficient authorization.

## Canonical records

- `crm_sources`
- `crm_companies`
- `crm_company_aliases`
- `crm_people`
- `crm_emails`
- `crm_evidence`
- `crm_activities`

## Evidence behavior

Evidence is idempotent. A deterministic SHA-256 fingerprint is generated from:

- subject ID
- source ID
- source URL
- evidence type

Re-importing the same evidence updates the existing row instead of creating a duplicate.

## Current endpoints

- `GET /api/v1/crm/health`
- `PUT /api/v1/crm/sources/{source_id}`
- `GET/POST /api/v1/crm/companies`
- `GET/POST /api/v1/crm/people`
- `POST /api/v1/crm/emails`
- `POST /api/v1/crm/evidence`
- `POST /api/v1/crm/activities`
- `GET /api/v1/crm/review-queue`

## Security note

Do not expose the CRM tables through anonymous PostgREST permissions. CRM writes are intentionally routed through the FastAPI authorization boundary.
