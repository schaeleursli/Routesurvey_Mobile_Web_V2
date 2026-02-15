---
name: backend_auth-profile-routing
description: Implement backend support for user profile creation, onboarding persistence, provider identity rules (Google vs password), and routing readiness. Use for API/database integration.
---

# Backend Skill — Auth + User Profile + Onboarding State

## Mission
Provide clean backend primitives for:
- Creating/fetching user profile
- Persisting onboarding answers
- Tracking onboarding_completed_at
- Handling provider identity distinctions for forgot password messaging

## When to use
- You need DB schema changes (profiles)
- You need endpoints for onboarding/profile
- You need logic for "Google-only vs password user"
- You need safe, testable session validation

## Data Model (minimum)
Table: user_profile
- user_id (pk, fk to auth user)
- role (nullable)
- unit_system (metric|imperial)
- language (en|es|pt)
- onboarding_completed_at (timestamp nullable)
- created_at, updated_at

Optional:
- tips_basic_completed_at
- tips_advanced_completed_at
- tips_seen_count

## Provider identity
Store or derive:
- auth_provider_primary (google|password|other) OR
- identities list from auth provider (recommended)

Rule:
- /forgot password reset only when password identity exists.

## Endpoints (example)
- GET /me
  - returns session user + profile
- POST /onboarding
  - upserts role/unit/language, sets onboarding_completed_at on completion
- POST /password-reset
  - checks identity; if google-only returns code PROVIDER_GOOGLE
  - if password exists triggers reset email via provider SDK

## Security
- Validate session token server-side for every protected endpoint
- Avoid open redirects
- Rate-limit password reset

## Integration Rules
- On first auth login (Google or password), ensure profile row exists (upsert).
- Profile fetch must be fast and cached where appropriate.

## Acceptance Criteria
- New Google user logs in → profile auto-created → onboarding gate works
- Password reset endpoint behaves correctly for google-only users
- Onboarding writes are idempotent (safe to retry)
- Tests can easily seed users with/without onboarding
