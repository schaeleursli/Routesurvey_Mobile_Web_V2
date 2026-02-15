import { test, expect } from '@playwright/test';

test.describe('Offline Support & Sync', () => {

    test.beforeEach(async ({ page }) => {
        // --- AUTH SETUP (Copied from smoke.spec.ts) ---
        await page.context().addCookies([
            { name: 'l_t', value: 'mock-token', domain: 'localhost', path: '/' },
            { name: 'login_user_id', value: '123', domain: 'localhost', path: '/' },
            { name: 'login_email', value: 'test@example.com', domain: 'localhost', path: '/' }
        ]);

        // Mock Auth Status
        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: true }) });
        });

        // Mock Config
        await page.route('**/api/Config/client', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ features: {} }) });
        });

        // Mock User Data
        await page.route('**/api/Users/GetUserData**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: true,
                    data: { userType: 'Admin', firstName: 'Test', lastName: 'User' }
                })
            });
        });
    });

    test('should handle route creation attempt when offline', async ({ page }) => {
        // 1. Navigate to Add Page
        await page.goto('/manual-routes/add');

        // Wait for map to be ready
        await expect(page.locator('.leaflet-container')).toBeVisible();

        // 2. Fill Form
        await page.getByPlaceholder(/enter route title/i).fill('Offline Route Test');

        // 3. Add Points (Need 2 points to enable save)
        const map = page.locator('.leaflet-container');
        await map.click({ position: { x: 200, y: 200 } });
        await map.click({ position: { x: 300, y: 300 } });

        // 4. GO OFFLINE
        await page.context().setOffline(true);

        // 5. Attempt to Save
        const saveBtn = page.getByRole('button', { name: /save/i });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        // 6. EXPECTATION (Baseline: Error Message)
        // Since we confirmed no offline logic exists, we expect an Axios error to bubble up to the UI.
        // This might look like a toast or an alert. 
        // We look for generic error text or the lack of redirection.

        // Assert we did NOT redirect (stayed on page)
        await expect(page).toHaveURL(/\/manual-routes\/add/);

        // Assert some error visibility (Optional, depends on how toasts are handled)
        // If the app uses SweetAlert2 (swal2), checking for that:
        // await expect(page.locator('.swal2-popup')).toBeVisible();
    });
});
