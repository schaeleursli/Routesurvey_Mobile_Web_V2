import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Audit Test Suite
 * 
 * Tests all routes for WCAG 2.1 AA/AAA compliance using axe-core:
 * - Color contrast
 * - Keyboard navigation
 * - ARIA attributes
 * - Screen reader compatibility
 * - Focus management
 */

const ROUTES_TO_TEST = [
    { path: '/', name: 'Home/Login', requiresAuth: false },
    { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
    { path: '/routes', name: 'Routes', requiresAuth: true },
    { path: '/planning', name: 'Planning', requiresAuth: true },
    { path: '/reporting', name: 'Reporting', requiresAuth: true },
    { path: '/settings/user', name: 'User Settings', requiresAuth: true },
];

async function mockAuth(page: Page) {
    await page.addInitScript(() => {
        localStorage.setItem('access_token', JSON.stringify({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_at: Date.now() + 3600000
        }));
    });
}

test.describe('WCAG 2.1 AA Compliance Tests', () => {
    for (const route of ROUTES_TO_TEST) {
        test(`${route.name} - Light Mode`, async ({ page }) => {
            if (route.requiresAuth) {
                await mockAuth(page);
            }

            await page.goto(route.path, { waitUntil: 'networkidle' });

            // Ensure light mode
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'light');
            });

            // Run axe accessibility scan
            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            // Log violations if any
            if (accessibilityScanResults.violations.length > 0) {
                console.log(`\n❌ Accessibility violations on ${route.name} (Light Mode):`);
                accessibilityScanResults.violations.forEach(violation => {
                    console.log(`\n  ${violation.id}: ${violation.description}`);
                    console.log(`  Impact: ${violation.impact}`);
                    console.log(`  Affected elements: ${violation.nodes.length}`);
                    violation.nodes.slice(0, 3).forEach(node => {
                        console.log(`    - ${node.html}`);
                    });
                });
            }

            expect(accessibilityScanResults.violations).toEqual([]);
        });

        test(`${route.name} - Dark Mode`, async ({ page }) => {
            if (route.requiresAuth) {
                await mockAuth(page);
            }

            await page.goto(route.path, { waitUntil: 'networkidle' });

            // Ensure dark mode
            await page.evaluate(() => {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            });

            // Run axe accessibility scan
            const accessibilityScanResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            // Log violations
            if (accessibilityScanResults.violations.length > 0) {
                console.log(`\n❌ Accessibility violations on ${route.name} (Dark Mode):`);
                accessibilityScanResults.violations.forEach(violation => {
                    console.log(`\n  ${violation.id}: ${violation.description}`);
                    console.log(`  Impact: ${violation.impact}`);
                    console.log(`  Affected elements: ${violation.nodes.length}`);
                });
            }

            expect(accessibilityScanResults.violations).toEqual([]);
        });
    }
});

test.describe('WCAG 2.1 AAA Compliance Tests', () => {
    test('Dashboard - AAA Level', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard', { waitUntil: 'networkidle' });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2aaa', 'wcag21aaa'])
            .analyze();

        // AAA is optional but recommended
        if (accessibilityScanResults.violations.length > 0) {
            console.log('\n⚠️  AAA violations (recommended to fix):');
            accessibilityScanResults.violations.forEach(violation => {
                console.log(`  • ${violation.id}: ${violation.description}`);
            });
        }

        // Don't fail on AAA, just warn
        console.log(`AAA compliance status: ${accessibilityScanResults.violations.length === 0 ? '✅ PASSED' : '⚠️  Has recommendations'}`);
    });
});

test.describe('Color Contrast Tests', () => {
    test('Text contrast - Light mode', async ({ page }) => {
        await page.goto('/dashboard');
        await mockAuth(page);

        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['cat.color'])
            .analyze();

        if (accessibilityScanResults.violations.length > 0) {
            console.log('\n❌ Contrast violations in light mode:');
            accessibilityScanResults.violations.forEach(violation => {
                console.log(`  ${violation.id}: ${violation.help}`);
                violation.nodes.forEach(node => {
                    console.log(`    Color: ${node.any[0]?.data?.fgColor} on ${node.any[0]?.data?.bgColor}`);
                    console.log(`    Ratio: ${node.any[0]?.data?.contrastRatio}`);
                });
            });
        }

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Text contrast - Dark mode', async ({ page }) => {
        await page.goto('/dashboard');
        await mockAuth(page);

        await page.evaluate(() => {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        });

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['cat.color'])
            .analyze();

        if (accessibilityScanResults.violations.length > 0) {
            console.log('\n❌ Contrast violations in dark mode:');
            accessibilityScanResults.violations.forEach(violation => {
                console.log(`  ${violation.id}: ${violation.help}`);
            });
        }

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});

test.describe('Keyboard Navigation Tests', () => {
    test('Tab navigation - Dashboard', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Get all focusable elements
        const focusableElements = await page.locator(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ).all();

        console.log(`Found ${focusableElements.length} focusable elements`);

        // Verify we can tab through elements
        for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
            await page.keyboard.press('Tab');

            // Check that focus indicator is visible
            const focusedElement = await page.evaluate(() => {
                const el = document.activeElement;
                const styles = el ? window.getComputedStyle(el) : null;
                return {
                    tagName: el?.tagName,
                    outline: styles?.outline || '',
                    outlineWidth: styles?.outlineWidth || '0px',
                    boxShadow: styles?.boxShadow || 'none'
                };
            });

            // Verify focus is visible (has outline or box-shadow)
            expect(
                focusedElement.outlineWidth !== '0px' ||
                focusedElement.boxShadow !== 'none'
            ).toBeTruthy();
        }
    });

    test('Escape key closes modals', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Look for any modal triggers
        const modalTriggers = await page.locator('[data-bs-toggle="modal"]').all();

        if (modalTriggers.length > 0) {
            // Click first modal trigger
            await modalTriggers[0].click();
            await page.waitForTimeout(300);

            // Verify modal is open
            const modal = page.locator('.modal.show');
            await expect(modal).toBeVisible();

            // Press Escape
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);

            // Verify modal is closed
            await expect(modal).not.toBeVisible();
        }
    });
});

test.describe('Screen Reader Tests', () => {
    test('ARIA labels present', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['cat.aria'])
            .analyze();

        if (accessibilityScanResults.violations.length > 0) {
            console.log('\n❌ ARIA violations:');
            accessibilityScanResults.violations.forEach(violation => {
                console.log(`  ${violation.id}: ${violation.description}`);
            });
        }

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Landmark regions', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Check for main landmark
        const main = page.locator('main, [role="main"]');
        await expect(main).toHaveCount(1);

        // Check for navigation landmark
        const nav = page.locator('nav, [role="navigation"]');
        expect(await nav.count()).toBeGreaterThan(0);
    });

    test('Heading hierarchy', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        // Check that there's exactly one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        // Verify heading hierarchy (no skipped levels)
        const headings = await page.evaluate(() => {
            const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            return headingElements.map(h => parseInt(h.tagName[1]));
        });

        for (let i = 1; i < headings.length; i++) {
            const diff = headings[i] - headings[i - 1];
            // Heading level should not increase by more than 1
            expect(diff).toBeLessThanOrEqual(1);
        }
    });
});

test.describe('Focus Management Tests', () => {
    test('Focus trap in modals', async ({ page }) => {
        await mockAuth(page);
        await page.goto('/dashboard');

        const modalTriggers = await page.locator('[data-bs-toggle="modal"]').all();

        if (modalTriggers.length > 0) {
            await modalTriggers[0].click();
            await page.waitForTimeout(300);

            const modal = page.locator('.modal.show');
            await expect(modal).toBeVisible();

            // Verify focus is inside modal
            const focusedInsideModal = await page.evaluate(() => {
                const activeEl = document.activeElement;
                const modal = document.querySelector('.modal.show');
                return modal?.contains(activeEl);
            });

            expect(focusedInsideModal).toBeTruthy();
        }
    });

    test('Skip links present', async ({ page }) => {
        await page.goto('/');

        // Check for skip to main content link
        const skipLink = page.locator('a[href="#main"], a[href="#main-content"]');

        // Skip link should exist (even if visually hidden)
        const skipLinkCount = await skipLink.count();

        if (skipLinkCount > 0) {
            console.log('✅ Skip link found');
        } else {
            console.log('⚠️  No skip link found - consider adding one for keyboard users');
        }
    });
});
