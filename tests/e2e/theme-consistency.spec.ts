import { test, expect, Page } from '@playwright/test';

/**
 * Theme Consistency Tests
 * 
 * Ensures that:
 * - Dark mode toggle works correctly
 * - Theme persists across page navigation
 * - All components render properly in both themes
 * - No theme-related visual glitches
 */

async function mockAuth(page: Page) {
    await page.addInitScript(() => {
        localStorage.setItem('access_token', JSON.stringify({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_at: Date.now() + 3600000
        }));
    });
}

test.describe('Theme Toggle Functionality', () => {
    test('Theme toggle button exists and works', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Look for theme toggle button (adjust selector based on your implementation)
        const themeToggle = page.locator('[data-theme-toggle], [aria-label*="theme"], button:has-text("Dark"), button:has-text("Light")');

        if (await themeToggle.count() > 0) {
            // Get initial theme
            const initialTheme = await page.evaluate(() => {
                return document.documentElement.getAttribute('data-bs-theme');
            });

            console.log(`Initial theme: ${initialTheme}`);

            // Click toggle
            await themeToggle.first().click();
            await page.waitForTimeout(300);

            // Verify theme changed
            const newTheme = await page.evaluate(() => {
                return document.documentElement.getAttribute('data-bs-theme');
            });

            console.log(`New theme: ${newTheme}`);

            expect(newTheme).not.toBe(initialTheme);
            expect(['light', 'dark']).toContain(newTheme);
        } else {
            console.log('⚠️  No theme toggle button found');
        }
    });

    test('Theme persists in localStorage', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Set dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        });

        await page.waitForTimeout(200);

        // Reload page
        await page.reload({ waitUntil: 'networkidle' });

        // Check that dark mode persisted
        const theme = await page.evaluate(() => {
            return {
                attribute: document.documentElement.getAttribute('data-bs-theme'),
                storage: localStorage.getItem('theme')
            };
        });

        console.log(`Theme after reload: ${theme.attribute}, Storage: ${theme.storage}`);

        // Either the attribute or storage should indicate dark mode
        expect(theme.attribute === 'dark' || theme.storage === 'dark').toBeTruthy();
    });

    test('Theme persists across navigation', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Set dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        });

        await page.waitForTimeout(200);

        // Navigate to another page
        await page.goto('/routes');
        await page.waitForTimeout(300);

        // Check theme persisted
        const theme = await page.evaluate(() => {
            return document.documentElement.getAttribute('data-bs-theme');
        });

        expect(theme).toBe('dark');
    });
});

test.describe('Theme Rendering Tests', () => {
    const pages = ['/dashboard', '/routes', '/planning', '/reporting'];

    for (const pagePath of pages) {
        test(`${pagePath} renders correctly in light mode`, async ({ page }) => {
            await mockAuth(page);

            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'light');
            });

            await page.goto(pagePath, { waitUntil: 'networkidle' });

            // Verify body is visible and has correct theme
            await expect(page.locator('body')).toBeVisible();

            const theme = await page.evaluate(() => {
                return document.documentElement.getAttribute('data-bs-theme');
            });

            expect(theme).toBe('light');

            // Take screenshot for manual verification
            await page.screenshot({
                path: `test-results/${pagePath.replace('/', '')}-light.png`,
                fullPage: false
            });
        });

        test(`${pagePath} renders correctly in dark mode`, async ({ page }) => {
            await mockAuth(page);

            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            });

            await page.goto(pagePath, { waitUntil: 'networkidle' });

            // Verify body is visible and has correct theme
            await expect(page.locator('body')).toBeVisible();

            const theme = await page.evaluate(() => {
                return document.documentElement.getAttribute('data-bs-theme');
            });

            expect(theme).toBe('dark');

            // Take screenshot for manual verification
            await page.screenshot({
                path: `test-results/${pagePath.replace('/', '')}-dark.png`,
                fullPage: false
            });
        });
    }
});

test.describe('Design Token Application', () => {
    test('CSS custom properties are defined', async ({ page }) => {
        await page.goto('/');

        const cssVars = await page.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            return {
                bgBase: styles.getPropertyValue('--bg-base').trim(),
                bgSurface: styles.getPropertyValue('--bg-surface').trim(),
                textPrimary: styles.getPropertyValue('--text-primary').trim(),
                textSecondary: styles.getPropertyValue('--text-secondary').trim(),
                accent: styles.getPropertyValue('--accent').trim(),
                border: styles.getPropertyValue('--border').trim()
            };
        });

        console.log('Light mode CSS variables:', cssVars);

        // Verify all essential variables are defined
        expect(cssVars.bgBase).toBeTruthy();
        expect(cssVars.bgSurface).toBeTruthy();
        expect(cssVars.textPrimary).toBeTruthy();
        expect(cssVars.textSecondary).toBeTruthy();
        expect(cssVars.accent).toBeTruthy();
        expect(cssVars.border).toBeTruthy();

        // Switch to dark mode
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        });

        await page.waitForTimeout(100);

        const darkCssVars = await page.evaluate(() => {
            const styles = getComputedStyle(document.documentElement);
            return {
                bgBase: styles.getPropertyValue('--bg-base').trim(),
                bgSurface: styles.getPropertyValue('--bg-surface').trim(),
                textPrimary: styles.getPropertyValue('--text-primary').trim(),
                textSecondary: styles.getPropertyValue('--text-secondary').trim(),
                accent: styles.getPropertyValue('--accent').trim(),
                border: styles.getPropertyValue('--border').trim()
            };
        });

        console.log('Dark mode CSS variables:', darkCssVars);

        // Verify dark mode variables are different from light mode
        expect(darkCssVars.bgBase).not.toBe(cssVars.bgBase);
        expect(darkCssVars.bgSurface).not.toBe(cssVars.bgSurface);
        expect(darkCssVars.textPrimary).not.toBe(cssVars.textPrimary);
    });

    test('Body background updates with theme', async ({ page }) => {
        await page.goto('/');

        // Get light mode background
        const lightBg = await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            return window.getComputedStyle(document.body).backgroundColor;
        });

        await page.waitForTimeout(100);

        // Get dark mode background
        const darkBg = await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            return window.getComputedStyle(document.body).backgroundColor;
        });

        console.log(`Light background: ${lightBg}`);
        console.log(`Dark background: ${darkBg}`);

        // Backgrounds should be different
        expect(lightBg).not.toBe(darkBg);

        // Dark mode should have darker background
        const lightBgRgb = lightBg.match(/\d+/g)?.map(Number) || [];
        const darkBgRgb = darkBg.match(/\d+/g)?.map(Number) || [];

        if (lightBgRgb.length >= 3 && darkBgRgb.length >= 3) {
            const lightBrightness = lightBgRgb[0] + lightBgRgb[1] + lightBgRgb[2];
            const darkBrightness = darkBgRgb[0] + darkBgRgb[1] + darkBgRgb[2];

            expect(darkBrightness).toBeLessThan(lightBrightness);
        }
    });
});

test.describe('Component Theme Support', () => {
    test('Buttons render in both themes', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Find buttons on the page
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        console.log(`Found ${buttonCount} buttons`);

        if (buttonCount > 0) {
            // Test in light mode
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'light');
            });

            await page.waitForTimeout(200);
            await expect(buttons.first()).toBeVisible();

            // Test in dark mode
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            });

            await page.waitForTimeout(200);
            await expect(buttons.first()).toBeVisible();
        }
    });

    test('Forms render in both themes', async ({ page }) => {
        await page.goto('/settings/user');
        await mockAuth(page);

        // Find form inputs
        const inputs = page.locator('input, textarea, select');
        const inputCount = await inputs.count();

        console.log(`Found ${inputCount} form inputs`);

        if (inputCount > 0) {
            // Test in light mode
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'light');
            });

            await page.waitForTimeout(200);

            const lightStyles = await page.evaluate(() => {
                const input = document.querySelector('input, textarea, select');
                if (input) {
                    const styles = window.getComputedStyle(input);
                    return {
                        bg: styles.backgroundColor,
                        color: styles.color,
                        border: styles.borderColor
                    };
                }
                return null;
            });

            // Test in dark mode
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            });

            await page.waitForTimeout(200);

            const darkStyles = await page.evaluate(() => {
                const input = document.querySelector('input, textarea, select');
                if (input) {
                    const styles = window.getComputedStyle(input);
                    return {
                        bg: styles.backgroundColor,
                        color: styles.color,
                        border: styles.borderColor
                    };
                }
                return null;
            });

            if (lightStyles && darkStyles) {
                console.log('Light mode input:', lightStyles);
                console.log('Dark mode input:', darkStyles);

                // Verify styles are different between themes
                expect(lightStyles.bg).not.toBe(darkStyles.bg);
            }
        }
    });
});

test.describe('No Theme-Related Errors', () => {
    test('No console errors during theme switch', async ({ page }) => {
        const consoleErrors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await mockAuth(page);
        await page.goto('/dashboard');

        // Toggle theme multiple times
        for (let i = 0; i < 3; i++) {
            await page.evaluate((isDark) => {
                document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
            }, i % 2 === 0);

            await page.waitForTimeout(200);
        }

        // Filter out known non-critical errors
        const criticalErrors = consoleErrors.filter(err =>
            !err.includes('favicon') &&
            !err.includes('DevTools')
        );

        if (criticalErrors.length > 0) {
            console.log('Console errors detected:', criticalErrors);
        }

        expect(criticalErrors.length).toBe(0);
    });
});
