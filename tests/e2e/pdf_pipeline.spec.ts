import { test, expect, type Page, type Route } from '@playwright/test';

test.describe('PDF Generation Pipeline', () => {

    // Helper to mock the PDF service response
    const mockPdfResponse = (page: Page) => {
        return page.route('**/api/reports/*/render-pdf', async (route: Route) => {
            // Return a dummy PDF buffer
            const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF');
            await route.fulfill({
                status: 200,
                contentType: 'application/pdf',
                body: pdfBuffer
            });
        });
    };

    test.beforeEach(async ({ page }) => {
        // --- Mock Global Auth & Config ---
        await page.route('**/api/Security/csrf-token', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'mock-csrf-token' }) });
        });

        await page.route('**/api/Auth/status', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isAuthenticated: true }) });
        });

        await page.route('**/api/Config/client', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ features: {} }) });
        });

        // Mock User Data
        await page.route('**/api/Users/GetUserData', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: true,
                    data: { userType: 'Admin', firstName: 'Test', lastName: 'User', email: 'test@example.com' }
                })
            });
        });

        // Set Auth Cookie
        await page.context().addCookies([
            { name: 'l_t', value: 'mock-valid-token', domain: 'localhost', path: '/' },
            { name: 'login_user_id', value: '123', domain: 'localhost', path: '/' }
        ]);

        // Mock specific data endpoints to prevent 500s on page load if accessed
        await page.route('**/api/Users/GetUsers', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify({ result: true, data: [] }) });
        });
    });

    test('Route Report V2 triggers PDF generation', async ({ page }) => {
        // Mock data loading
        await page.route('**/api/routes/*', async route => {
            await route.fulfill({ json: { result: true, data: { id: 'test-route', title: 'Test Route' } } });
        });

        await mockPdfResponse(page);

        // Navigate to Route Report
        // Note: URL might need adjustment based on real routing, assuming /routes/:id/reports/edit or similar
        await page.goto('/routes/test-route/report');

        // Check for Generate PDF action
        const actionsBtn = page.locator('button', { hasText: 'Actions' });
        await actionsBtn.click();

        const generateBtn = page.locator('button', { hasText: 'Generate PDF' });
        await expect(generateBtn).toBeVisible();

        // Click and verify network call
        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/render-pdf') && request.method() === 'POST'
        );

        await generateBtn.click();
        const request = await requestPromise;
        expect(request).toBeTruthy();

        // Verify payload has required fields
        const postData = request.postDataJSON();
        expect(postData.metadata).toBeDefined();
        expect(postData.sections).toBeDefined();
    });

    test('Template Builder triggers Preview PDF', async ({ page }) => {
        await mockPdfResponse(page);

        // Mock Template Creation/Loading
        await page.route('**/api/Templates**', async route => {
            const method = route.request().method();
            if (method === 'POST') {
                // Create
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        result: true,
                        data: { id: 'temp-123', name: 'New Template', snapshot: { sections: [] }, reportType: 'route_assessment', scope: 'global' }
                    })
                });
            } else {
                // Get/List
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        result: true,
                        data: { id: 'temp-123', name: 'New Template', snapshot: { sections: [] }, reportType: 'route_assessment', scope: 'global' }
                    })
                });
            }
        });

        // Mock Template by ID
        await page.route('**/api/Templates/temp-123', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: true,
                    data: { id: 'temp-123', name: 'New Template', snapshot: { sections: [] }, reportType: 'route_assessment', scope: 'global' }
                })
            });
        });

        // Go to Template Builder
        await page.goto('/admin/templates/new'); // or specific ID

        // Check for Preview PDF button
        const previewBtn = page.locator('button', { hasText: 'Preview PDF' });
        await expect(previewBtn).toBeVisible();

        // Click and verify
        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/render-pdf') && request.method() === 'POST'
        );

        await previewBtn.click();
        const request = await requestPromise;
        expect(request).toBeTruthy();

        // Verify it sends snapshot
        const postData = request.postDataJSON();
        expect(postData.snapshot).toBeDefined();
    });

    test('Legacy Report shows deprecation warning', async ({ page }) => {
        await page.goto('/report-legacy/legacy-id');
        await expect(page.locator('.alert-warning')).toContainText('DEPRECATED');
    });

});
