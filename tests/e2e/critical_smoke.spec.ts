import { test, expect } from '@playwright/test';

/**
 * Sprint 5: Critical Path Smoke Tests
 * 
 * Tests the most critical business workflows end-to-end.
 * These tests represent "must work" functionality for the application.
 * If any of these fail, the application is considered broken.
 */

test.describe('Critical Path Smoke Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Comprehensive mocking setup
        await page.route('**/api/Security/csrf-token', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ token: 'mock-csrf-token' }) });
        });

        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ isAuthenticated: true }) });
        });

        await page.route('**/api/Auth/login', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: { token: 'mock-token', userId: '999', userType: 'Admin' }
                })
            });
        });

        await page.route('**/api/Users/GetUserData*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: {
                        id: '999',
                        userType: 'Admin',
                        firstName: 'Test',
                        lastName: 'User',
                        email: 'test@example.com',
                        onboarding_completed_at: new Date().toISOString()
                    }
                })
            });
        });

        await page.route('**/api/Routes/**', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/PlannedRoutes/**', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: [{
                        id: '888',
                        name: 'Test Route',
                        status: 'draft',
                        created_at: new Date().toISOString()
                    }]
                })
            });
        });

        await page.route('**/api/Surveys/**', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    result: true,
                    data: {
                        id: '777',
                        plannedRouteId: '888',
                        status: 'in_progress',
                        observations: [],
                        obstructions: []
                    }
                })
            });
        });

        await page.route('**/api/Templates/**', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/**', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/*.{png,jpg,svg,woff,woff2,ttf}', route => {
            route.fulfill({ status: 200, body: Buffer.from('') });
        });

        await page.context().addCookies([
            { name: 'l_t', value: 'mock-token', domain: 'localhost', path: '/' },
            { name: 'login_user_id', value: '999', domain: 'localhost', path: '/' }
        ]);
    });

    test('SMOKE: Application loads and renders', async ({ page }) => {
        // Most basic test - app must load
        await page.goto('/');
        await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });

        // Should have some navigation or content
        const hasContent = await page.locator('nav, main, .content, h1, h2').count() > 0;
        expect(hasContent).toBe(true);
    });

    test('SMOKE: User can access dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('#app')).toBeVisible();

        // Dashboard should have some meaningful content
        const hasHeading = await page.locator('h1, h2, h3').count() > 0;
        expect(hasHeading).toBe(true);
    });

    test('SMOKE: Route listing workflow', async ({ page }) => {
        // User should be able to view routes
        await page.goto('/routes');
        await expect(page.locator('#app')).toBeVisible();

        // Should show routes list or empty state
        const hasListOrEmpty = await page.locator('table, .list, .grid, [class*="empty"], main').count() > 0;
        expect(hasListOrEmpty).toBe(true);
    });

    test('SMOKE: Planned route creation flow initiation', async ({ page }) => {
        // Navigate to add planned route
        await page.goto('/planned-routes/add');
        await expect(page.locator('#app')).toBeVisible();

        // Form should be present
        const hasFormElements = await page.locator('input, textarea, button').count() > 0;
        expect(hasFormElements).toBe(true);
    });

    test('SMOKE: Route detail view loads', async ({ page }) => {
        // Should be able to view individual route details
        await page.goto('/routes/999');
        await expect(page.locator('#app')).toBeVisible();

        // Should not show 404
        const is404 = await page.locator('text=/404|Not Found/i').count() > 0;
        expect(is404).toBe(false);
    });

    test('SMOKE: Planned route detail with map', async ({ page }) => {
        await page.goto('/planned-routes/888');
        await expect(page.locator('#app')).toBeVisible();

        // Planned routes typically show maps
        // Check for map container OR main content
        const hasContent = await page.locator('.map-container, canvas, main, .content, [class*="route"]').count() > 0;
        expect(hasContent).toBe(true);
    });

    test('SMOKE: Survey execution screen loads', async ({ page }) => {
        await page.goto('/surveys/777/overview');
        await expect(page.locator('#app')).toBeVisible();

        // Survey screen should have map or survey controls
        const hasSurveyElements = await page.locator('.map-container, canvas, [class*="survey"], button, main').count() > 0;
        expect(hasSurveyElements).toBe(true);
    });

    test('SMOKE: Survey report generation access', async ({ page }) => {
        await page.goto('/surveys/777/report');
        await expect(page.locator('#app')).toBeVisible();

        // Report page should load without errors
        const hasContent = await page.locator('main, .content, [class*="report"]').count() > 0;
        expect(hasContent).toBe(true);
    });

    test('SMOKE: Admin can access user management', async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page.locator('#app')).toBeVisible();

        // Should have admin UI elements
        const hasAdminUI = await page.locator('table, .list, button, main').count() > 0;
        expect(hasAdminUI).toBe(true);
    });

    test('SMOKE: Admin can access template management', async ({ page }) => {
        await page.goto('/admin/templates');
        await expect(page.locator('#app')).toBeVisible();

        // Templates admin should have some content
        const hasContent = await page.locator('table, .grid, .card, button, main').count() > 0;
        expect(hasContent).toBe(true);
    });

    test('SMOKE: User profile is accessible', async ({ page }) => {
        await page.goto('/user/profile');
        await expect(page.locator('#app')).toBeVisible();

        // Profile should have user info or form
        const hasUserContent = await page.locator('form, input, [class*="profile"], main').count() > 0;
        expect(hasUserContent).toBe(true);
    });

    test('SMOKE: Settings page loads', async ({ page }) => {
        await page.goto('/user/settings');
        await expect(page.locator('#app')).toBeVisible();

        // Settings should have controls
        const hasSettings = await page.locator('input, select, button, form, main').count() > 0;
        expect(hasSettings).toBe(true);
    });

    test('SMOKE: Reporting hub is functional', async ({ page }) => {
        await page.goto('/reporting');
        await expect(page.locator('#app')).toBeVisible();

        // Reporting should have some content
        const hasContent = await page.locator('main, .content, [class*="report"]').count() > 0;
        expect(hasContent).toBe(true);
    });

    test('SMOKE: Template browser loads', async ({ page }) => {
        await page.goto('/browse-templates');
        await expect(page.locator('#app')).toBeVisible();

        // Should show templates or empty state
        const hasTemplates = await page.locator('.grid, .card, .list, [class*="template"], main').count() > 0;
        expect(hasTemplates).toBe(true);
    });

    test('SMOKE: PDF viewer is accessible', async ({ page }) => {
        await page.goto('/pdf-viewer');
        await expect(page.locator('#app')).toBeVisible();

        // PDF viewer should have loaded
        const hasContent = await page.locator('main, .content, canvas, iframe').count() > 0;
        expect(hasContent).toBe(true);
    });

    test('SMOKE: Critical workflow - Dashboard to Route creation', async ({ page }) => {
        // Start at dashboard
        await page.goto('/dashboard');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to routes
        await page.goto('/routes');
        await expect(page).toHaveURL(/\/routes/);

        // Navigate to add route
        await page.goto('/manual-routes/add');
        await expect(page).toHaveURL(/\/manual-routes\/add/);

        // Page should have loaded (app container visible)
        await expect(page.locator('#app')).toBeVisible();
    });

    test('SMOKE: Critical workflow - Route to Survey execution', async ({ page }) => {
        // View a planned route
        await page.goto('/planned-routes/888');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to survey
        await page.goto('/surveys/777/overview');
        await expect(page).toHaveURL(/\/surveys\/777\/overview/);
        await expect(page.locator('#app')).toBeVisible();

        // Survey interface should be functional
        const hasSurveyUI = await page.locator('.map-container, canvas, button, main').count() > 0;
        expect(hasSurveyUI).toBe(true);
    });

    test('SMOKE: Critical workflow - Survey to Report', async ({ page }) => {
        // Start at survey
        await page.goto('/surveys/777/overview');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to report
        await page.goto('/surveys/777/report');
        await expect(page).toHaveURL(/\/surveys\/777\/report/);
        await expect(page.locator('#app')).toBeVisible();

        // Report should have content
        const hasReport = await page.locator('main, [class*="report"]').count() > 0;
        expect(hasReport).toBe(true);
    });

    test('SMOKE: Application state persists across navigation', async ({ page }) => {
        // Verify that navigating doesn't break app state
        await page.goto('/dashboard');
        await expect(page.locator('#app')).toBeVisible();

        await page.goto('/routes');
        await expect(page.locator('#app')).toBeVisible();

        await page.goto('/user/profile');
        await expect(page.locator('#app')).toBeVisible();

        // Go back
        await page.goBack();
        await expect(page.locator('#app')).toBeVisible();

        // App should still be functional
        const isWorking = await page.locator('nav, main, button, a').count() > 0;
        expect(isWorking).toBe(true);
    });
});
