# QA Overview

This directory contains the documentation for the RouteSurvey Console QA & Testing Infrastructure.

## Purpose

The goal of this QA infrastructure is to ensure:
*   **Correctness**: Features work as expected.
*   **Reliability**: Regressions are caught early.
*   **Maintainability**: Code quality is enforced via linting and typing.
*   **Accessibility**: The app is usable by everyone.

## Stack Overview

| Layer | Tool | Purpose |
| :--- | :--- | :--- |
| **Linting** | ESLint + Prettier | Code style and best practices |
| **Type Safety** | vue-tsc | TypeScript checking for Vue/JS files |
| **Unit/Component** | Vitest + Vue Test Utils | Component logic and utility testing |
| **API Mocking** | MSW (Mock Service Worker) | Backend-independent testing |
| **E2E Testing** | Playwright | Full browser automation and critical flows |
| **Visual Regression** | Percy | UI snapshot comparisons |
| **Accessibility** | axe-core | WCAG compliance checking |

## Directory Structure

*   `docs/qa/` - QA Documentation (you are here)
*   `tests/unit/` - Unit tests for utilities
*   `tests/components/` - Component tests
*   `tests/e2e/` - End-to-end tests
*   `src/mocks/` - MSW handlers and server setup

## Skills & Standards

We enforce role-based standards defined in `skills/`. Every change must adhere to:
*   [Senior QA](../../skills/senior-qa.skill.md)
*   [Senior Designer](../../skills/senior-designer.skill.md)
*   [Senior Frontend](../../skills/senior-frontend-designer.skill.md)
*   [Senior Backend](../../skills/senior-backend-engineer.skill.md)

