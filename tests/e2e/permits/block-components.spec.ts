import { test, expect } from '@playwright/test';
import { loginToApp } from './fixtures/global-fixtures';

/**
 * E2E Tests: Block Components
 * 
 * Tests all 10 permit block components for proper rendering and interaction.
 */

test.describe('Block Components', () => {
    test.beforeEach(async ({ page }) => {
        // Create test case with all blocks
        await loginToApp(page, 'real');
        await page.goto('/dashboard');
        // Wait for dashboard to be ready
        // Wait for dashboard to be ready (increased timeout for CI/Build mode)
        await expect(page.locator('button:has-text("New Permit Case")')).toBeVisible({ timeout: 30000 });

        await page.click('button:has-text("New Permit Case")');
        await page.fill('input[name="title"]', 'Block Components Test');
        await page.selectOption('select[name="route"]', { index: 1 });
        await page.click('button:has-text("Create Case")');

        await page.waitForURL(/\/permits\/us\/cases\/.+/);
    });

    test('Permit Summary Block - should display and edit metadata', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Permit Summary")');

        // Check block is visible
        await expect(page.locator('.permit-summary-block')).toBeVisible();

        // Fill in fields
        await page.fill('input[name="prepared-by"]', 'John Doe');
        await page.fill('input[name="survey-date"]', '2026-01-27');

        // Save
        await page.click('button:has-text("Save")');

        // Reload and verify persisted
        await page.reload();
        await page.click('.block-nav-item:has-text("Permit Summary")');
        await expect(page.locator('input[name="prepared-by"]')).toHaveValue('John Doe');
    });

    test('Vehicle & Load Block - should input dimensions in imperial', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Vehicle & Load")');

        // Input imperial dimensions
        await page.fill('input[name="width-ft"]', '19');
        await page.fill('input[name="width-in"]', '6');
        await page.fill('input[name="height-ft"]', '18');
        await page.fill('input[name="height-in"]', '11');

        // Check metric conversion displays
        const widthMetric = page.locator('.metric-display.width');
        await expect(widthMetric).toContainText('m');
    });

    test('Route Definition Block - should add waypoints', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Route Definition")');

        // Fill origin/destination
        await page.fill('input[name="origin"]', 'Los Angeles, CA');
        await page.fill('input[name="destination"]', 'Houston, TX');

        // Add waypoint
        await page.click('button:has-text("Add Waypoint")');

        // Fill waypoint
        await page.fill('input[name="waypoint-0"]', 'Phoenix, AZ');

        // Should show waypoint in list
        await expect(page.locator('.waypoint-item:has-text("Phoenix, AZ")')).toBeVisible();
    });

    test('Clearance Obstructions Block - should add measurements', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Clearances & Obstructions")');

        // Add measurement
        await page.click('button:has-text("Add Measurement")');

        // Fill measurement details
        await page.fill('input[name="location-km"]', '45.5');
        await page.selectOption('select[name="type"]', 'overhead_wire');
        await page.fill('input[name="clearance-ft"]', '18');
        await page.fill('input[name="clearance-in"]', '6');

        // Select confidence
        await page.click('label:has-text("High")');

        // Save
        await page.click('button:has-text("Save Measurement")');

        // Should appear in list
        await expect(page.locator('.measurement-item')).toBeVisible();
    });

    test('Bridge List Block - should add bridge with status', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Bridge List")');

        // Add bridge
        await page.click('button:has-text("Add Bridge")');

        // Fill details
        await page.fill('input[name="bridge-name"]', 'Colorado River Bridge');
        await page.fill('input[name="location-km"]', '230.5');
        await page.fill('input[name="vertical-clearance-ft"]', '16');
        await page.fill('input[name="weight-rating-tons"]', '40');

        // Select status
        await page.selectOption('select[name="status"]', 'marginal');

        // Should show warning for marginal status
        await expect(page.locator('.warning-message')).toBeVisible();
    });

    test('Escort Windows Block - should define travel windows', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Escort & Travel Windows")');

        // Select escort level
        await page.selectOption('select[name="escort-level"]', 'pilot');

        // Add travel window
        await page.click('button:has-text("Add Window")');

        // Select days
        await page.check('input[value="monday"]');
        await page.check('input[value="tuesday"]');
        await page.check('input[value="wednesday"]');

        // Set times
        await page.fill('input[name="start-time"]', '08:00');
        await page.fill('input[name="end-time"]', '16:00');

        // Add notes
        await page.fill('textarea[name="notes"]', 'Daylight hours only');

        // Save
        await page.click('button:has-text("Save Window")');

        // Should display in list
        await expect(page.locator('.travel-window-item')).toBeVisible();
    });

    test('Traction & Braking Block - should display performance data', async ({ page }) => {
        // This block is conditional - only appears with engineering data
        // Mock engineering data
        await page.route('**/api/permit-cases/*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.payload_json.transport.performance = {
                braking: {
                    requiredForce_N: 441450,
                    availableForce_N: 529740,
                    safetyFactor: 1.2
                },
                traction: {
                    gradePct: 6.0,
                    requiredForce_N: 92350,
                    availableForce_N: 617294,
                    safetyFactor: 6.68
                }
            };
            await route.fulfill({ body: JSON.stringify(json) });
        });

        await page.reload();

        // Navigate to block
        await page.click('.block-nav-item:has-text("Traction & Braking")');

        // Should show both panels
        await expect(page.locator('.analysis-panel:has-text("Traction")')).toBeVisible();
        await expect(page.locator('.analysis-panel:has-text("Braking")')).toBeVisible();

        // Check safety factors are color-coded
        const safetyFactor = page.locator('.safety-factor').first();
        await expect(safetyFactor).toBeVisible();
    });

    test('Swept Path Block - should display segment analysis', async ({ page }) => {
        // Mock swept path data
        await page.route('**/api/permit-cases/*', async route => {
            const response = await route.fetch();
            const json = await response.json();
            json.payload_json.sweptPath = {
                segments: [
                    {
                        segmentId: 'seg1',
                        segmentName: 'Segment seg1',
                        minClearance_m: 0.25,
                        conflicts: [
                            { type: 'clearance', margin_m: 0.25, severity: 'warn' }
                        ]
                    }
                ]
            };
            await route.fulfill({ body: JSON.stringify(json) });
        });

        await page.reload();

        // Navigate to block
        await page.click('.block-nav-item:has-text("Swept-Path Analysis")');

        // Should show segments list
        await expect(page.locator('.segment-item')).toBeVisible();

        // Should show conflict badge
        await expect(page.locator('.conflict-badge')).toContainText('1 Conflict');

        // Expand map view
        await page.click('button:has-text("Expand Map")');

        // Map should expand
        await expect(page.locator('.map-container.expanded')).toBeVisible();
    });

    test('Evidence Annex Block - should checklist attachments', async ({ page }) => {
        await page.click('.block-nav-item:has-text("Evidence & Attachments")');

        // Check required attachments
        await page.check('input[name="route-map"]');
        await page.check('input[name="dimension-diagram"]');

        // Upload would be tested with file input
        // For now, check UI elements are present
        await expect(page.locator('.attachment-checklist')).toBeVisible();
    });

    test('State Addenda Block - should display per-state requirements', async ({ page }) => {
        await page.click('.block-nav-item:has-text("State Requirements")');

        // Should show state chips (from route)
        await expect(page.locator('.state-chip')).toBeVisible();

        // Each state should have requirements section
        await expect(page.locator('.state-section')).toBeVisible();

        // Should show escort requirements, travel windows, etc.
        await expect(page.locator('.requirement-row')).toBeVisible();
    });
});
