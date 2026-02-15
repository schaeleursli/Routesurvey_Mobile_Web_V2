import { test, expect } from '@playwright/test';

test.describe('Survey Workflow (Redesign)', () => {

    // Mock Data
    const mockPoints = [
        { id: '1', lat: 10, lng: 10, type: 'bridge', address: 'Bridge A', distance_m: 100 },
        { id: '2', lat: 20, lng: 20, type: 'road', address: 'Road Sec B', distance_m: 500 },
        { id: '3', lat: 30, lng: 30, type: 'overhead', address: 'Cable C', distance_m: 1200 }
    ];

    test.beforeEach(async ({ page }) => {
        // Log console errors to help debug
        page.on('console', msg => {
            // Log everything for debugging
            console.log(`BROWSER [${msg.type()}]: "${msg.text()}"`);
        });
        page.on('pageerror', exception => {
            console.log(`BROWSER EXCEPTION: "${exception}"`);
        });

        // Mock Auth check (if needed, usually handled globally in setup or by cookie injection)
        await page.context().addCookies([
            { name: 'l_t', value: 'mock-token', domain: 'localhost', path: '/' }
        ]);

        // Mock Route API response - use regex for case insensitivity (routes vs Routes)
        await page.route(/.*\/api\/[Rr]outes\/.*/, async route => {
            const method = route.request().method();
            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        result: true,
                        data: {
                            id: '201',
                            title: 'Test Survey',
                            pointsData: mockPoints
                        }
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Navigate to survey execution
        await page.goto('/surveys/201/overview');
    });

    test('Loads 3-pane layout correctly', async ({ page }) => {
        // Assert Layout Panes
        await expect(page.locator('.pane-left')).toBeVisible();
        await expect(page.locator('.pane-center')).toBeVisible();
        // Pane right (drawer) is hidden initially
        await expect(page.locator('.pane-right')).toBeHidden();

        // Assert List Content
        await expect(page.locator('.point-list-panel h4')).toContainText('Points');
        // Should find 3 items
        await expect(page.locator('.point-item')).toHaveCount(3);
    });

    test('Navigation opens drawer and updates active state', async ({ page }) => {
        // Click first item
        await page.click('.point-item >> nth=0');

        // Drawer should open
        await expect(page.locator('.pane-right')).toBeVisible();
        await expect(page.locator('.drawer-header h3')).toContainText('Bridge');

        // Map selection logic (checking active marker might differ based on map implementation)
        // Check active class in list
        await expect(page.locator('.point-item >> nth=0')).toHaveClass(/active/);
    });

    test('Keyboard navigation works (J/K)', async ({ page }) => {
        // Select first
        await page.click('.point-item >> nth=0');

        // J -> Next
        await page.keyboard.press('j');
        await expect(page.locator('.drawer-header h3')).toContainText('Road');
        await expect(page.locator('.point-item >> nth=1')).toHaveClass(/active/);

        // K -> Prev
        await page.keyboard.press('k');
        await expect(page.locator('.drawer-header h3')).toContainText('Bridge');
    });

    test('Category and Status workflow', async ({ page }) => {
        // Select first point
        await page.click('.point-item >> nth=0');

        // Initially Draft (stepper inactive/pending)
        // Check Obstruction Toggle
        const obstructionBtn = page.locator('.toggle-option.obstruction');
        const observationBtn = page.locator('.toggle-option.observation');

        // Since type is 'bridge', store might inferred 'obstruction'. 
        // Let's verify if toggle is active.
        // If inferred, obstructionBtn should have class 'active'
        // If logic forces null for new points, we need to click. 
        // Store implementation: `category: p.category || this._inferCategory(p)`
        // `_inferCategory` handles 'bridge' -> 'obstruction'.
        // So it should be pre-selected.
        await expect(obstructionBtn).toHaveClass(/active/);

        // Try Status Workflow
        // Click 'Surveyed'
        await page.click('.step-item:has-text("Surveyed") .step-indicator');
        await expect(page.locator('.step-item:has-text("Surveyed")')).toHaveClass(/completed/);

        // Click 'Reviewed'
        await page.click('.step-item:has-text("Reviewed") .step-indicator');
        await expect(page.locator('.step-item:has-text("Reviewed")')).toHaveClass(/completed/);

        // List badge verification
        await expect(page.locator('.point-item >> nth=0 >> .status-indicator .bi-check-circle')).toBeVisible(); // Reviewed icon class
    });

    test('Validation prevents Surveyed status without Category', async ({ page }) => {
        // Find point 2 (Road - maybe treated as null category by infer logic?)
        // Infer logic: ['bridge', 'powerline'...] -> obstruction. 'road' is NOT in that list in my store implementation (I put bridge, overhead, powerline, intersection, railroad).
        // So 'road' should be Uncategorized (null).

        await page.click('.point-item >> nth=1');

        // Assert category is null (no active toggle)
        await expect(page.locator('.toggle-option.active')).toHaveCount(0);

        // Try click Surveyed - Should be disabled/blocked
        // await page.click('.step-item:has-text("Surveyed") .step-indicator');
        const surveyedBtn = page.locator('.step-item:has-text("Surveyed") .step-indicator');
        await expect(surveyedBtn).toBeDisabled();

        // Should NOT become completed (blocked)
        await expect(page.locator('.step-item:has-text("Surveyed")')).not.toHaveClass(/completed/);

        // Error message might appear (PointDetailDrawer had validationErrors computed but didn't show it explicitly? 
        // Ah, passed to CategoryToggle via prop. Check toggles has error msg.
        // Ah, passed to CategoryToggle via prop. Check toggles has error msg.
        // await expect(page.locator('.error-message')).toBeVisible(); // UI blocks via disabled button, message might be tooltip

        // Fix it: Select Observation
        await page.click('.toggle-option.observation');

        // Now try Surveyed
        await page.click('.step-item:has-text("Surveyed") .step-indicator');
        await expect(page.locator('.step-item:has-text("Surveyed")')).toHaveClass(/completed/);
    });
});
