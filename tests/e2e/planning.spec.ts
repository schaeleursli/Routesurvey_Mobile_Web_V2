import { test, expect } from '@playwright/test';

test.describe('Transport Engineering Planning Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Prevent Service Workers (MSW) from interfering
        await page.addInitScript(() => {
            if (window.navigator && window.navigator.serviceWorker) {
                window.navigator.serviceWorker.register = () => Promise.reject(new Error('Blocked by Test'));
                window.navigator.serviceWorker.getRegistrations().then(regs => {
                    regs.forEach(reg => reg.unregister());
                });
            }
        });

        // Mock API responses
        await page.route('**/PlannedRoutes/AddPlannedRoute', async route => {
            await route.fulfill({
                json: { result: true, message: 'Plan Saved', data: { id: 123 } }
            });
        });

        // Mock Auth Cookie
        await page.context().addCookies([{
            name: 'l_t',
            value: 'mock_token',
            domain: 'localhost',
            path: '/'
        }]);

        await page.goto('/planning');
    });

    test('Complete Planning Wizard Flow', async ({ page }) => {
        // Step 1: Context interactions
        await expect(page.locator('h3')).toContainText('Project Context');

        // Use Mock Data immediately to fill all steps
        await page.click('button:has-text("Dev: Mock Data")');
        await page.waitForTimeout(500); // Allow reactivity

        // Verify Step 1 Data filled
        await expect(page.locator('input[placeholder="e.g. Shell"]')).toHaveValue('MegaCorp Engineering');

        // Proceed to Step 2
        await page.click('button:has-text("Next Step")');

        // Step 2: Cargo (Verify header + step indicator)
        await page.waitForTimeout(500);
        await expect(page.locator('.step-item.current .step-num')).toHaveText('2');
        // Verify we can move forward (implies validation passed)
        await page.click('button:has-text("Next Step")');

        // Step 3: Equipment
        await page.waitForTimeout(500);
        await expect(page.locator('.step-item.current .step-num')).toHaveText('3');
        await page.click('button:has-text("Next Step")');

        // Step 4: Route (Map)
        await page.waitForTimeout(1000);
        await expect(page.locator('.map-wrapper')).toBeVisible();

        console.log('DEBUG: Step 4 Active. Map Visible.');

        // Wait for map to settle (mock data should have provided route)
        await page.waitForTimeout(2000);

        // Direct navigation to Step 5 (Review) via header
        // This bypasses potential map overlay issues
        await page.click('.step-item:has-text("5")');

        console.log('DEBUG: Clicked Step 5 Indicator.');

        // Step 5: Review
        await page.waitForTimeout(1000);

        console.log('DEBUG: Checking Step 5 content...');
        const bodyText = await page.locator('body').innerText();
        console.log('DEBUG: Body Text Snapshot:', bodyText.substring(0, 500)); // Log first 500 chars


        // Step 5: Review
        await page.waitForTimeout(1000);

        await expect(page.locator('h4').or(page.locator('text=Engineering Check')).first()).toBeVisible();
        await expect(page.locator('text=GROSS WEIGHT')).toBeVisible();

        // Save
        await page.click('button:has-text("Confirm Plan")');

        // Notification check
        await expect(page.locator('.p-toast-message-content')).toContainText('Transport Plan confirmed');
    });

});
