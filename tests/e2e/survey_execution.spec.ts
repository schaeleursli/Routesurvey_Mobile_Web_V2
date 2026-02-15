import { test, expect } from '@playwright/test';

test.describe('Survey Module Execution', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');
    });

    test('Survey Layout loads correctly', async ({ page }) => {
        await page.route(/.*\/api\/[Rr]outes\/.*/, async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ json: { result: true, data: { id: 'mock', title: 'Layout Test' } } });
            } else {
                await route.continue();
            }
        });

        await page.goto('/routes/mock');
        await expect(page.locator('.survey-layout')).toBeVisible();
    });

    test('Map and List Synchronization', async ({ page }) => {
        await page.route(/.*\/api\/[Rr]outes\/.*/, async route => {
            if (route.request().method() === 'GET') {
                const json = {
                    result: true,
                    data: {
                        id: '123',
                        title: 'Test Survey Route',
                        route_points: [
                            { id: 'start', lat: 0, lng: 0, type: 'route_point', index: 0 },
                            { id: 'p1', lat: 0.01, lng: 0.01, type: 'bridge', notes: 'Bridge 1', index: 1 },
                            { id: 'end', lat: 0.02, lng: 0.02, type: 'route_point', index: 2 }
                        ]
                    }
                };
                await route.fulfill({ json });
            } else {
                await route.continue();
            }
        });

        await page.goto('/routes/123');

        await expect(page.locator('.list-item')).toHaveCount(1);

        console.log('Clicking item...');
        await page.click('.list-item >> text=Bridge');
        console.log('Item clicked.');

        await page.waitForTimeout(1000);

        await expect(page.locator('.observation-editor')).toBeVisible();
    });
});
