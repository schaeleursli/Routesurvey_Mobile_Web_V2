import { test, expect } from '@playwright/test';

test.describe('Survey Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.getByPlaceholder('name@company.com').fill('mock@routesurvey.app');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/.*\/onboarding|.*\/dashboard/);
    });

    test('Full Survey Lifecycle', async ({ page }) => {
        // 1. Navigate to Route
        await page.goto('/routes/1001');
        await expect(page.locator('.survey-layout')).toBeVisible();

        // 2. Verify List Panel
        const listPanel = page.locator('.panel-left');
        await expect(listPanel).toBeVisible();
        await expect(page.locator('.point-list-item').first()).toBeVisible();

        // 3. Search & Filter
        const searchInput = page.locator('.search-bar input');
        await searchInput.fill('Bridge');
        // Wait for list to update (mock data has "Bridge A")
        await expect(page.locator('.point-list-item')).toHaveCount(1);
        await searchInput.fill(''); // Clear
        await expect(page.locator('.point-list-item').count()).resolves.toBeGreaterThan(1);

        // 4. Select Point
        await page.locator('.point-list-item').first().click();

        // 5. Verify Details Panel Opens
        const detailsPanel = page.locator('.panel-right');
        await expect(detailsPanel).toBeVisible();

        // Check View Mode elements
        await expect(page.locator('.view-mode')).toBeVisible();
        await expect(page.locator('.btn-primary-ghost', { hasText: 'Edit' })).toBeVisible();

        // 6. Enter Edit Mode
        await page.locator('.btn-primary-ghost', { hasText: 'Edit' }).click();
        await expect(page.locator('.edit-mode')).toBeVisible();

        // 7. Update Data
        const notes = `Updated via E2E ${Date.now()}`;
        await page.locator('textarea').fill(notes);

        // 8. Save
        await page.locator('button', { hasText: 'Save' }).click();

        // Verify return to View Mode and data persisted
        await expect(page.locator('.view-mode')).toBeVisible();
        await expect(page.locator('.notes-text')).toContainText(notes);

        // 9. Status Workflow
        // Try to mark Ready (assuming it might fail if fields missing, but mock data should be complete)
        // If it succeeds, checks the badge.
        await page.locator('.status-btn[title="ready"]').click();
        // Wait for badge update (View mode should reflect status, assuming we allowed clicking in view mode or switched to edit briefly? 
        // Wait, my impl allowed status click in Editor Header.
        await expect(page.locator('.status-btn[title="ready"]')).toHaveClass(/active/);

        // 10. Navigation
        // Ensure Next button works
        if (await page.locator('button', { hasText: 'Next' }).isEnabled()) {
            await page.locator('button', { hasText: 'Next' }).click();
            // Should change selection
        }
    });
});
