# 🏆 Award Winning 2026 Enterprise Design Guidelines

> **Vision**: To create an enterprise application that feels like a consumer masterpiece—fluid, cinematic, and calm. We move beyond "functional" to "delightful".

## 1. Core Design Philosophy

### 1.1 The "Cinematic" Enterprise
Enterprise software is traditionally static and clunky. Our 2026 standard dictates:
*   **Sequential Entry**: Screens never just "appear". They build. (e.g., Nav $\to$ Header $\to$ Content $\to$ Actions).
*   **Reactive Interfaces**: Elements acknowledge interaction immediately (hover, focus, active states) with physics-based transitions, not instant snaps.
*   **Depth & Glass**: Use subtle layering, backdrop blurs, and mesh gradients to create a sense of space and hierarchy.

### 1.2 "The One Rule" of Standardization
We strictly enforce token parity between Web and Mobile to ensure the "Business Logic of Design" is identical.
*   **Visual Language**: If "Draft" is Grey-500 on Mobile, it MUST be Grey-500 on Web.
*   **Semantic Naming**: We name things by *intent* (e.g., `status-blocking`), not *color* (e.g., `red-500`).

---

## 2. Unified Token System

We are unifying Web and Mobile tokens. The **Mobile** implementation (`RsSemanticColors`) is currently the "Gold Standard" for semantic granularity and must be ported to Web.

### 2.1 Base Colors (Palette)
*References the raw palette (Primitive Layout).*

### 2.2 Semantic Colors (The Interface Contract)
All components must use these semantic tokens.

| Token Name | Web Variable (`--`) | Mobile Property (`.`) | Description |
| :--- | :--- | :--- | :--- |
| **Backgrounds** | | | |
| `bg-base` | `--bg-base` | `background` | The lowest level page background. |
| `bg-surface` | `--bg-surface` | `surface` | Cards, panels, sheets. |
| `bg-elevated` | `--bg-elevated` | `surfaceAlt` | Elevated lists, secondary cards. |
| **Text** | | | |
| `text-primary` | `--text-primary` | `textPrimary` | High emphasis (Headings, Main actions). |
| `text-secondary` | `--text-secondary` | `textSecondary` | Medium emphasis (Body, Labels). |
| `text-tertiary` | `--text-tertiary` | `textTertiary` | Low emphasis (Placeholders, Disabled). |
| **Status (Business Logic)** | *[MISSING IN WEB]* | *[EXISTS]* | |
| `status-draft` | `--status-draft` | `statusDraft` | Entity is in draft mode (Neutral/Grey). |
| `status-needs-data` | `--status-needs-data` | `statusNeedsData` | Entity is incomplete (Warning/Orange). |
| `status-ready` | `--status-ready` | `statusReady` | Entity is complete/valid (Success/Green). |
| `status-shared` | `--status-shared` | `statusShared` | Entity is external visible (Info/Blue). |
| `status-blocking` | `--status-blocking` | `statusBlocking` | Entity prevents progress (Error/Red). |

> **ACTION REQUIRED**: Web `design-system.css` must be updated to include the Status tokens to match Mobile.

---

## 3. Motion & Interaction System ("The 2026 Feel")

### 3.1 Choreography
Elements must stagger onto the screen.
*   **Web**: Use `.animate-stagger` and `.delay-{ms}` classes.
*   **Mobile**: Use `flutter_animate` with `slide`, `fade`, and `shimmer` effects on page load.

### 3.2 Micro-Interactions
*   **Buttons**: Scale down slightly (0.98x) on active/press.
*   **Inputs**: Glow/Pulse on focus.
*   **Lists**: Items slide in when added, collapse smoothly when removed.

---

## 4. Typography & Icons

*   **Font**: `Inter` (Standard).
*   **Icons**:
    *   **Strict Standard**: **Phosphor Icons** (Duotone or Regular weight).
    *   No Bootstrap Icons. No Material Icons (unless system default).
    *   All icons must be unified.

---

## 5. Implementation Roadmap (Gap Analysis)

### 🔴 Critical Gaps (Must Fix)
1.  **Web Status Tokens**: Web uses generic `success`, `warning` colors for status logic. It needs dedicated `status-draft`, `status-ready` tokens to align with Mobile.
2.  **Icon Enforcing**: Web currently has Bootstrap icons in places. All must be Phosphor.
3.  **Mobile Motion**: Mobile app lacks the "Cinematic" entrance animations defined in the new Web guidelines.

### 🟡 Enhancement Opportunities
1.  **Glassmorphism**: Web `context-bar` is solid gradient. It should be semi-transparent blur (`backdrop-filter`) for that premium feel.
2.  **Depth**: Shadows on Web are good, but could use colored shadows (`--shadow-colored`) more effectively on primary actions.

---

## 6. Token Reference (JSON Source of Truth - Proposal)

To prevent future drift, we propose a `tokens.json` single source of truth that generates both CSS vars and Dart classes.

```json
{
  "semantic": {
    "status": {
      "draft": { "light": "#94A3B8", "dark": "#64748B" },
      "ready": { "ref": "success" }
    }
  }
}
```
