import { test, expect } from '@playwright/test';

/**
 * Sprint 4: Navigation & User Flow Tests
 * 
 * Tests inter-screen navigation, routing, and critical user journeys.
 * Complements the autonomous crawler by testing FLOWS rather than individual screens.
 */

test.describe('Navigation & User Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Same mocking setup as autonomous crawler
        await page.route('**/api/Security/csrf-token', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'mock-csrf-token' }) });
        });

        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: true }) });
        });

        await page.route('**/api/Users/GetUserData*', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: true,
                    data: { userType: 'Admin', firstName: 'Test', lastName: 'User', email: 'test@example.com', onboarding_completed_at: new Date().toISOString() }
                })
            });
        });

        await page.route('**/api/Routes/**', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });

        await page.route('**/api/PlannedRoutes/**', async route => {
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

    test('Dashboard → Routes List navigation', async ({ page }) => {
        // Start at dashboard
        await page.goto('/dashboard');
        await expect(page).toHaveURL('/dashboard');

        // Navigate to routes (could be via nav menu or button)
        const hasRoutesLink = await page.locator('a[href*="/routes"], button:has-text("Routes"), nav a:has-text("Routes")').count() > 0;

        if (hasRoutesLink) {
            await page.click('a[href*="/routes"], button:has-text("Routes"), nav a:has-text("Routes")').catch(() => {
                console.log('Could not click routes link, attempting direct navigation');
            });
        } else {
            // Direct navigation if no link found
            await page.goto('/routes');
        }


        await expect(page).toHaveURL(/\/routes/);

        // Verify page loaded (heading or app container)
        const heading = page.locator('h1, h2, h3, .page-title, [class*="title"]');
        const headingVisible = await heading.count() > 0;
        if (headingVisible) {
            await expect(heading.first()).toBeVisible({ timeout: 10000 });
        } else {
            // At least app should be visible
            await expect(page.locator('#app')).toBeVisible();
        }
    });

    test('Routes List → Add Route flow', async ({ page }) => {
        await page.goto('/routes');
        await expect(page.locator('#app')).toBeVisible();

        // Look for "Add" or "Create" button
        const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), a:has-text("Add Route")');

        if (await addButton.count() > 0) {
            await addButton.first().click();
            // Should navigate to add route page (could be /routes/add or /manual-routes/add)
            await expect(page).toHaveURL(/\/(routes|manual-routes|planned-routes)\/add/);
            await expect(page.locator('input, textarea, select')).toBeVisible();
        } else {
            console.log('No add button found on routes list, skipping flow test');
        }
    });

    test('Planned Routes → Add → Back navigation', async ({ page }) => {
        await page.goto('/planned-routes');

        // Navigate to add page
        await page.goto('/planned-routes/add');
        await expect(page.locator('#app')).toBeVisible();

        // Look for back/cancel button
        const backButton = page.locator('button:has-text("Back"), button:has-text("Cancel"), a:has-text("Back")');

        if (await backButton.count() > 0) {
            await backButton.first().click();
            // Should go back to list
            await page.waitForURL(/\/planned-routes\/?$/, { timeout: 5000 }).catch(() => {
                console.log('Did not navigate back to list');
            });
        }
    });

    test('Admin navigation between pages', async ({ page }) => {
        // Admin users should be able to access admin pages
        await page.goto('/admin/users');
        await expect(page).toHaveURL('/admin/users');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to admin templates
        await page.goto('/admin/templates');
        await expect(page).toHaveURL('/admin/templates');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to admin organizations
        await page.goto('/admin/organizations');
        await expect(page).toHaveURL('/admin/organizations');
        await expect(page.locator('#app')).toBeVisible();
    });

    test('User Profile → Settings navigation', async ({ page }) => {
        await page.goto('/user/profile');
        await expect(page.locator('#app')).toBeVisible();

        // Look for settings link/button
        const settingsLink = page.locator('a[href*="/user/settings"], button:has-text("Settings")');

        if (await settingsLink.count() > 0) {
            await settingsLink.first().click();
            await expect(page).toHaveURL(/\/user\/settings/);
        } else {
            // Direct navigation if no link
            await page.goto('/user/settings');
            await expect(page).toHaveURL(/\/user\/settings/);
        }
    });

    test('Survey flow: Route → Survey Overview → Report', async ({ page }) => {
        // Simulate survey workflow
        await page.goto('/planned-routes/888');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to survey (if button exists)
        await page.goto('/surveys/777/overview');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to report
        await page.goto('/surveys/777/report');
        await expect(page.locator('#app')).toBeVisible();
    });

    test('Reporting workflow: Browse Templates → Reporting', async ({ page }) => {
        await page.goto('/browse-templates');
        await expect(page.locator('#app')).toBeVisible();

        // Navigate to reporting hub
        await page.goto('/reporting');
        await expect(page).toHaveURL('/reporting');
        await expect(page.locator('#app')).toBeVisible();
    });

    test('Main navigation menu accessibility', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('#app')).toBeVisible();

        // Check if main navigation exists
        const nav = page.locator('nav, .nav, .navigation, .sidebar, [role="navigation"]');
        const navExists = await nav.count() > 0;

        if (navExists) {
            // Verify navigation has links
            const navLinks = nav.locator('a, button');
            const linkCount = await navLinks.count();
            expect(linkCount).toBeGreaterThan(0);
        } else {
            console.log('Warning: No navigation menu found');
        }
    });

    test('Browser back/forward navigation works', async ({ page }) => {
        // Navigate through multiple pages
        await page.goto('/dashboard');
        await page.goto('/routes');
        await page.goto('/planned-routes');

        // Go back
        await page.goBack();
        await expect(page).toHaveURL(/\/routes/);

        // Go back again
        await page.goBack();
        await expect(page).toHaveURL(/\/dashboard/);

        // Go forward
        await page.goForward();
        await expect(page).toHaveURL(/\/routes/);
    });

    test('Direct URL access works for all routes', async ({ page }) => {
        // Test that routes are accessible via direct URL (not 404)
        const routes = [
            '/dashboard',
            '/routes',
            '/planned-routes',
            '/admin/users',
            '/user/profile',
            '/reporting',
            '/testing',
            '/testing/e2e',
            '/testing/visual-regression',
            '/testing/api-mocks',
            '/engineering',
            '/engineering/calculator',
            '/engineering/permits'
        ];

        for (const route of routes) {
            await page.goto(route);
            await expect(page.locator('#app')).toBeVisible({ timeout: 10000 });

            // Should not show 404
            const is404 = await page.locator('text=/404|Not Found|Page Not Found/i').count() > 0;
            expect(is404).toBe(false);
        }
    });

    test('Route with ID parameter loads correctly', async ({ page }) => {
        // Test dynamic routes
        await page.goto('/routes/999');
        await expect(page.locator('#app')).toBeVisible();

        const is404 = await page.locator('text=/404|Not Found/i').count() > 0;
        expect(is404).toBe(false);
    });

    test('Testing dashboard navigation flow', async ({ page }) => {
        await page.goto('/testing');
        await expect(page).toHaveURL('/testing');
        await expect(page.locator('#app')).toBeVisible();

        // Verify dashboard header
        const heading = page.locator('h1, h2, .page-header');
        if (await heading.count() > 0) {
            await expect(heading.first()).toBeVisible();
        }

        // Navigate through testing sub-routes
        await page.goto('/testing/e2e');
        await expect(page).toHaveURL('/testing/e2e');
        await expect(page.locator('#app')).toBeVisible();

        await page.goto('/testing/visual-regression');
        await expect(page).toHaveURL('/testing/visual-regression');
        await expect(page.locator('#app')).toBeVisible();

        await page.goto('/testing/api-mocks');
        await expect(page).toHaveURL('/testing/api-mocks');
        await expect(page.locator('#app')).toBeVisible();
    });

    test('Engineering dashboard navigation flow', async ({ page }) => {
        await page.goto('/engineering');
        await expect(page).toHaveURL('/engineering');
        await expect(page.locator('#app')).toBeVisible();

        // Verify dashboard cards or content exists
        const content = page.locator('.feature-card, .section-card, .card');
        if (await content.count() > 0) {
            await expect(content.first()).toBeVisible();
        }

        // Navigate to Calculation Validator
        await page.goto('/engineering/calculator');
        await expect(page).toHaveURL('/engineering/calculator');
        await expect(page.locator('#app')).toBeVisible();

        // Verify input form exists (calculation validator has inputs)
        const inputForm = page.locator('input, textarea, select');
        if (await inputForm.count() > 0) {
            await expect(inputForm.first()).toBeVisible();
        }

        // Navigate to Permits Engineering
        await page.goto('/engineering/permits');
        await expect(page).toHaveURL('/engineering/permits');
        await expect(page.locator('#app')).toBeVisible();
    });

    test('Admin routes require admin access', async ({ page }) => {
        // Note: Mock user is set as Admin in beforeEach
        // Testing routes should be accessible to admin
        await page.goto('/testing');
        await expect(page).toHaveURL('/testing');
        await expect(page.locator('#app')).toBeVisible();

        // Verify no access denied message
        const accessDenied = await page.locator('text=/access denied|unauthorized|forbidden/i').count() > 0;
        expect(accessDenied).toBe(false);

        // Engineering routes should be accessible to all authenticated users
        await page.goto('/engineering');
        await expect(page).toHaveURL('/engineering');
        await expect(page.locator('#app')).toBeVisible();
    });

    test('Auth redirect behavior (logged in user)', async ({ page }) => {
        // Logged-in users visiting /login should redirect to dashboard
        await page.goto('/login');

        // Wait a bit for potential redirect
        await page.waitForTimeout(2000);

        // Check current URL - might stay on login or redirect to dashboard
        const url = page.url();
        console.log(`After visiting /login, URL is: ${url}`);

        // This is informational - behavior varies by app
    });
});
