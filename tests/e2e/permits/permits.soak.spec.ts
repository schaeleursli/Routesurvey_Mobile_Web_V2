import { test, expect, loginToApp } from './fixtures/global-fixtures';
import * as fs from 'fs';
import * as path from 'path';

/**
 * OVERNIGHT SOAK TEST for Permits Module
 * 
 * Purpose: Long-running stress test to detect memory leaks, UI freezes, 
 * console errors, and navigation failures over extended periods
 * 
 * Run with: npm run test:e2e:permits:soak
 * or: E2E_SOAK=true E2E_SOAK_ITERS=200 npx playwright test tests/e2e/permits/permits.soak.spec.ts
 * 
 * Duration: Configurable (50-200+ iterations), typically 4-8 hours overnight
 * 
 * Outputs:
 * - test-results/soak-summary.json (iteration stats, failures, avg times)
 * - Full traces, videos, screenshots (on failure)
 */

const SOAK_ITERATIONS = parseInt(process.env.E2E_SOAK_ITERS || '100');
const SOAK_DELAY_MS = parseInt(process.env.E2E_SOAK_DELAY || '500'); // Delay between actions

interface SoakStats {
    totalIterations: number;
    successfulIterations: number;
    failedIterations: number;
    consoleErrorCount: number;
    networkFailureCount: number;
    navigationTimes: number[];
    avgNavigationTime: number;
    maxNavigationTime: number;
    minNavigationTime: number;
    failureDetails: Array<{
        iteration: number;
        error: string;
        timestamp: string;
    }>;
    startTime: string;
    endTime: string;
    totalDurationMs: number;
}

test.describe('Permits Soak Test (Overnight)', () => {
    let soakStats: SoakStats;

    test.beforeAll(() => {
        soakStats = {
            totalIterations: SOAK_ITERATIONS,
            successfulIterations: 0,
            failedIterations: 0,
            consoleErrorCount: 0,
            networkFailureCount: 0,
            navigationTimes: [],
            avgNavigationTime: 0,
            maxNavigationTime: 0,
            minNavigationTime: Infinity,
            failureDetails: [],
            startTime: new Date().toISOString(),
            endTime: '',
            totalDurationMs: 0,
        };
    });

    test.afterAll(() => {
        // Calculate final stats
        soakStats.endTime = new Date().toISOString();
        soakStats.totalDurationMs =
            new Date(soakStats.endTime).getTime() - new Date(soakStats.startTime).getTime();

        if (soakStats.navigationTimes.length > 0) {
            soakStats.avgNavigationTime =
                soakStats.navigationTimes.reduce((a, b) => a + b, 0) /
                soakStats.navigationTimes.length;
            soakStats.maxNavigationTime = Math.max(...soakStats.navigationTimes);
            soakStats.minNavigationTime = Math.min(...soakStats.navigationTimes);
        }

        // Write summary to JSON
        const summaryPath = path.join(
            process.cwd(),
            'test-results',
            'soak-summary.json'
        );
        fs.writeFileSync(summaryPath, JSON.stringify(soakStats, null, 2));

        console.log('\n╔═══════════════════════════════════════════════════════════╗');
        console.log('║          SOAK TEST SUMMARY                               ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log(`║ Total Iterations:       ${soakStats.totalIterations.toString().padEnd(30)}║`);
        console.log(`║ Successful:             ${soakStats.successfulIterations.toString().padEnd(30)}║`);
        console.log(`║ Failed:                 ${soakStats.failedIterations.toString().padEnd(30)}║`);
        console.log(`║ Console Errors:         ${soakStats.consoleErrorCount.toString().padEnd(30)}║`);
        console.log(`║ Network Failures:       ${soakStats.networkFailureCount.toString().padEnd(30)}║`);
        console.log(`║ Avg Navigation Time:    ${soakStats.avgNavigationTime.toFixed(0)}ms${' '.repeat(26 - soakStats.avgNavigationTime.toFixed(0).length)}║`);
        console.log(`║ Max Navigation Time:    ${soakStats.maxNavigationTime.toFixed(0)}ms${' '.repeat(26 - soakStats.maxNavigationTime.toFixed(0).length)}║`);
        console.log(`║ Total Duration:         ${(soakStats.totalDurationMs / 1000 / 60).toFixed(1)} minutes${' '.repeat(18 - (soakStats.totalDurationMs / 1000 / 60).toFixed(1).length)}║`);
        console.log('╚═══════════════════════════════════════════════════════════╝\n');
        console.log(`📊 Full report: ${summaryPath}\n`);
    });

    test('should run continuous stress test for permits workflow', async ({
        page,
        projectId,
        blockedCaseId,
        readyCaseId,
        mode,
        consoleLogs,
        consoleErrors,
        networkFailures,
    }) => {
        test.setTimeout(SOAK_ITERATIONS * 60 * 1000); // Dynamic timeout based on iterations
        test.info().annotations.push({ type: 'mode', description: mode });
        test.info().annotations.push({ type: 'iterations', description: SOAK_ITERATIONS.toString() });

        await loginToApp(page, mode);

        const caseIds = [blockedCaseId, readyCaseId];

        for (let i = 1; i <= SOAK_ITERATIONS; i++) {
            const iterationStart = Date.now();

            try {
                console.log(`\n🔄 Soak Iteration ${i}/${SOAK_ITERATIONS}`);

                // Action 1: Navigate to dashboard
                const navStart = Date.now();
                await page.goto(`/projects/${projectId}/permits`);
                await expect(page.getByTestId('permits-dashboard')).toBeVisible({ timeout: 15000 });
                const navTime = Date.now() - navStart;
                soakStats.navigationTimes.push(navTime);
                console.log(`  ✓ Dashboard loaded (${navTime}ms)`);

                // Action 2: Open a random case
                const randomCaseId = caseIds[Math.floor(Math.random() * caseIds.length)];
                await page.goto(`/permits/cases/${randomCaseId}`);
                await expect(page.getByTestId('permits-workspace')).toBeVisible({ timeout: 15000 });
                console.log(`  ✓ Case ${randomCaseId} opened`);

                await page.waitForTimeout(SOAK_DELAY_MS);

                // Action 3: Toggle between blocks randomly
                const blocks = [
                    'permit_summary',
                    'vehicle_load',
                    'route_definition',
                    'clearance_obstructions',
                ];
                const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
                const blockItem = page.getByTestId(`permits-block-item-${randomBlock}`);

                if (await blockItem.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await blockItem.click();
                    await expect(page.getByTestId('permits-block-editor')).toBeVisible();
                    console.log(`  ✓ Block ${randomBlock} selected`);
                }

                await page.waitForTimeout(SOAK_DELAY_MS);

                // Action 4: Toggle requirements tabs randomly
                const tabs = ['rolled-up', 'by-jurisdiction'];
                const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
                const tabRegex = randomTab === 'rolled-up' ? /rolled.?up/i : /by jurisdiction/i;

                const tab = page.getByRole('tab', { name: tabRegex });
                if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await tab.click();
                    console.log(`  ✓ Tab ${randomTab} clicked`);
                }

                await page.waitForTimeout(SOAK_DELAY_MS);

                // Action 5: Edit a random field (if visible)
                const editableFields = await page.locator('input[type="checkbox"]').all();
                if (editableFields.length > 0) {
                    const randomField =
                        editableFields[Math.floor(Math.random() * editableFields.length)];
                    if (await randomField.isVisible({ timeout: 1000 }).catch(() => false)) {
                        const isChecked = await randomField.isChecked();
                        if (isChecked) {
                            await randomField.uncheck();
                        } else {
                            await randomField.check();
                        }
                        console.log(`  ✓ Field toggled`);
                    }
                }

                await page.waitForTimeout(SOAK_DELAY_MS);

                // Action 6: Navigate back to dashboard
                await page.goto(`/projects/${projectId}/permits`);
                await expect(page.getByTestId('permits-dashboard')).toBeVisible({ timeout: 15000 });
                console.log(`  ✓ Returned to dashboard`);

                // Verify no console errors or network failures in this iteration
                const iterationErrors = consoleErrors.length - soakStats.consoleErrorCount;
                const iterationNetworkFailures =
                    networkFailures.length - soakStats.networkFailureCount;

                if (iterationErrors > 0) {
                    console.warn(`  ⚠️ ${iterationErrors} console errors detected`);
                    soakStats.consoleErrorCount += iterationErrors;
                }

                if (iterationNetworkFailures > 0) {
                    console.warn(`  ⚠️ ${iterationNetworkFailures} network failures detected`);
                    soakStats.networkFailureCount += iterationNetworkFailures;
                }

                // Assert UI remains responsive (no timeout exceeded)
                const iterationTime = Date.now() - iterationStart;
                expect(iterationTime).toBeLessThan(60000); // Max 60s per iteration

                soakStats.successfulIterations++;
                console.log(`  ✅ Iteration ${i} complete (${iterationTime}ms)`);
            } catch (error) {
                soakStats.failedIterations++;
                soakStats.failureDetails.push({
                    iteration: i,
                    error: (error as Error).message,
                    timestamp: new Date().toISOString(),
                });

                console.error(`  ❌ Iteration ${i} FAILED: ${(error as Error).message}`);

                // Take screenshot on failure
                const screenshotPath = path.join(
                    process.cwd(),
                    'test-results',
                    `soak-failure-iter${i}.png`
                );
                await page.screenshot({ path: screenshotPath, fullPage: true });

                // Continue to next iteration (don't abort entire soak test)
            }
        }

        // Final assertions
        console.log('\n📊 Soak test complete, analyzing results...\n');

        // Fail the test if too many iterations failed
        const failureRate = soakStats.failedIterations / soakStats.totalIterations;
        expect(failureRate).toBeLessThan(0.05); // Allow max 5% failure rate

        // Fail if too many console errors
        expect(soakStats.consoleErrorCount).toBeLessThan(SOAK_ITERATIONS * 2); // Max 2 errors per iteration

        // Log final success
        console.log('✅ SOAK TEST PASSED');
    });
});
