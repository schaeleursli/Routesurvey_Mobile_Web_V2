---
name: product-ux_auth-onboarding-fieldguide
description: Design the landing-style Login/Signup and 3-step onboarding with Headspace-style Field Guide tips. Use for UX/UI decisions, states, copy direction, and interaction polish.
---

# Product UX Skill — Auth + Onboarding + Field Guide (RouteSurvey)

## Mission
Ship a modern, minimalist, enterprise-grade auth + onboarding experience:
- **/login** feels like a premium mini landing page.
- **/signup** includes Google sign-in as first-class.
- **/forgot** works correctly for password users, and routes Google users to Google sign-in.
- **/onboarding** is max 3 steps, then a **Field Guide** (calm gamification) with tip packs.
- Routing is deterministic and defensible.

## When to use
- You need UX structure, copy, flow, states, and interaction rules for Auth / Onboarding / Field Guide.
- You’re reviewing or redesigning the auth or onboarding screens for clarity and premium feel.

## Principles (non-negotiable)
- Mobile-first; desktop is an enhancement.
- Minimalistic; no clutter. One primary action per screen.
- Calm “Headspace-style” guidance: professional, confident, not playful.
- Accessibility: keyboard nav, focus states, ARIA labels, reduced motion.
- Error states are designed (not left to defaults).

## Page UX Specs

### /login
Layout:
- Desktop: 2-column (Left = hero/mini landing; Right = auth card)
- Mobile: stacked (hero top, auth card bottom)

Auth card order:
1. **Continue with Google** (primary)
2. Divider "or"
3. Email + password
4. Continue
5. Links: Forgot password, Create account

Hero:
- One line headline, short subtext, 3 bullets max, optional product preview mock.

### /signup
- Same card structure: Google first, then email option.
- Avoid long forms. Collect “company” later in onboarding/settings.

### /forgot
- Only resets password for password users.
- If email is Google-only: message "Use Google sign-in".
- Never create “Google reset”.

### /onboarding (max 3 steps)
Step 1: Role & Use-case
Step 2: Preferences (units/language + optional thresholds)
Step 3: First project (create or import)

After completion: open **Field Guide** (tips carousel) with progress indicator.
Must be skippable. Must be accessible later (Help → Field Guide).

## Calm Gamification Rules
- No points, streaks, badges, confetti.
- Use progress only: “3 of 8” + subtle dots.
- Reinforce mastery quietly: “You’re set. Everything else is refinement.”

## Copy rules
- Short title, 1–2 sentences.
- No emojis. No exclamation marks.
- Avoid buzzwords. Use operational language (survey, clearance, bridge, mitigation).

## State Design Checklist
Implement these UI states explicitly:
- Empty states (first run)
- Loading/skeleton
- Validation errors (inline)
- Auth errors (wrong password, cancelled Google, network fail)
- Success states (reset email sent, onboarding completed)
- Interruption handling (resume onboarding where left off)

## Review Checklist (ship/no-ship)
- Looks premium in both light/dark
- Works with thumb navigation (mobile)
- All flows have a clear escape route (back/skip)
- Tips are calm and professional
- No dead ends or ambiguous copy
