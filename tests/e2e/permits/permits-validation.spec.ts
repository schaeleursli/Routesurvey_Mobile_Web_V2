import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Permits Validation
 * 
 * Tests validation rules, status derivation, and readiness scoring.
 */

test.describe('Permits Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/permits/us');
        await page.waitForLoadState('networkidle');

        await page.click('button:has-text("New Permit Case")');
        await page.fill('input[name="title"]', 'Validation Test');
        await page.selectOption('select[name="route"]', { index: 1 });
        await page.click('button:has-text("Create Case")');

        await page.waitForURL(/\/permits\/us\/cases\/.+/);
    });

    test('should start with DRAFT status', async ({ page }) => {
        const statusBadge = page.locator('.status-badge');
        await expect(statusBadge).toContainText('draft');
        await expect(statusBadge).toHaveClass(/status-draft/);
    });

    test('should show validation warnings for missing fields', async ({ page }) => {
        // Navigate to Vehicle & Load
        await page.click('.block-nav-item:has-text("Vehicle & Load")');

        // Try to save without filling required fields
        await page.click('button:has-text("Save")');

        // Should show validation messages
        await expect(page.locator('.validation-error')).toBeVisible();
    });

    test('should update readiness score when adding data', async ({ page }) => {
        // Get initial score (should be 100)
        const initialScore = await page.locator('.score-value').textContent();
        expect(initialScore).toBe('100');

        // Add invalid dimension (triggers warning)
        await page.click('.block-nav-item:has-text("Vehicle & Load")');
        await page.fill('input[name="width-ft"]', '25'); // Very wide
        await page.click('button:has-text("Save")');

        // Wait for re-evaluation
        await page.waitForTimeout(1000);

        // Score should decrease
        const updatedScore = await page.locator('.score-value').textContent();
        expect(Number(updatedScore)).toBeLessThan(100);
    });

    test('should change to BLOCKED status with blocking issues', async ({ page }) => {
        // Mock rollup with blocking issues
        await page.route('**/api/permit-cases/*/evaluate', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    validation: {
                        blockingIssues: [
                            { field: 'transport.overall.width_m', message: 'Exceeds maximum width' }
                        ]
                    },
                    conflicts: []
                })
            });
        });

        // Trigger evaluation by saving
        await page.click('.block-nav-item:has-text("Vehicle & Load")');
        await page.fill('input[name="width-ft"]', '30');
        await page.click('button:has-text("Save")');

        // Status should change to BLOCKED
        await expect(page.locator('.status-badge')).toContainText('blocked');
        await expect(page.locator('.status-badge')).toHaveClass(/status-blocked/);
    });

    test('should change to READY status when all requirements met', async ({ page }) => {
        // Fill all required fields
        await page.click('.block-nav-item:has-text("Permit Summary")');
        await page.fill('input[name="prepared-by"]', 'Test User');
        await page.fill('input[name="survey-date"]', '2026-01-27');
        await page.click('button:has-text("Save")');

        await page.click('.block-nav-item:has-text("Vehicle & Load")');
        await page.fill('input[name="width-ft"]', '10');
        await page.fill('input[name="height-ft"]', '13');
        await page.fill('input[name="length-ft"]', '75');
        await page.fill('input[name="weight-lbs"]', '80000');
        await page.click('button:has-text("Save")');

        // Wait for evaluation
        await page.waitForTimeout(1000);

        // Status should be READY
        await expect(page.locator('.status-badge')).toContainText('ready');
        await expect(page.locator('.status-badge')).toHaveClass(/status-ready/);
    });

    test('should display conflicts in UI', async ({ page }) => {
        // Mock conflicts
        await page.route('**/api/permit-cases/*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.rollup_json = {
                conflicts: [
                    {
                        severity: 'block',
                        location: 'CA',
                        message: 'Height exceeds CA limit'
                    }
                ]
            };
            await route.fulfill({ body: JSON.stringify(json) });
        });

        await page.reload();

        // Conflicts panel should show issues
        const conflictsPanel = page.locator('.conflicts-panel');
        await expect(conflictsPanel).toBeVisible();
        await expect(conflictsPanel).toContainText('Height exceeds CA limit');
    });

    test('should show rationale for blocking issues', async ({ page }) => {
        // Mock rationale
        await page.route('**/api/permit-cases/*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.rollup_json = {
                validation: {
                    blockingIssues: [
                        {
                            field: 'transport.overall.height_m',
                            message: 'Exceeds maximum height',
                            rationale: 'CA allows max 14\' (4.27m), vehicle is 15\' (4.57m)'
                        }
                    ]
                }
            };
            await route.fulfill({ body: JSON.stringify(json) });
        });

        await page.reload();

        // Click on issue for details
        await page.click('.blocking-issue');

        // Rationale tooltip/panel should show
        await expect(page.locator('.rationale-text')).toContainText('CA allows max');
    });

    test('should update readiness score with multiple issues', async ({ page }) => {
        // Create multiple warnings/issues
        await page.route('**/api/permit-cases/*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.rollup_json = {
                validation: {
                    warnings: [
                        { message: 'Warning 1' },
                        { message: 'Warning 2' }
                    ]
                },
                conflicts: [
                    { severity: 'warn', message: 'Conflict 1' }
                ]
            };
            await route.fulfill({ body: JSON.stringify(json) });
        });

        await page.reload();

        // Score should reflect deductions
        // Each warning = -5, each conflict = -10
        const score = await page.locator('.score-value').textContent();
        expect(Number(score)).toBe(75); // 100 - 10 - 10 - 5
    });
});
