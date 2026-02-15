import { test, expect, type Page } from '@playwright/test';

const routesToCheck = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/routes', name: 'Routes' },
    { path: '/manual-routes', name: 'Manual Routes' },
    { path: '/admin/users', name: 'Users Admin' },
    { path: '/reporting', name: 'Reporting' },
    { path: '/browse-templates', name: 'Browse Templates' },
    { path: '/admin/templates', name: 'Manage Templates' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/admin/organizations', name: 'Organizations Admin' },
    { path: '/user/profile', name: 'User Profile' },
    { path: '/planning', name: 'Planning Tool' },
    { path: '/transport-engineering', name: 'Transport Engineering' },
    { path: '/pdf-viewer', name: 'PDF Viewer' }
];

test.describe('App Link & Stability Check', () => {

    test.beforeEach(async ({ page }) => {
        // --- Catch-All API Mock (Success by default) ---
        // Registered first so specific mocks (registered later) take precedence.
        await page.route('**/api/**', async route => {
            // Only fulfill if not handled by later routes? 
            // Actually, Playwright checks routes in reverse order.
            // So if I register this FIRST, it is checked LAST.
            // Perfect.
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: true, data: [] }) });
        });

        // --- Mock Global Auth & Config ---
        await page.route('**/api/Security/csrf-token', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'mock-csrf-token' }) });
        });

        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: true }) });
        });

        await page.route('**/api/Config/client', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ features: {} }) });
        });

        // Mock User Data
        await page.route('**/api/Users/GetUserData', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: true,
                    data: { userType: 'Admin', firstName: 'Test', lastName: 'User', email: 'test@example.com' }
                })
            });
        });

        // Set Auth Cookie
        await page.context().addCookies([
            { name: 'l_t', value: 'mock-valid-token', domain: 'localhost', path: '/' },
            { name: 'login_user_id', value: '123', domain: 'localhost', path: '/' }
        ]);

        // Mock specific data endpoints to prevent 500s on page load
        await page.route('**/api/Users/GetUsers', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/ManualRoutes/GetManualRoutes*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/SubscriptionPlans/GetSubscriptionPlans', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });
    });

    for (const route of routesToCheck) {
        test(`Visit ${route.name} (${route.path}) - No Console Errors`, async ({ page }) => {
            const consoleErrors: string[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const text = msg.text();
                    const ignoredPatterns = [
                        /Failed to load resource: net::ERR_FAILED.*\.png$/,
                        /favicon\.ico.*404/,
                        /Source map error/,
                        /\[Vue warn\]: Property ".*" was accessed during render but is not defined/,
                        /Third-party cookie/,
                        /DevTools failed to load source map/
                    ];
                    if (!ignoredPatterns.some(p => p.test(text))) {
                        consoleErrors.push(text);
                    }
                }
            });

            const response = await page.goto(route.path);

            // 1. Check HTTP Status (Frontend routing should return 200 or 304)
            // Note: In SPA, index.html is served, so 200 is expected.
            expect(response?.status()).toBe(200);

            // 2. Wait for app shell to load
            await expect(page.locator('#app')).toBeVisible();

            // 3. Simple Visibility Check (Header or Main Content)
            // Most pages have a BasePanel or BaseCard
            // We verify that the main view container didn't crash (is not empty)
            await expect(page.locator('main, .main-content, .router-view, .dashboard-container, .users-admin, .base-panel, .planning-view-wizard').first()).toBeVisible();

            // 4. Assert No Console Errors
            if (consoleErrors.length > 0) {
                console.error(`Console Errors on ${route.path}:`, consoleErrors);
            }
            expect(consoleErrors).toEqual([]);
        });
    }
});
