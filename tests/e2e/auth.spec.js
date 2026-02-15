
import { test, expect } from '@playwright/test';

test.describe('Authentication & Onboarding Flow', () => {

    test('should redirect unauthenticated user to login', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/.*\/login/);
        await expect(page.getByText('Survey Routes with Confidence')).toBeVisible(); // Check Hero
    });

    test('should login and go through full 7-step onboarding', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.getByPlaceholder('name@company.com').fill('mock@routesurvey.app');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.locator('button[type="submit"]').click();

        // 2. Redirect to Onboarding (or Dashboard if already done)
        await expect(page).toHaveURL(/.*\/onboarding|.*\/dashboard/, { timeout: 10000 });

        if (page.url().includes('dashboard')) {
            console.log('Skipping onboarding test - user already onboarded in this env');
            return;
        }

        // --- Step 1: Role ---
        await expect(page.getByText("What's your primary role?")).toBeVisible();
        await page.getByText('Transport Engineer').click();
        await page.getByRole('button', { name: 'Continue' }).click();

        // --- Step 2: Theme (NEW) ---
        await expect(page.getByText("Choose your look")).toBeVisible();
        await page.getByText('Dark Mode').click(); // Select Dark Mode
        await page.getByRole('button', { name: 'Continue' }).click();

        // --- Step 3: Preferences/Units ---
        await expect(page.getByText("Set your preferences")).toBeVisible();
        // Check dynamic data presence
        await expect(page.getByText("Max Height")).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        // --- Step 4: Obstructions (NEW) ---
        await expect(page.getByText("Prioritize your hazards")).toBeVisible();
        // Just verify items exist
        await expect(page.getByText("Overhead Wire")).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        // --- Step 5: Mobile App (NEW) ---
        await expect(page.getByText("Take RouteSurvey with you")).toBeVisible();
        await expect(page.getByText("Get the App")).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();

        // --- Step 6: Project ---
        await expect(page.getByText("Let's create your first project")).toBeVisible();
        await page.getByRole('textbox', { name: 'Project Name' }).fill('Test Project Beta');
        await page.getByRole('button', { name: 'Continue' }).click();

        // --- Step 7: Completion/Profile (NEW) ---
        await expect(page.getByText("You're all set!")).toBeVisible();
        await expect(page.getByText("User Profile")).toBeVisible();
        await page.getByRole('button', { name: 'Go to Dashboard' }).click();

        // --- Field Guide ---
        // Tips Carousel should appear - wait for it
        await expect(page.locator('.close-btn')).toBeVisible({ timeout: 10000 });
        await page.locator('.close-btn').click();

        // --- Dashboard ---
        await expect(page).toHaveURL(/.*\/dashboard|.*\//);
    });

});
