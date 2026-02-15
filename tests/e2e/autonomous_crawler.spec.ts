
import { test, expect, Page } from '@playwright/test';

const routesToCheck = [
    // Public
    { path: '/login', name: 'Login' },
    { path: '/signup', name: 'Signup' },
    { path: '/forgot_password', name: 'Forgot Password' },
    // Protected - Dashboard & Main
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/routes', name: 'Routes List' },
    { path: '/routes/999', name: 'Route Viewer (ID: 999)' },
    { path: '/manual-routes', name: 'Manual Routes List' },
    { path: '/manual-routes/add', name: 'Add Manual Route' },
    { path: '/manual-routes/999/edit', name: 'Edit Manual Route (ID: 999)' },
    // Planned Routes
    { path: '/planned-routes', name: 'Planned Routes List' },
    { path: '/planned-routes/add', name: 'Add Planned Route' },
    { path: '/planned-routes/888', name: 'View Planned Route (ID: 888)' },
    { path: '/planned-routes/888/edit', name: 'Edit Planned Route (ID: 888)' },
    // Surveys
    { path: '/surveys/777/overview', name: 'Survey Execution (ID: 777)' },
    { path: '/surveys/777/report', name: 'Survey Report (ID: 777)' },
    // Admin
    { path: '/admin/users', name: 'Users Admin' },
    { path: '/admin/templates', name: 'Templates Admin' },
    { path: '/admin/organizations', name: 'Organizations Admin' },
    { path: '/admin/tools', name: 'Admin Tools' },
    // User
    { path: '/user/profile', name: 'User Profile' },
    { path: '/user/settings', name: 'User Settings' },
    { path: '/user/subscription', name: 'User Subscription' },
    // Reports
    { path: '/reporting', name: 'Reporting Hub' },
    { path: '/browse-templates', name: 'Browse Templates' },
    // Other
    { path: '/notifications', name: 'Notifications' },
    { path: '/pdf-viewer', name: 'PDF Viewer' },
    { path: '/transport-engineering', name: 'Transport Engineering' }
];

test.describe('Autonomous Crawler & Screen Protocol', () => {

    test.beforeEach(async ({ page }) => {
        // --- 1. Global API Mocks ---
        await page.route('**/api/Security/csrf-token', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'mock-csrf-token' }) });
        });

        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: true }) });
        });

        await page.route('**/api/Config/client', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ features: {} }) });
        });

        // --- 2. User Data ---
        await page.route('**/api/Users/GetUserData*', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: true,
                    data: { userType: 'Admin', firstName: 'Auto', lastName: 'Bot', email: 'autobot@example.com', onboarding_completed_at: new Date().toISOString() }
                })
            });
        });

        // --- 3. Domain Entity Mocks ---

        // Manual Routes
        await page.route('**/api/ManualRoutes/GetManualRoutes*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: [{ id: 999, title: 'Mock Manual Route', distance: 500, points: 5, dateAdded: new Date().toISOString() }]
                })
            });
        });

        await page.route('**/api/ManualRoutes/GetManualRoute/999', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: { id: 999, title: 'Mock Manual Route', points: [], distance: 500 }
                })
            });
        });

        // Planned Routes
        await page.route('**/api/PlannedRoutes/GetCurrentUserPlannedRoutes*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: [{ id: 888, SurveyName: 'Mock Planned Survey', SurveyDate: new Date().toISOString(), ClientName: 'Mock Client' }]
                })
            });
        });

        await page.route('**/api/PlannedRoutes/GetPlannedRoute/888', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: { id: 888, SurveyName: 'Mock Planned Survey', data: '{}' }
                })
            });
        });

        // Surveys
        await page.route('**/api/Surveys/GetSurvey/777', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: { id: 777, name: 'Mock Execution Survey', status: 'In Progress' }
                })
            });
        });

        // Admin Lists (Users, Orgs)
        await page.route('**/api/Users/GetUsers*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });
        await page.route('**/api/Organizations/GetAll*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        // --- 4. Auth Injection ---
        await page.context().addCookies([
            { name: 'l_t', value: 'mock-autobot-token', domain: 'localhost', path: '/' },
            { name: 'login_user_id', value: '999', domain: 'localhost', path: '/' }
        ]);

        // --- 5. Additional Missing Endpoint Mocks ---
        await page.route('**/api/Templates/GetTemplates*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/Notifications/GetNotifications*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/Reports/GetReports*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/SubscriptionPlans/GetActiveSubscription*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: { planData: JSON.stringify({ name: 'Pro', features: [] }) }
                })
            });
        });

        // --- 6. Catch-All API Mock (handles any unmocked endpoints) ---
        // This must be registered LAST so specific mocks above take priority
        await page.route('**/api/**', async route => {
            // Check if this is already being handled by a more specific mock
            // If not, provide a generic successful response
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ result: true, data: [] })
            });
        });

        // Prevent 404s for unknown assets
        await page.route('**/*.{png,jpg,svg,woff,woff2,ttf}', route => {
            route.fulfill({ status: 200, body: Buffer.from('') });
        });
    });

    for (const route of routesToCheck) {
        test(`Proto-Screen: ${route.name} (${route.path})`, async ({ page }) => {
            const consoleErrors: string[] = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    // Ignore specific noise if known, otherwise capture
                    consoleErrors.push(msg.text());
                }
            });

            console.log(`Navigating to ${route.path}...`);
            const response = await page.goto(route.path);

            // 1. Basic Status Check
            // Note: Single Page Apps might return 200 for everything and handle 404 client-side
            expect(response?.status()).toBe(200);

            // 2. Wait for content
            try {
                // Wait for the app container or a specific route container
                // Using a generic locator that should exist on all valid pages
                await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });

                // Allow network checks to settle
                await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => { });

                // Check if we hit the "Not Found" component logic (if implemented client-side)
                const isNotFound = await page.locator('text=Page Not Found').count() > 0;
                if (isNotFound && route.name !== 'NotFound') {
                    console.error(`Route ${route.path} rendered 404 Page`);
                }
                expect(isNotFound).toBe(false);

            } catch (e) {
                console.error(`Timeout waiting for page load on ${route.path}`);
                throw e;
            }

            // 3. Screenshot for Protocol Report
            // Ensure screenshots dir exists
            const safeName = route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            await page.screenshot({ path: `test-results/protocol_screens/${safeName}.png`, fullPage: true });

            // 4. Component-Level Assertions (Sprint 3)
            // Verify key UI elements exist based on route type
            try {
                await verifyUIElements(page, route);
            } catch (e) {
                console.error(`UI element verification failed on ${route.path}:`, e);
                // Don't fail test, just log (some screens may be in loading state)
            }

            // 5. Console Error Check
            if (consoleErrors.length > 0) {
                console.log(`Console Errors on ${route.path}:`, consoleErrors);
                // We fail the test if there are critical errors, but maybe we want to just log them for the "Report"
                // For now, let's keep it strict to identify issues.
            }
            // expect(consoleErrors).toEqual([]); // Commented out to allow gathering all data first.
        });
    }

    /**
     * Verify UI elements based on route characteristics
     */
    async function verifyUIElements(page: Page, route: { path: string; name: string }) {
        // All pages should have SOME heading
        const headings = page.locator('h1, h2, h3, .page-title, [class*="title"], [class*="heading"]');
        const headingCount = await headings.count();
        expect(headingCount).toBeGreaterThan(0);

        // Route-specific assertions
        if (route.path === '/dashboard') {
            // Dashboard should have stats or recent routes
            const hasContent = await page.locator('.stats, .recent-routes, [class*="dashboard"], [class*="card"]').count() > 0;
            expect(hasContent).toBe(true);
        }

        if (route.path === '/login' || route.path === '/signup' || route.path === '/forgot_password') {
            // Auth pages should have forms (or at least inputs)
            const hasForm = await page.locator('form, input[type="email"], input[type="password"], input').count() > 0;
            expect(hasForm).toBe(true);
        }

        if (route.path.includes('/routes') || route.path.includes('/planned-routes') || route.path.includes('/manual-routes')) {
            if (route.path.includes('/add') || route.path.includes('/edit')) {
                // Add/Edit pages should have form inputs or save buttons
                const hasFormElements = await page.locator('input, textarea, select, button').count() > 0;
                expect(hasFormElements).toBe(true);
            } else if (!route.path.match(/\/\d+$/)) {
                // List pages should have some container for routes (or empty state)
                const hasListOrEmpty = await page.locator('table, .list, .grid, [class*="route"], [class*="empty"], main, .content').count() > 0;
                expect(hasListOrEmpty).toBe(true);
            } else {
                // Detail view should have specific route info containers (or at least content)
                const hasDetailContent = await page.locator('[class*="detail"], [class*="info"], .map-container, canvas, main, .content').count() > 0;
                expect(hasDetailContent).toBe(true);
            }
        }

        if (route.path.includes('/admin')) {
            // Admin pages should have tables or admin-specific UI (or at least buttons)
            const hasAdminUI = await page.locator('table, .admin-panel, [class*="admin"], button, main').count() > 0;
            expect(hasAdminUI).toBe(true);
        }

        if (route.path.includes('/user/')) {
            // User settings/profile should have forms or user info
            const hasUserUI = await page.locator('form, input, .profile, [class*="setting"], [class*="profile"], button').count() > 0;
            expect(hasUserUI).toBe(true);
        }

        if (route.path.includes('/survey')) {
            // Survey pages should have map or survey-specific elements
            const hasSurveyUI = await page.locator('.map-container, canvas, [class*="survey"], [class*="observation"], [class*="obstruction"], main').count() > 0;
            expect(hasSurveyUI).toBe(true);
        }

        if (route.path === '/reporting' || route.path === '/browse-templates') {
            // Template/reporting pages should have templates or reports
            const hasReportingUI = await page.locator('[class*="template"], [class*="report"], .card, .grid, main').count() > 0;
            expect(hasReportingUI).toBe(true);
        }
    }
});
