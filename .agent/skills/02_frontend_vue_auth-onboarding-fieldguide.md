---
name: frontend_vue_auth-onboarding-fieldguide
description: Implement the UI in Vue (Vite) with clean components, route guards, state handling, and Google OAuth buttons. Use for UI development and integration.
---

# Frontend Skill — Vue Auth + Onboarding + Field Guide

## Mission

Implement:

- /login, /signup, /forgot, /onboarding
- Field Guide tips carousel (basic + advanced packs)
- Deterministic routing/guards based on session + onboarding status
- Polished UI states and accessibility

## When to use

- Building the pages/components
- Wiring router guards
- Implementing Google OAuth UI and callback handling
- Implementing Field Guide packs via config

## Assumptions

- App uses Vue 3 + Vue Router + (Pinia or equivalent state store).
- Auth provider exists (Refer to docs/backend). Use existing provider in repo.

## Architecture

### Routes

Public:

- /login
- /signup
- /forgot

Auth-only:

- /onboarding

Protected:

- /dashboard
- /projects/*
- /survey/*
- /reports/*

### Route Guard Logic (must)

- If route requires auth and no session → redirect /login
- If authenticated and onboarding not complete → redirect /onboarding (except already on /onboarding)
- If authenticated and onboarding complete → allow access

## Components (create reusable)

- AuthShell (layout)
- MarketingHero
- AuthCard
- OAuthButtonGoogle
- FormField
- InlineAlert
- OnboardingShell
- Step components (Role, Preferences, FirstProject)
- TipsCarousel (Field Guide)
- TipCard

## Tips Packs (config-driven)

- Store packs as JSON/TS objects:
  - id, title, audience, tips[]
  - each tip: title, body, ctaLabel?, ctaRoute?
- Implement pack selection:
  - Default = basic
  - Advanced unlocked based on role or completion of basic

## Accessibility (must)

- Tab order correct
- Focus visible
- Inputs have labels and aria-describedby for errors
- Buttons have aria-label where needed
- Reduced motion option disables slide transitions

## UI States

- Skeleton while checking session/profile
- Inline validation for email/password
- Auth error banners (cancelled OAuth, wrong password, throttled)
- Onboarding persistence and resume (save per step)

## Implementation Steps

1) Create pages + layout components
2) Implement auth store:
   - session state
   - user profile fetch
   - onboarding status flag
3) Wire router guards
4) Wire Google OAuth button to provider
5) Implement onboarding form state + submit to backend
6) Implement Field Guide carousel (basic + advanced)
7) Add Help → Field Guide entry (even if minimal)

## Acceptance Criteria

- Mobile-first, polished light/dark
- Google sign-in is primary and works
- Onboarding gating works reliably
- Field Guide packs render from config
- All major errors handled with user-friendly messages
