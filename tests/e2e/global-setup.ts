import { chromium, FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Global Setup for Playwright
 * Performs authentication once and saves storage state.
 */
export default async function globalSetup(config: FullConfig) {
    console.log('🔒 Starting Global Auth Setup...');

    const { baseURL, storageState } = config.projects[0].use;
    const storageStatePath = storageState as string || 'test-results/storageState.json';

    // Ensure test-results directory exists
    const dir = path.dirname(storageStatePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // 1. Navigate to base URL
        await page.goto(baseURL as string);

        // 2. Perform Login
        // Note: Using the credentials from env or fallback defaults
        const email = process.env.E2E_TEST_EMAIL || 'test@routesurvey.app';
        const password = process.env.E2E_TEST_PASSWORD || 'test-password'; // Adjust if real password differs

        // Check if redirected to login
        if (page.url().includes('/login')) {
            console.log(`   Logging in as ${email}...`);
            await page.getByLabel('Email').fill(email);
            await page.getByLabel('Password').fill(password);
            await page.getByRole('button', { name: 'Sign In' }).click();

            // 3. Wait for authentication to settle
            // Wait for redirect to dashboard OR visible authenticated element
            await Promise.race([
                page.waitForURL('**/', { timeout: 15_000 }),
                page.waitForURL('**/dashboard', { timeout: 15_000 }),
                page.getByTestId('app-shell').waitFor({ state: 'visible', timeout: 15_000 }).catch(() => { })
            ]);

            console.log('   ✅ Login successful (UI flow completed)');
        } else {
            console.log('   ℹ️ Already on authenticated page (or mock mode)');
        }

        // 4. Save state
        await page.context().storageState({ path: storageStatePath });
        console.log(`   💾 Auth state saved to ${storageStatePath}`);

    } catch (error) {
        console.error('   ❌ Global Auth Setup Failed:', error);
        // Don't throw, let tests try (they might fail on auth but we don't want to block everything if auth is optional/mock)
    } finally {
        await browser.close();
    }
}
