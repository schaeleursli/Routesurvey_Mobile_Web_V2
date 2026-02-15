import { test, expect, Page } from '@playwright/test';

test.describe('Visual Audit: Sidebar & Icons', () => {

    // Login via Form
    test.beforeEach(async ({ page }) => {
        // Go to login page
        await page.goto('/login');

        // Check if already logged in (redirected to dashboard)
        if (page.url().includes('/dashboard')) {
            console.log('Already on dashboard');
        } else {
            // Fill Login Form
            // Selectors based on BaseFormField labels or types
            await page.getByLabel('Email').fill('demo@routesurvey.app');
            await page.getByLabel('Password').fill('demo123');

            // Click Login
            await page.getByRole('button', { name: 'Login' }).click();

            // Wait for navigation
            await page.waitForURL(/\/dashboard|^\/$/, { timeout: 15000 });
        }

        // Force light mode
        await page.evaluate(() => {
            localStorage.setItem('theme', 'light');
            document.documentElement.setAttribute('data-bs-theme', 'light');
        });

        // ensure sidebar is visible
        await expect(page.locator('.sidebar')).toBeVisible({ timeout: 15000 });
    });

    test('Sidebar Expanded State', async ({ page }) => {
        const sidebar = page.locator('.sidebar');

        // Ensure it's expanded (not collapsed)
        await expect(sidebar).not.toHaveClass(/collapsed/);

        // Take screenshot of sidebar
        await sidebar.screenshot({ path: 'tests/e2e/visual-results/sidebar-expanded.png' });

        // Check local nav items alignment
        const navItem = page.locator('.nav-item').first();
        await expect(navItem).toBeVisible();
        await navItem.screenshot({ path: 'tests/e2e/visual-results/nav-item-expanded.png' });
    });

    test('Sidebar Collapsed State', async ({ page }) => {
        const sidebar = page.locator('.sidebar');
        const collapseBtn = page.locator('.collapse-btn');

        // Click collapse button
        await collapseBtn.click();

        // Wait for animation
        await page.waitForTimeout(500);

        // Verify collapsed class
        await expect(sidebar).toHaveClass(/collapsed/);

        // Take screenshot
        await sidebar.screenshot({ path: 'tests/e2e/visual-results/sidebar-collapsed.png' });

        // Check icon centering
        const navItem = page.locator('.nav-item').first();
        await navItem.screenshot({ path: 'tests/e2e/visual-results/nav-item-collapsed.png' });
    });

    test('Active vs Inactive State', async ({ page }) => {
        // Dashboard should be active
        const dashboardLink = page.locator('a.nav-item[href="/dashboard"]');
        await expect(dashboardLink).toHaveClass(/active/);
        await dashboardLink.screenshot({ path: 'tests/e2e/visual-results/nav-item-active.png' });

        // Settings/Other should be inactive
        const planningLink = page.locator('a.nav-item[href="/planning"]');
        await expect(planningLink).not.toHaveClass(/active/);
        await planningLink.screenshot({ path: 'tests/e2e/visual-results/nav-item-inactive.png' });
    });
});
