import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Engineering Integration
 * 
 * Tests the Phase 2 engineering linkage, sync, and override workflows.
 */

test.describe('Engineering Integration', () => {
    let caseId: string;

    test.beforeEach(async ({ page }) => {
        // Create a test permit case
        await page.goto('/permits/us');
        await page.waitForLoadState('networkidle');

        await page.click('button:has-text("New Permit Case")');
        await page.fill('input[name="title"]', 'Engineering Integration Test');
        await page.selectOption('select[name="route"]', { index: 1 });
        await page.click('button:has-text("Create Case")');

        await page.waitForURL(/\/permits\/us\/cases\/.+/);

        // Extract case ID
        const url = page.url();
        caseId = url.match(/cases\/([^/]+)/)?.[1] || '';
    });

    test('should show "not linked" status initially', async ({ page }) => {
        // Check engineering status badge
        const linkButton = page.locator('button:has-text("Link Engineering")');
        await expect(linkButton).toBeVisible();
    });

    test('should open link engineering modal', async ({ page }) => {
        // Click link button
        await page.click('button:has-text("Link Engineering")');

        // Modal should appear
        const modal = page.locator('.link-engineering-modal');
        await expect(modal).toBeVisible();

        // Check modal title
        await expect(page.locator('.modal-header h3')).toContainText('Link Engineering Calculation');

        // Check for calc job selector
        await expect(page.locator('select[name="calc-job"]')).toBeVisible();

        // Close modal
        await page.click('button:has-text("Cancel")');
        await expect(modal).not.toBeVisible();
    });

    test('should link engineering calculation', async ({ page }) => {
        // Setup: Mock API to have available calc jobs
        await page.route('**/api/calc-jobs?project=*', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    {
                        id: 'calc-job-123',
                        name: 'Test Calculation',
                        status: 'complete',
                        created_at: new Date().toISOString()
                    }
                ])
            });
        });

        // Open modal
        await page.click('button:has-text("Link Engineering")');

        // Select calc job
        await page.selectOption('select[name="calc-job"]', 'calc-job-123');

        // Submit
        await page.click('button:has-text("Link Engineering")');

        // Modal should close
        await expect(page.locator('.link-engineering-modal')).not.toBeVisible();

        // Should show "linked" badge
        await expect(page.locator('.engineering-badge:has-text("Engineering Linked")')).toBeVisible();
    });

    test('should display field source chips after linking', async ({ page }) => {
        // Link engineering first (setup)
        await page.route('**/api/calc-jobs?project=*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([{ id: 'calc-123', name: 'Test', status: 'complete', created_at: new Date().toISOString() }])
            });
        });

        await page.click('button:has-text("Link Engineering")');
        await page.selectOption('select[name="calc-job"]', { index: 0 });
        await page.click('.modal-footer button:has-text("Link")');

        // Navigate to Vehicle & Load block
        await page.click('.block-nav-item:has-text("Vehicle & Load")');

        // Check for source chips on fields
        const sourceChips = page.locator('.source-chip');
        await expect(sourceChips.first()).toBeVisible();
        await expect(sourceChips.first()).toContainText('Eng');
    });

    test('should show manual override warning', async ({ page }) => {
        // Link engineering first
        await page.route('**/api/calc-jobs?project=*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([{ id: 'calc-123', name: 'Test', status: 'complete', created_at: new Date().toISOString() }])
            });
        });

        await page.click('button:has-text("Link Engineering")');
        await page.selectOption('select[name="calc-job"]', { index: 0 });
        await page.click('.modal-footer button:has-text("Link")');

        // Go to Vehicle & Load
        await page.click('.block-nav-item:has-text("Vehicle & Load")');

        // Try to edit an engineering-sourced field
        const widthInput = page.locator('input[name="width"]');
        await widthInput.click();
        await widthInput.fill('20.5');

        // Should show override warning
        const warning = page.locator('.override-warning');
        await expect(warning).toBeVisible();
        await expect(warning).toContainText('This will override engineering data');
    });

    test('should change source to MANUAL after override', async ({ page }) => {
        // Link, then override
        await page.route('**/api/calc-jobs?project=*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([{ id: 'calc-123', name: 'Test', status: 'complete', created_at: new Date().toISOString() }])
            });
        });

        await page.click('button:has-text("Link Engineering")');
        await page.selectOption('select[name="calc-job"]', { index: 0 });
        await page.click('.modal-footer button:has-text("Link")');

        await page.click('.block-nav-item:has-text("Vehicle & Load")');

        // Override field
        await page.fill('input[name="width"]', '20.5');
        await page.click('button:has-text("Confirm Override")');

        // Source chip should change to MANUAL
        const sourceChip = page.locator('.source-chip').first();
        await expect(sourceChip).toContainText('Manual');
    });

    test('should detect out-of-sync status', async ({ page }) => {
        // This test requires calc job to update after linking
        // Mock scenario where calc job was updated

        await page.route('**/api/permit-cases/*/engineering-status', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    is_linked: true,
                    linked_calc_job_id: 'calc-123',
                    out_of_sync: true
                })
            });
        });

        // Reload page to get fresh status
        await page.reload();

        // Should show sync button
        const syncButton = page.locator('button:has-text("Sync")');
        await expect(syncButton).toBeVisible();

        // Badge should indicate out of sync
        const badge = page.locator('.engineering-status-badge');
        await expect(badge).toHaveClass(/out-of-sync/);
    });
});
