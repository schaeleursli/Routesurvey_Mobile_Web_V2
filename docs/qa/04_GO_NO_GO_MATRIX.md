# Go/No-Go Decision Matrix: RouteSurvey App Launch

**Date:** January 22, 2026
**Target Launch Version:** v1.0.0 (Enterprise Candidate)
**Decision Authority:** Launch Committee (Product Lead, Lead Engineer, QA Lead)

---

## 1. Decision Summary
**Current Status:** 🔴 **NO-GO**
**Primary Blocker:** Missing critical unit test coverage (>80% required) and Offline-Sync verification.

---

## 2. The Faculties & Owners

| Faculty | Owner Role | Primary Responsibility |
| :--- | :--- | :--- |
| **Product** | Product Manager | Feature completeness, UAT sign-off, Legal/Compliance. |
| **Design / UX** | Lead Designer | Design System compliance, visual polish, accessibility (WCAG). |
| **Frontend Eng** | Lead Native Engineer | Functional correctness, offline-first logic, performance. |
| **Backend Eng** | Backend Lead | API security, data integrity, sync conflict resolution. |
| **Quality (QA)** | QA Specialist | Test coverage metrics, regression testing, bug verification. |
| **DevOps** | System Admin | CI/CD pipelines, production environment, monitoring. |

---

## 3. Detailed Go/No-Go Matrix

### 3.1 🎨 Design & UX (Visual Quality)
**Owner:** Lead Designer
**Mandate:** "Award-Level Quality (2026)" & "Reliable under pressure"

| Area | Requirement | Go Criteria (Must Have) | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Design System** | 100% Token Usage | No hard-coded colors/spacings. All UI components map to `ThemeExtension` tokens. | 🟡 | Audit codebase for magic numbers/colors. |
| **Components** | Component State | All inputs/buttons have: Idle, Hover, Active, Disabled, Loading, Error states. | 🟡 | Verify `BaseInput` and `BaseSelect` states. |
| **Responsiveness** | Viewport Integrity | Layouts hold integrity from 320px (iPhone SE) to Desktop (Web Harness). | 🟢 | Continuing monitoring via Percy. |
| **Accessibility** | WCAG 2.1 AA | Contrast > 4.5:1. Tap targets 44px+. Screen reader friendly labels. | 🔴 | **BLOCKER**: Fix remaining `axe-core` violations. |
| **Empty States** | "First Run" Experience | No empty white screens. Helpful instruction/illustration for empty lists. | 🟡 | Design missing empty states for "Planned Routes". |

### 3.2 🛠 Engineering: Frontend (Functional)
**Owner:** Lead Native Engineer
**Mandate:** "Offline-First" & "Robustness over Speed"

| Area | Requirement | Go Criteria (Must Have) | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Offline Mode** | Critical Path | User can Create, Edit, and Save a Route with AIRPLANE MODE ON. | 🔴 | **BLOCKER**: Verify local storage queuing mechanism. |
| **Sync Logic** | Conflict Handling | "Pending Uploads" queue is visible. Sync errors allow retry or manual resolution. | 🔴 | **BLOCKER**: Implement/Test sync retry UI. |
| **Data Safety** | Unsaved Changes | `onBeforeRouteLeave` guards active on ALL forms. No accidental data loss. | 🟡 | Audit `EditPlannedRoute` and `UserSettings`. |
| **Validation** | Client-Side Constraints | Forms prevent invalid submission (e.g., negative distance). Real-time feedback. | 🟢 | Standardize using `vee-validate`/`zod` schemas. |
| **Permissions** | Role-Based Access | "Viewer" cannot see "Edit/Delete". "Admin" sees all. UI reflects permissions. | 🟡 | Verify `v-if` guards on action buttons. |

### 3.3 🔒 Engineering: Backend & Security
**Owner:** Backend Lead
**Mandate:** "Zero Vulnerability" & "Enterprise Compliance"

| Area | Requirement | Go Criteria (Must Have) | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Security** | Content Security Policy | Strict CSP headers in place. No inline scripts. `script-src 'self'`. | 🟢 | **FIXED** (Jan 22). Monitor for regressions. |
| **Auth** | Session Management | Token refresh handles expiry silently (where possible). Force logout on invalid refresh. | 🟡 | Verify `AuthStore` refresh logic logic. |
| **API** | Error Handling | API returns structured errors (Code, Message) that Frontend handles gracefully. | 🟡 | Audit error catch blocks in global Axios interceptors. |
| **Data** | Encryption | Data at rest (device) is encrypted (secure storage). SSL for all transit. | 🟡 | Verify `flutter_secure_storage` implementation. |

### 3.4 ✅ Quality Assurance (Validation)
**Owner:** QA Lead
**Mandate:** "If it isn't tested, it's broken."

| Area | Requirement | Go Criteria (Must Have) | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Unit Tests** | Logic Coverage | >80% coverage on `utils/` and `stores/` (Business Logic). | 🔴 | **BLOCKER**: Write tests for `useMapState` & `usePlannedRoutes`. |
| **E2E Tests** | Smoke Suite | Critical paths (Login, CRUD Route, Sync) passing on CI. | 🟡 | expand `smoke.spec.ts` to cover Offline scenarios. |
| **Visual QA** | Regression | Percy baseline established for all key screens. No visual drifts. | 🟢 | Maintain baselines. |
| **Browser Harness** | Web Parity | App runs fully in Chrome for rapid debugging/sales demos. | 🟢 | Verified. |

### 3.5 🚀 Product & Operations
**Owner:** Product Manager

| Area | Requirement | Go Criteria (Must Have) | Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Documentation** | User Guide | "Get Started" and "Help" content is integrated and up-to-date. | 🟡 | Link Help Article IDs to new screens. |
| **Legal** | Terms & Privacy | Accessible from Login screen and Settings. | 🟢 | Verified. |
| **Analytics** | Usage Tracking | Critical events (Route Created, Sync Fail) logged to telemetry. | ⚪ | Define telemetry schema (Post-MVP deferred?). |

---

## 4. Immediate "Get Well" Plan (Next 48 Hours)

To flip the status from **NO-GO** to **GO**, the following individuals must deliver:

1.  **Lead Native Engineer**: Run the "Offline-First" audit. Disconnect wifi, create a route, reconnect. Verify data syncs without corruption.
2.  **QA Specialist**: Write Unit Tests for `usePlannedRoutes.js` and `AuthStore`. Target 80% coverage.
3.  **Lead Designer**: Run `axe-core` on the dashboard and fix the top 3 contrast/label violations.
4.  **Backend Lead**: Verify the `refresh_token` endpoint is robust and frontend handles 401s correctly.

---

**Signed off by:**
_________________________ (Product)
_________________________ (Engineering)
