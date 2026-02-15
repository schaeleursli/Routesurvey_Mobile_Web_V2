import { test, expect } from '@playwright/test';

test.describe('Dev Tools: Mock Login', () => {
    test('should allow login with Mock Login button', async ({ page }) => {
        // Capture console logs
        page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));

        // Go to login page
        await page.goto('/login');

        // Check if Mock Login button exists using specific text selector
        const mockBtn = page.getByRole('button').filter({ hasText: 'Mock Login (Dev)' });

        // Explicit wait
        await mockBtn.waitFor({ state: 'visible' });
        await expect(mockBtn).toBeVisible();

        // Click it
        await mockBtn.click();

        // Wait for navigation confirmation
        // Using waitForURL with a regex to match the base URL
        await page.waitForURL(/\/dashboard|^\/$/, { timeout: 10000 });

        // Check if user is logged in (sidebar visible)
        await expect(page.locator('.sidebar')).toBeVisible();

        // Verify cookie "is_mock" is set
        const cookies = await page.context().cookies();
        const isMock = cookies.find(c => c.name === 'is_mock');
        expect(isMock).toBeDefined();
        expect(isMock?.value).toBe('true');
    });
});
