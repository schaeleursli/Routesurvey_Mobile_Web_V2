---
name: qa_playwright_auth-onboarding-fieldguide
description: End-to-end UX testing with Playwright for auth flows, routing guards, onboarding, and Field Guide packs. Use for QA automation and regressions.
---

# QA Skill — Playwright: Auth + Onboarding + Field Guide

## Mission
Create reliable, deterministic E2E tests for:
- /login /signup /forgot UI and states
- Google button presence and OAuth flow mocking
- Route guards (auth + onboarding)
- Onboarding completion
- Field Guide tip packs (basic + advanced)
- Key accessibility checks (basic)

## When to use
- Before shipping auth/onboarding changes
- To prevent regressions in routing/auth state
- To validate mobile vs desktop UX

## Test Strategy
### Fixtures (required)
Seed or mock users:
- user_password_no_onboarding
- user_password_with_onboarding
- user_google_only_no_onboarding
- user_google_only_with_onboarding

Mocking:
- Prefer API/session mocking at network layer if provider login is non-deterministic.
- If you must mock OAuth callback: simulate session cookie/local storage state.

## Required Tests
1) Login page renders hero + auth card
2) Email validation errors appear
3) Wrong password shows error UI
4) Google button exists and initiates OAuth (mock)
5) Protected route redirects unauthenticated → /login
6) Authenticated without onboarding redirects → /onboarding
7) Authenticated with onboarding goes → /dashboard
8) Complete onboarding 3 steps sets onboarding_completed_at and routes → /dashboard
9) Field Guide shows after onboarding; progress updates; skip works
10) Advanced pack visibility gating works (role or completion)
11) Forgot password:
    - password user shows success message
    - google-only shows “Use Google sign-in” message (or privacy-safe variant)
12) Mobile viewport sanity (at least one test at 390x844)

## UX Assertions (not just functional)
- Primary CTA visible without scroll on mobile (where feasible)
- No layout shift after skeleton
- Error messages are readable and placed near input or banner

## Accessibility checks (lightweight)
- Tab navigation hits inputs/buttons in logical order
- Focus ring visible
- Inputs have labels

## Output
- Tests + fixtures + helper utils
- A short doc: how to run locally + in CI
