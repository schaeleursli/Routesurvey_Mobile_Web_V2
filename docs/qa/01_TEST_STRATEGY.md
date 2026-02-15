# Test Strategy

## 1. Testing Pyramid

We follow a standard testing pyramid approach:

*   **Static Analysis (Bottom)**: Linting and Type Checking run on every commit.
*   **Unit & Component Tests**: Fast, isolated tests for individual components and logic. Mock external dependencies.
*   **Integration/E2E (Top)**: Slower, comprehensive tests verifying critical user flows in a real browser environment.

## 2. When to Write Tests

*   **New Feature**: Write component tests for new UI and E2E tests for new critical flows.
*   **Bug Fix**: Write a reproduction test (unit/component or E2E) that fails before the fix and passes after.
*   **Refactor**: Ensure existing tests cover the refactored area.

## 3. Mocking Strategy

*   **Unit/Component**: Shallow mount or mount. Mock child components if complex.
*   **Network Requests**: Use MSW (Mock Service Worker) to intercept network requests. DO NOT rely on the live backend for tests.
    *   Handlers are defined in `src/mocks/handlers.js`.
    *   This ensures deterministic tests and offline execution.

## 4. Visual Regression

*   Visual tests run on push to main or PRs.
*   Snapshots are taken of critical screens (Dashboard, Route List, etc.).
*   Review visual diffs in the Percy dashboard.

## 5. Accessibility (A11y)

*   Automated `axe-core` checks are integrated into E2E tests.
*   Critical violations (WCAG A/AA) will fail the build.
*   Manual testing is still recommended for complex interactions.
