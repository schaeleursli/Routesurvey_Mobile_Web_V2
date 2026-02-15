---
name: content_fieldguide-tip-packs
description: Maintain RouteSurvey Field Guide tip packs (basic + advanced) in a calm, professional, Headspace-style. Use to create, refine, localize, and configure tip content.
---

# Content Skill — Field Guide Tip Packs (Headspace-style)

## Mission
Write and maintain tip packs that feel like calm professional coaching:
- Minimal, precise, reassuring
- Engineering credible for heavy haul / OOG
- Config-driven for future client packs (BHP/EPCM)

## When to use
- Creating new tips
- Creating advanced or region/equipment-specific packs
- Localization (EN/ES/PT) without losing tone
- Converting copy into config JSON

## Copy Rules
- No emojis, no exclamation marks
- No hype, no marketing
- Title: 2–5 words, calm and declarative
- Body: 1–2 sentences max
- Optional CTA: short, direct (e.g. “Review bridge observations”)

## Tip Pack Types
- Basic pack: first-time users
- Advanced Heavy Transport pack: transport engineers/EPC
- Optional future packs:
  - Country-specific regulations
  - Equipment-specific (SPMT/hydraulic/drawbar/gooseneck)
  - Client-specific reporting standards

## Config Output Format
Each pack:
- id
- title
- audience
- unlock_rule
- tips[] (id, title, body, ctaLabel?, ctaRoute?)

## Quality Checklist
- Each tip teaches one concept
- No redundancy across tips
- Each tip supports a real action in RouteSurvey
- Reads like a senior engineer, not a trainer
