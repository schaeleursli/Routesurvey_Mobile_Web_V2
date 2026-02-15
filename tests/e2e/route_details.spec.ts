import { test, expect } from '@playwright/test';

test.describe('Route Details Debug', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByPlaceholder('name@company.com').fill('mock@routesurvey.app');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.locator('button[type="submit"]').click();

        // Wait for ANY valid auth state
        await expect(page).toHaveURL(/.*\/onboarding|.*\/dashboard/);
    });

    test('should load route details for 1001', async ({ page }) => {
        // Enable console logging
        page.on('console', msg => console.log(`BROWSER [${msg.type()}]: "${msg.text()}"`));
        page.on('pageerror', err => console.log(`BROWSER EXCEPTION: "${err}"`));

        // Navigate to route
        await page.goto('/routes/1001');
        await page.waitForLoadState('networkidle');

        console.log('CURRENT URL:', page.url());

        // Check for success or error
        // If blank, these assertions will fail
        await expect(page.locator('.route-viewer-redesign')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.route-title')).toBeVisible();

        // Check if items are loaded
        await expect(page.locator('.list-item').first()).toBeVisible();
        // Check for specific item content (address and type from mock)
        await expect(page.locator('.item-type').first()).toContainText('Bridge');
        await expect(page.locator('.item-location').first()).toContainText('Bridge A');
        // await expect(page.locator('.meta-icon')).toBeVisible(); // Depends on mock data having images

        // Click item to open editor
        await page.locator('.list-item').first().click();

        // Expect Editor to be visible
        await expect(page.locator('.observation-editor')).toBeVisible();
        await expect(page.locator('.back-btn')).toBeVisible();

        // Check for new Premium UI Headers
        await expect(page.locator('h4.card-title', { hasText: 'Core Information' })).toBeVisible();
        await expect(page.locator('h4.card-title', { hasText: 'Images' })).toBeVisible();

        // Check for Add Photo button
        await expect(page.locator('.btn-text-primary', { hasText: 'Add Photo' })).toBeVisible();

        // Check if correct item type loaded (using new wrapper structure)
        await expect(page.locator('.select-wrapper select')).toHaveValue('bridge');

        // Go back
        await page.locator('.back-btn').click();
        await expect(page.locator('.observation-list')).toBeVisible();
    });
});
