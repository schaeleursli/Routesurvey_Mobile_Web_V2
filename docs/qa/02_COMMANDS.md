# QA Commands

Run these commands from the project root.

## Global

*   `npm run test:all`: Run all test suites (Lint, Typecheck, Unit, E2E).

## Static Analysis

*   `npm run lint`: Run ESLint and Prettier check.
*   `npm run lint:fix`: Auto-fix linting and formatting errors.
*   `npm run typecheck`: Run TypeScript type checking (via `vue-tsc`).

## Unit & Component Tests (Vitest)

*   `npm run test`: Run unit and component tests once.
*   `npm run test:watch`: Run tests in watch mode.
*   `npm run coverage`: Generate coverage report.

## End-to-End Tests (Playwright)

*   `npm run test:e2e`: Run E2E tests in headless mode (CI style).
*   `npm run test:e2e:ui`: Run E2E tests with UI runner (interactive).
*   `npm run test:e2e:debug`: Run E2E tests in debug mode.

## Visual Regression

*   `npm run test:visual`: Run visual regression tests (requires token).
