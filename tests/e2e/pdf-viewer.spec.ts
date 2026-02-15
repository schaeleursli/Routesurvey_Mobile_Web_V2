// pdf-viewer.spec.ts
import { test, expect } from '@playwright/test';

// Helper to generate a dummy base64 PDF URL (small one-page PDF)
function generateDummyPdfBase64() {
    // Minimal PDF binary (1 page) encoded in base64
    const pdfBase64 = 'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sgMyAwIFJdPj4KZW5kb2JqCgozIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNCAwIFI+Pj4+Pi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNSAwIFI+PgplbmRvYmoK';
    return `data:application/pdf;base64,${pdfBase64}`;
}

test.describe('ReportViewer component smoke test', () => {
    test('loads PDF and toolbar actions work', async ({ page }) => {
        // Navigate to a route that renders ReportViewer with a dummy PDF
        const dummyPdf = generateDummyPdfBase64();
        // Assuming a route like /reports/view?url=...&title=Test
        const encodedUrl = encodeURIComponent(btoa(unescape(encodeURIComponent(dummyPdf))));
        await page.goto(`/pdf-viewer?url=${encodedUrl}&title=Test%20Report`);

        // Wait for PDF to load (loading overlay disappears)
        await expect(page.locator('.pdf-loading-overlay')).toBeHidden({ timeout: 5000 });

        // Verify toolbar is present and title is displayed
        await expect(page.locator('.pdf-toolbar .doc-title')).toHaveText('Test Report');

        // Verify first page is rendered
        const firstPage = page.locator('.pdf-page-wrapper', { hasText: '' }).first();
        await expect(firstPage).toBeVisible();

        // Click next page button and verify page number updates
        await page.click('button[title="Next Page"]');
        await expect(page.locator('.page-input')).toHaveValue('2');

        // Zoom in and verify scale style changes
        const container = page.locator('.pdf-pages-container');
        const beforeScale = await container.evaluate(el => getComputedStyle(el).transform);
        await page.click('button[title="Zoom In"]');
        const afterScale = await container.evaluate(el => getComputedStyle(el).transform);
        expect(beforeScale).not.toBe(afterScale);

        // Toggle fullscreen
        await page.click('button[title="Fullscreen"]');
        // Fullscreen change may be async; check class on container
        await expect(page.locator('.pdf-viewer-layout')).toHaveClass(/fullscreen/);

        // Click download button and verify a new tab opens with the PDF URL
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('.download-btn')
        ]);
        const path = await download.path();
        expect(path).toBeTruthy();
    });
});
