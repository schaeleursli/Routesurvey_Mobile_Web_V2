import { test as base, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Global test fixtures for Permits E2E testing
 * Supports both MOCK (MSW) and REAL (.Net refer to docs/backend) modes
 */

export interface PermitsTestContext {
    mode: 'mock' | 'real';
    projectId: string;
    blockedCaseId: string;
    readyCaseId: string;
    consoleLogs: string[];
    consoleErrors: string[];
    networkFailures: string[];
}

interface PermitsFixtures {
    ids: {
        projectId: string;
        blockedCaseId: string;
        readyCaseId: string;
    }
}

interface CustomWindow extends Window {
    __E2E_MODE__?: string;
    __MSW_DISABLED__?: boolean;
}

// Environment detection
const E2E_MODE = process.env.E2E_MODE || 'mock';
const IS_MOCK_MODE = E2E_MODE === 'mock';
const IS_REAL_MODE = E2E_MODE === 'real';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load fixtures for mock mode
let fixturesData: PermitsFixtures | null = null;
if (IS_MOCK_MODE) {
    const fixturesPath = path.join(__dirname, 'permits.fixtures.json');
    fixturesData = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));
}

/**
 * Extended test with global fixtures and error tracking
 */
export const test = base.extend<PermitsTestContext>({
    mode: async (_unused, use) => {
        await use(IS_MOCK_MODE ? 'mock' : 'real');
    },

    projectId: async ({ mode }, use) => {
        if (mode === 'mock') {
            await use(fixturesData!.ids.projectId);
        } else {
            // In real mode, use actual project from environment or test setup
            const realProjectId = process.env.E2E_TEST_PROJECT_ID || 'real-project-id';
            await use(realProjectId);
        }
    },

    blockedCaseId: async ({ mode }, use) => {
        if (mode === 'mock') {
            await use(fixturesData!.ids.blockedCaseId);
        } else {
            // In real mode, create or use seeded test case
            await use(process.env.E2E_BLOCKED_CASE_ID || 'real-blocked-case');
        }
    },

    readyCaseId: async ({ mode }, use) => {
        if (mode === 'mock') {
            await use(fixturesData!.ids.readyCaseId);
        } else {
            await use(process.env.E2E_READY_CASE_ID || 'real-ready-case');
        }
    },

    consoleLogs: async (_unused, use) => {
        const logs: string[] = [];
        await use(logs);
    },

    consoleErrors: async (_unused, use) => {
        const errors: string[] = [];
        await use(errors);
    },

    networkFailures: async (_unused, use) => {
        const failures: string[] = [];
        await use(failures);
    },

    page: async ({ page, context, consoleLogs, consoleErrors, networkFailures }, use, testInfo) => {


        // Console log capture
        page.on('console', (msg) => {
            const text = msg.text();
            const type = msg.type();

            if (type === 'error' || type === 'warning') {
                consoleErrors.push(`[${type.toUpperCase()}] ${text}`);
            } else {
                consoleLogs.push(`[${type}] ${text}`);
            }

            // Ignore known noise
            const ignoredPatterns = [
                /Failed to load resource: net::ERR_FAILED.*\.png$/,
                /favicon\.ico.*404/,
                /Source map error/,
                /\[Vue warn\]: Property ".*" was accessed during render but is not defined/,
                /Third-party cookie/,
                /DevTools failed to load source map/
            ];

            if (ignoredPatterns.some(p => p.test(text))) return;

            // Fail test on critical errors
            if (
                type === 'error' &&
                (text.includes('TypeError') ||
                    text.includes('ReferenceError') ||
                    text.includes('Uncaught'))
            ) {
                console.error(`❌ CRITICAL CONSOLE ERROR: ${text}`);
            } else if (type === 'error') {
                // Capture other errors but don't auto-fail yet unless specific test asserts it
                consoleErrors.push(`[${type.toUpperCase()}] ${text}`);
            }
        });

        // Track unhandled errors
        page.on('pageerror', (error) => {
            const errorMsg = `Uncaught exception: ${error.message}\n${error.stack}`;
            consoleErrors.push(errorMsg);
            console.error(`❌ PAGE ERROR: ${errorMsg}`);
        });

        // Network failure tracking
        page.on('requestfailed', (request) => {
            const failure = `${request.method()} ${request.url()} - ${request.failure()?.errorText}`;
            networkFailures.push(failure);
            console.warn(`⚠️ REQUEST FAILED: ${failure}`);
        });

        // Navigation timing tracking
        const navigationStart = Date.now();
        page.on('load', () => {
            const loadTime = Date.now() - navigationStart;
            if (loadTime > 4000) {
                console.warn(`⚠️ SLOW PAGE LOAD: ${loadTime}ms (threshold: 4000ms)`);
            }
        });

        // Enable MSW in mock mode
        if (IS_MOCK_MODE) {
            page.addInitScript(() => {
                // Ensure MSW is enabled
                (window as unknown as CustomWindow).__E2E_MODE__ = 'mock';
            });
        } else {
            page.addInitScript(() => {
                // Disable MSW in real mode
                (window as unknown as CustomWindow).__E2E_MODE__ = 'real';
                (window as unknown as CustomWindow).__MSW_DISABLED__ = true;
            });
        }

        // Use the page
        await use(page);

        // Post-test validation
        const criticalErrors = consoleErrors.filter(
            (err) =>
                err.includes('TypeError') ||
                err.includes('ReferenceError') ||
                err.includes('Uncaught') ||
                err.includes('[Vue warn]')
        );

        if (criticalErrors.length > 0 && testInfo.status !== 'skipped') {
            console.error(`\n❌ Test had ${criticalErrors.length} critical console errors:`);
            criticalErrors.forEach((err) => console.error(`   - ${err}`));

            // Attach logs to test report
            await testInfo.attach('console-errors', {
                body: criticalErrors.join('\n\n'),
                contentType: 'text/plain',
            });

            // Fail the test
            if (testInfo.status === 'passed') {
                throw new Error(`Test had ${criticalErrors.length} critical console errors`);
            }
        }

        // Attach network failures if any
        if (networkFailures.length > 0) {
            await testInfo.attach('network-failures', {
                body: networkFailures.join('\n'),
                contentType: 'text/plain',
            });

            // Only fail if not expected
            const unexpectedFailures = networkFailures.filter(
                (f) => !f.includes('expected-failure')
            );
            if (unexpectedFailures.length > 0 && testInfo.status === 'passed') {
                console.warn(
                    `⚠️ Test had ${unexpectedFailures.length} unexpected network failures`
                );
            }
        }

        // Take screenshot on failure
        if (testInfo.status !== 'passed' && testInfo.status !== 'skipped') {
            const screenshot = await page.screenshot({ fullPage: true });
            await testInfo.attach('failure-screenshot', {
                body: screenshot,
                contentType: 'image/png',
            });
        }
    },
});

/**
 * Helper: Login to application
 * Works in both mock and real mode
 */
export async function loginToApp(page: Page, mode: 'mock' | 'real') {
    if (mode === 'mock') {
        // Mock mode: bypass auth or use mock credentials
        // Mock mode: Inject auth token before navigation (prevents reload loop/MSW abort)
        await page.addInitScript(() => {
            localStorage.setItem('access_token', JSON.stringify({
                access_token: 'mock-token',
                user: {
                    id: 'mock-user-id',
                    email: 'test@example.com',
                    role: 'authenticated'
                }
            }));
        });
        // Note: We don't need to goto('/') here if the test follows up with a navigation.
        // But to maintain contract, we can go to root or let the test handle it.
        // Existing tests expect this to establish session.
        // If we remove goto('/'), tests doing page.goto('/permits/us') will work fine.
        // But if a test expects to be on a page...
        // Let's just return. Expect the test to navigate.
        // Actually, let's keep a goto to ensure "Logged In" state if the test checks it immediately.
        // But better to let the test navigate.
        // However, block-components does: await loginToApp; await page.goto('/permits/us').
        // So removing goto here is fine.
        // Note: We don't need to goto('/') here. The token is injected for the next navigation.
        // Tests are expected to perform their own navigation (e.g., goto('/permits/us')).
        // If a test does NOT navigate, it will fail, which is correct.
        // We remove the auto-navigation to avoid aborting resource loads if the test navigates immediately.
    } else {
        // Real mode: check if already authenticated (via global setup)
        // If on blank page, go to root to check auth state
        if (page.url() === 'about:blank') {
            await page.goto('/');
        }

        // Check for storage state or quick UI check
        if (page.url().includes('/login')) {
            const email = process.env.E2E_TEST_EMAIL || 'test@routesurvey.app';
            const password = process.env.E2E_TEST_PASSWORD || 'test-password';

            await page.getByLabel('Email').fill(email);
            await page.getByLabel('Password').fill(password);
            await page.getByRole('button', { name: 'Sign In' }).click();
            await page.waitForURL('/', { timeout: 15000 });
        } else {
            // Already authenticated or on a public page
            // console.log('Skipping login - likely authenticated via storageState');
        }
    }
}

/**
 * Helper: Navigate to Permits dashboard
 */
export async function navigateToPermitsDashboard(page: Page, projectId: string) {
    await page.getByTestId('nav-permits').click();
    await page.waitForURL(`**/projects/${projectId}/permits**`, { timeout: 10000 });
    await expect(page.getByTestId('permits-dashboard')).toBeVisible();
}

/**
 * Helper: Wait for specific element with retry
 */
export async function waitForElement(
    page: Page,
    selector: string,
    options?: { timeout?: number }
) {
    const timeout = options?.timeout || 5000;
    await expect(page.locator(selector)).toBeVisible({ timeout });
}

/**
 * Helper: Jump to field by test ID
 */
export async function jumpToField(page: Page, fieldId: string) {
    // Click the missing item or action that triggers jump
    await page.getByTestId(fieldId).scrollIntoViewIfNeeded();
    await expect(page.getByTestId(fieldId)).toBeInViewport();
}

export { expect };
