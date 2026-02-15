# Launch Readiness: Test Status & Gap Analysis

**Date:** January 22, 2026
**Status:** 🟡 **Partial (Stable but Coverage Low)**

## 1. Executive Summary

We have established the **infrastructure** for a robust quality assurance pipeline (Vitest, Playwright, Percy). E2E Smoke tests are now **PASSING**, and frontend-backend connectivity is verified for local dev.

*   **Tests We Did**: Implemented critical path E2E smoke tests for Authentication and basic Manual Route creation. **Fixed CSP issues** blocking local API.
*   **Tests We Need**: Comprehensive Unit tests for business logic, Component tests for the Design System, and deep E2E coverage for offline/sync scenarios.

---

## 2. Tests We Did (Current Status)

We have successfully set up the "Walking Skeleton" of our QA infrastructure.

### 2.1 E2E Smoke Tests (`tests/e2e/smoke.spec.ts`)
*   ✅ **App Boot**: Verifies the application mounts without console errors.
*   ✅ **Accessibility (Basic)**: integrated `axe-core` scan (currently in logging mode, not blocking).
*   ✅ **Authentication**: Login flow and Logout flow using Mocked API/Local Backend.
*   ✅ **Manual Route CRUD**: Basic "Happy Path" test for creating a route and adding points on the map.
*   ✅ **Dev Tools**: Implemented `mock_login.spec.ts` to verify developer efficiency tools.

### 2.2 Visual Regression (`tests/e2e/visual.spec.ts`)
*   ✅ **Infrastructure**: Percy is configured.
*   ✅ **Dashboard**: Single baseline snapshot implemented.

### 2.3 Unit & Component Infrastructure
*   ✅ **Vitest**: Configured and runnable (`npm run test`).
*   ✅ **MSW**: Basic handlers set up in `src/mocks/`.

---

## 3. Tests We Need (The Gap)

To meet the "Enterprise Quality" and "Offline-First" requirements, we must close the following gaps before launch.

### 3.1 Unit Tests (Critical Gap: 100% Missing)
**Risk**: Business logic is untested and prone to regression.
*   **Target**: `src/utils/` and `src/composables/`
*   [x] `route_utils.js`: formatting, distance calc, metric/imperial conversion. (Verified existing text)
*   [ ] `useMapState.js`: Layer management, zoom logic.
*   [ ] `usePlannedRoutes.js`: Data formatting for API.
*   [ ] `AuthStore` (Pinia): Token management, session expiry logic. (Partially covered)

### 3.2 Component Tests (Design System Hygiene)
**Status**: 🟡 Partial (BaseButton covered)
*   **Target**: `src/components/base/`
*   [x] `BaseButton.vue`: Covered by existing tests.
*   [ ] `BaseInput.vue` / `BaseFormField.vue`: Validation states, v-model sync.
*   [ ] `BaseModal.vue`: Open/close logic, barrier dismissal.

### 3.3 E2E Expansion (Field Reality)
**Risk**: "Works on my machine" but fails in the field.
*   **Offline Support**:
    *   [ ] Simulate network failure during "Save Route".
    *   [ ] Verify "Pending Sync" queue UI.
*   **Planned Routes**:
    *   [ ] Full CRUD flow for Planned Routes.
    *   [ ] "Prime Mover" selection logic.
*   **Permissions**:
    *   [ ] Verify "Viewer" role cannot see "Add Route" button.
*   **Validation**:
    *   [ ] Try submitting empty forms (Error messages must appear).
    *   [ ] Try submitting invalid data (e.g. negative distance).
*   **Profile & Settings**:
    *   [ ] Change Password flow.
    *   [ ] Update MFA settings.

### 3.4 Visual Regression
**Risk**: Visual bugs (alignment, mobile responsiveness) slip through.
*   [ ] **Mobile Viewports**: Run visual tests on iPhone/Pixel viewports.
*   [ ] **Dark Mode**: Verify all screens in Dark Mode.
*   [ ] **States**: Snapshot Empty States, Error States, Loading States.

---

## 4. Action Plan


### Phase 1: Foundation (Completed)
1.  [x] Create `tests/unit/utils/route_utils.spec.js`: Test unit conversion.
2.  [x] Create `tests/components/BaseButton.spec.js`: Existed, verified passing.
3.  [x] Fix `tests/unit/TokenManager.spec.js`: Refactored to support Pinia.
4.  [x] Fix `index.html` CSP: Allow local API connections.

### Phase 2: Critical Logic (This Sprint)
3.  Test `AuthStore` (Pinia) logic.
4.  Test `usePlannedRoutes` composable.
5.  Expand E2E Smoke test to include "Planned Route" creation.

### Phase 3: Field Hardening (Pre-Launch)
6.  Implement Offline/Sync E2E tests.
7.  Strict Accessibility: Make `axe-core` violations fail the build.
