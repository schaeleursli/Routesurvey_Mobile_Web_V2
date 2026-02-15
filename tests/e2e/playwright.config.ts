import { defineConfig, devices } from '@playwright/test';

const isSoakTest = process.env.E2E_SOAK === 'true';
const isCI = !!process.env.CI;

/**
 * Comprehensive Playwright configuration for Permits E2E testing
 * Supports both mock (MSW) and real backend modes
 * Optimized for long-running soak tests with full diagnostics
 */
export default defineConfig({
    testDir: './',

    /* Global test timeout */
    timeout: isSoakTest ? 30 * 60 * 1000 : 3 * 60 * 1000, // 30min for soak, 3min normal

    /* Expect timeout */
    expect: {
        timeout: 10 * 1000, // 10s for assertions
    },

    /* Run tests in files in parallel */
    fullyParallel: !isSoakTest, // Sequential for soak tests

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: isCI,

    /* Retry on CI only (never for soak tests) */
    retries: isSoakTest ? 0 : (isCI ? 2 : 0),

    /* Opt out of parallel tests on CI. */
    workers: isSoakTest ? 1 : (isCI ? 1 : undefined),

    /* Reporter configuration */
    reporter: [
        ['list'],
        ['html', {
            open: 'never',
            outputFolder: '../../playwright-report'
        }],
        ['json', {
            outputFile: '../../test-results/results.json'
        }]
    ],

    /* Shared settings for all the projects below */
    use: {
        /* Base URL from environment or default to localhost */
        baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',

        /* Collect trace */
        trace: isSoakTest ? 'on' : 'on-first-retry',

        /* Screenshot settings */
        screenshot: isSoakTest ? 'on' : 'only-on-failure',

        /* Video settings */
        video: isSoakTest ? 'on' : 'retain-on-failure',

        /* Action timeout */
        actionTimeout: 10 * 1000, // 10s

        /* Navigation timeout */
        navigationTimeout: 30 * 1000, // 30s

        /* Ignore HTTPS errors in development */
        ignoreHTTPSErrors: true,

        /* Viewport */
        viewport: { width: 1920, height: 1080 },

        /* User agent (for debugging) */
        userAgent: 'Playwright-E2E-Permits',
    },

    /* Test match patterns */
    testMatch: isSoakTest
        ? '**/permits/**/*.soak.spec.ts'
        : '**/permits/**/*.spec.ts',

    testIgnore: isSoakTest ? [] : ['**/*.soak.spec.ts'],

    /* Output folder for test artifacts */
    outputDir: '../../test-results/',

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Enable console log capture
                launchOptions: {
                    args: ['--disable-dev-shm-usage']
                }
            },
        },

        // Soak tests only run in Chromium
        ...(!isSoakTest ? [
            {
                name: 'firefox',
                use: { ...devices['Desktop Firefox'] },
            },
            {
                name: 'webkit',
                use: { ...devices['Desktop Safari'] },
            },
        ] : []),
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: process.env.E2E_BASE_URL || 'http://localhost:5173',
        reuseExistingServer: !isCI,
        timeout: 120 * 1000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
