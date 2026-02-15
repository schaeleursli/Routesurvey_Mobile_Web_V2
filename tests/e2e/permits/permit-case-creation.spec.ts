import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Permit Case Creation
 * 
 * Tests the core workflow of creating a new US permit case.
 */

test.describe('Permit Case Creation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to permits page
        await page.goto('/permits/us');
        await page.waitForLoadState('networkidle');
    });

    test('should display permits list page', async ({ page }) => {
        // Check page title
        await expect(page.locator('h1')).toContainText('US Permits');

        // Check for create button
        const createButton = page.locator('button:has-text("New Permit Case")');
        await expect(createButton).toBeVisible();
    });

    test('should create a new permit case', async ({ page }) => {
        // Click create button
        await page.click('button:has-text("New Permit Case")');

        // Fill in basic information
        await page.fill('input[name="title"]', 'Test Permit - E2E');
        await page.selectOption('select[name="route"]', { index: 1 });

        // Submit
        await page.click('button:has-text("Create Case")');

        // Wait for navigation to workspace
        await page.waitForURL(/\/permits\/us\/cases\/.+/);

        // Verify workspace loaded
        await expect(page.locator('h2')).toContainText('Test Permit - E2E');

        // Verify initial status
        const statusBadge = page.locator('.status-badge');
        await expect(statusBadge).toContainText('draft');
    });

    test('should display default blocks', async ({ page }) => {
        // Create a case first
        await page.click('button:has-text("New Permit Case")');
        await page.fill('input[name="title"]', 'Block Test Case');
        await page.selectOption('select[name="route"]', { index: 1 });
        await page.click('button:has-text("Create Case")');

        await page.waitForURL(/\/permits\/us\/cases\/.+/);

        // Check for required blocks in sidebar
        await expect(page.locator('.block-nav-item:has-text("Permit Summary")')).toBeVisible();
        await expect(page.locator('.block-nav-item:has-text("Vehicle & Load")')).toBeVisible();
        await expect(page.locator('.block-nav-item:has-text("State Requirements")')).toBeVisible();
    });

    test('should show correct initial readiness score', async ({ page }) => {
        // Create case
        await page.click('button:has-text("New Permit Case")');
        await page.fill('input[name="title"]', 'Readiness Test');
        await page.selectOption('select[name="route"]', { index: 1 });
        await page.click('button:has-text("Create Case")');

        await page.waitForURL(/\/permits\/us\/cases\/.+/);

        // Check readiness score widget
        const scoreWidget = page.locator('.readiness-score-widget');
        await expect(scoreWidget).toBeVisible();

        // Initial score should be 100 (no issues yet)
        const scoreValue = page.locator('.score-value');
        await expect(scoreValue).toHaveText('100');
    });

    test('should persist case data after creation', async ({ page }) => {
        // Create case
        await page.click('button:has-text("New Permit Case")');
        const testTitle = `Persistence Test ${Date.now()}`;
        await page.fill('input[name="title"]', testTitle);
        await page.selectOption('select[name="route"]', { index: 1 });
        await page.click('button:has-text("Create Case")');

        await page.waitForURL(/\/permits\/us\/cases\/.+/);

        // Extract case ID from URL
        const url = page.url();
        const caseId = url.match(/cases\/([^/]+)/)?.[1];

        // Navigate away
        await page.goto('/permits/us');

        // Navigate back to case
        await page.goto(`/permits/us/cases/${caseId}`);

        // Verify data persisted
        await expect(page.locator('h2')).toContainText(testTitle);
    });
});
