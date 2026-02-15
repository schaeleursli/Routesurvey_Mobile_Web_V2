import { test, expect, Page } from '@playwright/test';
import percySnapshot from '@percy/playwright';

/**
 * Visual Regression Testing Suite
 * 
 * Captures screenshots of all critical pages in:
 * - Light and dark modes
 * - Multiple viewport sizes (mobile, tablet, desktop)
 * 
 * Uses Percy for visual diff detection
 */

const THEMES = ['light', 'dark'];

const VIEWPORTS = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
];

const CRITICAL_PAGES = [
    { path: '/', name: 'Home/Login', requiresAuth: false },
    { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
    { path: '/routes', name: 'Routes List', requiresAuth: true },
    { path: '/settings/user', name: 'User Settings', requiresAuth: true },
    { path: '/planning', name: 'Planning View', requiresAuth: true },
    { path: '/reporting', name: 'Reporting', requiresAuth: true },
    // Add more critical pages as needed
];

// Mock authentication for testing
async function mockAuth(page: Page) {
    await page.addInitScript(() => {
        localStorage.setItem('access_token', JSON.stringify({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_at: Date.now() + 3600000
        }));
    });
}

test.describe('Visual Regression Tests', () => {
    // Test each combination of theme, viewport, and page
    for (const theme of THEMES) {
        for (const viewport of VIEWPORTS) {
            test.describe(`${theme} mode - ${viewport.name}`, () => {
                test.beforeEach(async ({ page }) => {
                    await page.setViewportSize(viewport);
                });

                for (const pageConfig of CRITICAL_PAGES) {
                    test(`${pageConfig.name}`, async ({ page }) => {
                        // Mock auth if required
                        if (pageConfig.requiresAuth) {
                            await mockAuth(page);
                        }

                        // Set theme before navigation
                        await page.goto('/');
                        await page.evaluate((themeValue) => {
                            document.documentElement.setAttribute('data-bs-theme', themeValue);
                            localStorage.setItem('theme', themeValue);
                        }, theme);

                        // Navigate to the page
                        try {
                            await page.goto(pageConfig.path, {
                                waitUntil: 'networkidle',
                                timeout: 10000
                            });

                            // Wait for any animations to complete
                            await page.waitForTimeout(500);

                            // Take Percy snapshot
                            await percySnapshot(page, `${pageConfig.name} - ${theme} - ${viewport.name}`, {
                                widths: [viewport.width],
                                minHeight: viewport.height
                            });

                            // Verify page loaded correctly
                            await expect(page.locator('body')).toBeVisible();
                        } catch (error: unknown) {
                            const message = error instanceof Error ? error.message : String(error);
                            console.error(`Failed to test ${pageConfig.name}:`, message);
                            throw error;
                        }
                    });
                }
            });
        }
    }
});

test.describe('Component Visual Tests', () => {
    test('Buttons in all states', async ({ page }) => {
        await page.goto('/');

        // Create a test page with all button states
        await page.evaluate(() => {
            document.body.innerHTML = `
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 20px;">
          <h1>Button States - Light Mode</h1>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary">Primary</button>
            <button class="btn btn-primary" disabled>Primary Disabled</button>
            <button class="btn btn-secondary">Secondary</button>
            <button class="btn btn-secondary" disabled>Secondary Disabled</button>
            <button class="btn btn-success">Success</button>
            <button class="btn btn-warning">Warning</button>
            <button class="btn btn-danger">Danger</button>
          </div>
        </div>
      `;
        });

        await percySnapshot(page, 'Button States - Light');

        // Test dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            const h1 = document.querySelector('h1');
            if (h1) h1.textContent = 'Button States - Dark Mode';
        });

        await percySnapshot(page, 'Button States - Dark');
    });

    test('Form inputs in all states', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            document.body.innerHTML = `
        <div style="padding: 20px; max-width: 600px;">
          <h1>Form Input States - Light Mode</h1>
          <form style="display: flex; flex-direction: column; gap: 15px;">
            <input type="text" class="form-control" placeholder="Normal input">
            <input type="text" class="form-control" value="Filled input" readonly>
            <input type="text" class="form-control is-invalid" value="Invalid input">
            <input type="text" class="form-control is-valid" value="Valid input">
            <input type="text" class="form-control" disabled value="Disabled input">
            <textarea class="form-control" placeholder="Textarea"></textarea>
            <select class="form-select">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </form>
        </div>
      `;
        });

        await percySnapshot(page, 'Form Inputs - Light');

        // Test dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            const h1 = document.querySelector('h1');
            if (h1) h1.textContent = 'Form Input States - Dark Mode';
        });

        await percySnapshot(page, 'Form Inputs - Dark');
    });
});

test.describe('Theme Toggle Visual Tests', () => {
    test('Theme toggle functionality', async ({ page }) => {
        await page.goto('/dashboard');
        await mockAuth(page);

        // Capture light mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        });
        await page.waitForTimeout(300);
        await percySnapshot(page, 'Dashboard - Light Mode');

        // Toggle to dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        });
        await page.waitForTimeout(300);
        await percySnapshot(page, 'Dashboard - Dark Mode');

        // Toggle back to light
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        });
        await page.waitForTimeout(300);
        await percySnapshot(page, 'Dashboard - Back to Light');
    });
});
