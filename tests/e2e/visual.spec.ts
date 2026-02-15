import { test, expect, type Page } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('Visual Regression Baseline', async ({ page }: { page: Page }) => {
    // Mock backend to ensure consistent state for visual tests
    await page.route('**/api/Security/csrf-token', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'mock-csrf-token' }) });
    });
    await page.route('**/api/Auth/status', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: false }) });
    });
    await page.route('**/api/Config/client', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ features: {} }) });
    });
    // Mock User Trail
    await page.route('**/api/Users/IsUserTrailExpired/*', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: true, data: false, remainingDays: 30 }) });
    });
    // Mock Subscription
    await page.route('**/api/SubscriptionPlans/GetActiveSubscription', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                result: true,
                data: { planData: JSON.stringify({ name: 'Pro', features: ['manual_routes'] }) }
            })
        });
    });

    await page.goto('/');
    await expect(page.locator('#app').first()).toBeVisible();

    // Take snapshot
    await percySnapshot(page, 'Dashboard');
});
