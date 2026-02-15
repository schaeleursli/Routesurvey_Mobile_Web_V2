import { test, expect } from '@playwright/test';

test.describe('Planning MVP Flow', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Mock Auth Status
        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: true }) });
        });

        // 2. Mock User Data/Subscription
        await page.route('**/api/Users/IsUserTrailExpired/*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: false, remainingDays: 30 }) });
        });
        await page.route('**/api/SubscriptionPlans/GetActiveSubscription', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: { planData: JSON.stringify({ name: 'Pro', features: ['planning'] }) } }) });
        });

        // 3. Set Auth Cookies
        await page.context().addCookies([
            { name: 'l_t', value: 'mock-token', domain: 'localhost', path: '/' },
            { name: 'login_user_id', value: '123', domain: 'localhost', path: '/' },
            { name: 'login_email', value: 'admin@routesurvey.app', domain: 'localhost', path: '/' }
        ]);
    });

    test('User can calculate transport dimensions and data persists after reload', async ({ page }) => {
        // 1. Navigate directly to Transport Engineering
        await page.goto('/transport-engineering');

        // Ensure we are on Transport Engineering
        await expect(page.locator('text=Transport Engineering')).toBeVisible({ timeout: 10000 });

        // 2. Define Sections
        const trailerSection = page.locator('.section-card', { hasText: 'Trailer Configuration' });
        const cargoSection = page.locator('.section-card', { hasText: 'Cargo Configuration' });

        // 3. Enter Trailer Details
        const trailerInput = trailerSection.locator('input[placeholder="e.g. 6-Axle Semi"]');
        await expect(trailerInput).toBeVisible({ timeout: 15000 });
        await trailerInput.fill('Test Trailer A');
        await trailerSection.locator('label:has-text("Tare Weight (kg)") >> .. >> input').fill('15000');
        await trailerSection.locator('label:has-text("Deck Length (m)") >> .. >> input').fill('12.5');
        await trailerSection.locator('label:has-text("Deck Height (m)") >> .. >> input').fill('1.2');
        await trailerSection.locator('label:has-text("Width (m)") >> .. >> input').fill('2.5');

        // 4. Enter Cargo Details
        await cargoSection.locator('input[placeholder="e.g. Transformer Unit A"]').fill('Test Cargo X');
        await cargoSection.locator('label:has-text("Weight (kg)") >> .. >> input').fill('45000');
        await cargoSection.locator('label:has-text("Length (m)") >> .. >> input').fill('8.0');
        await cargoSection.locator('label:has-text("Width (m)") >> .. >> input').fill('3.5');
        await cargoSection.locator('label:has-text("Height (m)") >> .. >> input').fill('3.8');

        // 5. Verify "Calculate" button is enabled and works
        // Go back to Planning View to calculate
        await page.click('button:has-text("Back to Planning")');
        await expect(page.locator('text=Calculated Transport Dimensions')).toBeVisible();

        // Verify data summary in PlanningView header
        await expect(page.locator('text=Test Trailer A')).toBeVisible();
        await expect(page.locator('text=Test Cargo X')).toBeVisible();

        // Click Calculate
        await page.click('button:has-text("Calculate")');

        // Check results
        // Height = 1.2 (deck) + 0 (support) + 3.8 (cargo) = 5.0m
        await expect(page.locator('text=5.00 m')).toBeVisible();
        // Width = max(2.5, 3.5) = 3.5m
        await expect(page.locator('text=3.50 m')).toBeVisible();

        // 6. Test Persistence
        await page.reload();

        // Should still be on Planning page
        // Wait for hydration
        await expect(page.locator('text=Calculated Transport Dimensions')).toBeVisible({ timeout: 10000 });

        // Verify results are still there
        await expect(page.locator('text=5.00 m')).toBeVisible();
        // Verify Name persistence
        await expect(page.locator('text=Test Trailer A')).toBeVisible();
    });
});
