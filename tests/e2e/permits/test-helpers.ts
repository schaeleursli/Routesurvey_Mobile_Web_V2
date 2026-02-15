import { Page } from '@playwright/test';

/**
 * Test Helpers for Permits E2E Tests
 * 
 * Reusable functions for common test operations.
 */

/**
 * Create a test permit case with specified title
 */
export async function createTestCase(page: Page, title: string): Promise<string> {
    await page.goto('/permits/us');
    // Wait for dashboard button to ensure page loaded
    await page.getByText('New Permit Case').waitFor({ state: 'visible' });

    await page.click('button:has-text("New Permit Case")');
    await page.fill('input[name="title"]', title);
    await page.selectOption('select[name="route"]', { index: 1 });
    await page.click('button:has-text("Create Case")');

    await page.waitForURL(/\/permits\/us\/cases\/.+/);

    const url = page.url();
    const caseId = url.match(/cases\/([^/]+)/)?.[1] || '';

    return caseId;
}

/**
 * Fill vehicle dimensions in imperial units
 */
export async function fillVehicleDimensions(
    page: Page,
    dims: { widthFt?: number; widthIn?: number; heightFt?: number; heightIn?: number; lengthFt?: number; weightLbs?: number }
) {
    await page.click('.block-nav-item:has-text("Vehicle & Load")');

    if (dims.widthFt !== undefined) {
        await page.fill('input[name="width-ft"]', dims.widthFt.toString());
    }
    if (dims.widthIn !== undefined) {
        await page.fill('input[name="width-in"]', dims.widthIn.toString());
    }
    if (dims.heightFt !== undefined) {
        await page.fill('input[name="height-ft"]', dims.heightFt.toString());
    }
    if (dims.heightIn !== undefined) {
        await page.fill('input[name="height-in"]', dims.heightIn.toString());
    }
    if (dims.lengthFt !== undefined) {
        await page.fill('input[name="length-ft"]', dims.lengthFt.toString());
    }
    if (dims.weightLbs !== undefined) {
        await page.fill('input[name="weight-lbs"]', dims.weightLbs.toString());
    }

    await page.click('button:has-text("Save")');
}

/**
 * Mock engineering calc jobs
 */
export async function mockCalcJobs(page: Page, jobs: unknown[]) {
    await page.route('**/api/calc-jobs?project=*', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(jobs)
        });
    });
}

/**
 * Link engineering to permit case
 */
export async function linkEngineering(page: Page, calcJobId: string) {
    await page.click('button:has-text("Link Engineering")');
    await page.selectOption('select[name="calc-job"]', calcJobId);
    await page.click('.modal-footer button:has-text("Link")');

    // Wait for modal to close
    await page.waitForSelector('.link-engineering-modal', { state: 'hidden' });
}

/**
 * Navigate to specific block
 */
export async function navigateToBlock(page: Page, blockName: string) {
    await page.click(`.block-nav-item:has-text("${blockName}")`);
    await page.waitForTimeout(300); // Wait for block to render
}

/**
 * Get current permit status
 */
export async function getPermitStatus(page: Page): Promise<string> {
    const statusBadge = page.locator('.status-badge');
    const text = await statusBadge.textContent();
    return text?.toLowerCase().trim() || '';
}

/**
 * Get current readiness score
 */
export async function getReadinessScore(page: Page): Promise<number> {
    const scoreValue = page.locator('.score-value');
    const text = await scoreValue.textContent();
    return Number(text) || 0;
}

/**
 * Mock permit case with specific payload
 */
export async function mockPermitCase(page: Page, caseId: string, payload: unknown, rollup: unknown = {}) {
    await page.route(`**/api/permit-cases/${caseId}`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: caseId,
                title: 'Test Case',
                status: 'draft',
                readiness_score: 100,
                payload_json: payload,
                rollup_json: rollup,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });
    });
}

/**
 * Wait for API call to complete
 */
export async function waitForApiCall(page: Page, urlPattern: string, timeout: number = 5000) {
    return page.waitForResponse(
        response => response.url().includes(urlPattern) && response.status() === 200,
        { timeout }
    );
}

/**
 * Check if engineering is linked
 */
export async function isEngineeringLinked(page: Page): Promise<boolean> {
    const badge = page.locator('.engineering-badge:has-text("Engineering Linked")');
    return await badge.isVisible();
}

/**
 * Add a waypoint to route definition
 */
export async function addWaypoint(page: Page, location: string) {
    await navigateToBlock(page, 'Route Definition');
    await page.click('button:has-text("Add Waypoint")');

    const waypoints = page.locator('input[name^="waypoint-"]');
    const count = await waypoints.count();
    const lastWaypoint = waypoints.nth(count - 1);

    await lastWaypoint.fill(location);
}

/**
 * Add a bridge to bridge list
 */
export async function addBridge(page: Page, bridge: { name: string; locationKm: number; clearanceFt: number; status: string }) {
    await navigateToBlock(page, 'Bridge List');
    await page.click('button:has-text("Add Bridge")');

    await page.fill('input[name="bridge-name"]', bridge.name);
    await page.fill('input[name="location-km"]', bridge.locationKm.toString());
    await page.fill('input[name="vertical-clearance-ft"]', bridge.clearanceFt.toString());
    await page.selectOption('select[name="status"]', bridge.status);

    await page.click('button:has-text("Save")');
}
