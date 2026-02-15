import { test, expect } from '@playwright/test';

test.describe('Share Center Public Access', () => {

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

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err));
    });

    test('Public Report Share Loads Correctly', async ({ page }) => {
        // Mock the API response for getReportRouteShareFromUrl
        // Use a broader glob to catch any variation of baseURL
        await page.route('**/ShareCenter/GetReportRouteShareFromUrl', async route => {
            console.log('Intercepted Request:', route.request().url());
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                json: { // Note: Axios response.data is THIS object.
                    result: true,
                    message: 'Success',
                    // Siblings as expected by controller
                    route: { title: 'Test Route' },
                    reportGeneration: {
                        fileName: 'Test Report.pdf',
                        dateAdded: new Date().toISOString(),
                        filePath: 'reports/test.pdf'
                    },
                    data: { requirePassword: false, id: 'share_123', password: '' },
                    isExpired: false
                }
            });
        });

        // Navigate to a mock share URL
        await page.goto('/share/report?token=test_token_123');

        // Wait a bit for processing
        await page.waitForTimeout(1000);

        // Verify Element Visibility steps
        const bodyText = await page.locator('body').innerText();
        console.log('Page Body Content:', bodyText);

        // Verify Header
        await expect(page.locator('text=Official Record')).toBeVisible();

        // Verify Document Info
        await expect(page.locator('h1')).toContainText('Test Report.pdf');

        // Check PDF Viewer wrapper is present
        await expect(page.locator('.pdf-wrapper')).toBeVisible();
    });

    // ... (Keep other tests minimal or commented if debugging, but I'll leave them)
    test('Password Protected Share Shows Login', async ({ page }) => {
        await page.route('**/ShareCenter/GetReportRouteShareFromUrl', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                json: {
                    result: true,
                    message: 'Success',
                    route: { title: 'Secret Route' },
                    reportGeneration: { fileName: 'Secret.pdf' },
                    data: { requirePassword: true, password: 'secret', id: 'share_456' },
                    isExpired: false
                }
            });
        });
        await page.goto('/share/report?token=protected_token');
        await expect(page.locator('.auth-card')).toBeVisible();
    });

    test('Expired Link Shows Error', async ({ page }) => {
        await page.route('**/ShareCenter/GetReportRouteShareFromUrl', async route => {
            await route.fulfill({
                json: {
                    result: true,
                    message: 'Expired',
                    isExpired: true,
                    data: null,
                    route: null
                }
            });
        });
        await page.goto('/share/report?token=expired_token');
        await expect(page.locator('text=Link Expired')).toBeVisible();
    });
});

