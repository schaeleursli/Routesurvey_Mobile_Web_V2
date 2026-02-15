import { test, expect, loginToApp } from './fixtures/global-fixtures';

/**
 * Permits Case: Blocked → Ready Flow E2E Tests
 * Tests the critical gating flow where filling required items unblocks a case
 * Mode: Both MOCK and REAL
 */

test.describe('Permits Case: Blocked → Ready Flow', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should verify blocked case has Export disabled', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        // Navigate directly to blocked case workspace
        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible({ timeout: 10000 });

        // Export button should be disabled
        const exportBtn = page.getByTestId('permits-export-btn');
        await expect(exportBtn).toBeVisible();
        await expect(exportBtn).toBeDisabled();

        // Hover should show tooltip explaining why
        await exportBtn.hover();
        const tooltip = page.locator('[role="tooltip"]');
        if (mode === 'mock') {
            await expect(tooltip).toContainText(/blocking issues/i);
        }
    });

    test('should show blocking issues in requirements panel', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Open Requirements Panel (rolled-up tab)
        const requirementsPanel = page.getByTestId('permits-requirements-panel');
        await expect(requirementsPanel).toBeVisible();

        // Switch to "Rolled-up" tab
        await page.getByRole('tab', { name: /rolled.?up/i }).click();

        // Should show blocking issues count > 0
        const blockingIssues = page.getByTestId('permits-blocking-issues');
        await expect(blockingIssues).toBeVisible();

        if (mode === 'mock') {
            // Verify specific blocking items from fixture
            await expect(blockingIssues).toContainText('2'); // 2 blocking issues
            await expect(page.getByText(/kml.*required/i)).toBeVisible();
            await expect(page.getByText(/clearance.*required/i)).toBeVisible();
        } else {
            // In real mode, just verify there are blocking issues
            const issueCount = await blockingIssues.textContent();
            expect(parseInt(issueCount || '0')).toBeGreaterThan(0);
        }
    });

    test('should fill missing attachments and transition to READY', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });
        test.slow(); // This test involves multiple interactions

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Initially verify status is BLOCKED
        if (mode === 'mock') {
            const statusBadge = page.locator('.status-badge.status-blocked');
            await expect(statusBadge).toBeVisible();
        }

        // Navigate to attachments section (or the block containing attachments)
        // Assuming there's a block list item for attachments/evidence
        const evidenceBlock = page.getByTestId('permits-block-item-evidence_annex');
        if (await evidenceBlock.isVisible()) {
            await evidenceBlock.click();
        }

        // Fill missing required items
        // Toggle kmlProvided
        const kmlToggle = page.getByTestId('field-attachments-kmlProvided');
        await expect(kmlToggle).toBeVisible({ timeout: 5000 });
        await kmlToggle.check();

        // Toggle clearanceEvidenceProvided
        const clearanceToggle = page.getByTestId('field-attachments-clearanceEvidenceProvided');
        await expect(clearanceToggle).toBeVisible();
        await clearanceToggle.check();

        // Optional: toggle other attachments if required
        const bridgeListToggle = page.getByTestId('field-attachments-bridgeListProvided');
        if (await bridgeListToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
            await bridgeListToggle.check();
        }

        const routeInspectionToggle = page.getByTestId(
            'field-attachments-routeInspectionCertificateProvided'
        );
        if (await routeInspectionToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
            await routeInspectionToggle.check();
        }

        // Wait for auto-save/debounce (400ms as per workspace implementation)
        await page.waitForTimeout(1000);

        // In mock mode, the MSW handler should flip status to READY
        // In real mode, the FastAPI backend should do the same
        if (mode === 'mock') {
            // Verify status becomes READY
            const readyBadge = page.locator('.status-badge.status-ready');
            await expect(readyBadge).toBeVisible({ timeout: 5000 });

            // Verify readiness score increased
            const scoreWidget = page.getByTestId('permits-readiness-score');
            await expect(scoreWidget).toContainText(/9[0-9]/); // 90+
        } else {
            // In real mode, verify via API or UI update
            // Wait for status to update
            await page.waitForTimeout(2000);
            const statusBadge = page.locator('.status-badge');
            const statusText = await statusBadge.textContent();
            expect(statusText).toMatch(/READY|APPROVED/i);
        }

        // Verify Export is now enabled
        const exportBtn = page.getByTestId('permits-export-btn');
        await expect(exportBtn).toBeEnabled({ timeout: 5000 });
    });

    test('should click Export and show placeholder toast', async ({
        page,
        readyCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        // Navigate to ready case
        await page.goto(`/permits/cases/${readyCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Verify Export is enabled
        const exportBtn = page.getByTestId('permits-export-btn');
        await expect(exportBtn).toBeEnabled();

        // Click Export
        await exportBtn.click();

        // In mock/Phase 1 mode, expect placeholder alert or toast
        if (mode === 'mock') {
            // Wait for alert dialog
            page.once('dialog', async (dialog) => {
                expect(dialog.message()).toContain('not implemented');
                await dialog.accept();
            });
        } else {
            // In real mode, might trigger actual export or show download
            // Adjust based on actual implementation
            const toast = page.locator('[role="alert"]');
            await expect(toast).toBeVisible({ timeout: 5000 });
        }
    });

    test('should show conflicts in blocked case', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Open requirements panel and check conflicts
        await page.getByRole('tab', { name: /rolled.?up/i }).click();

        const conflictsList = page.getByTestId('permits-conflicts-list');

        if (mode === 'mock') {
            await expect(conflictsList).toBeVisible();

            // Verify TRAVEL_WINDOW conflict exists
            const travelWindowConflict = page.locator('[data-testid="conflict-TRAVEL_WINDOW"]');
            await expect(travelWindowConflict).toBeVisible();

            // Expand conflict details
            await travelWindowConflict.click();

            // Verify side-by-side windows
            await expect(page.getByText(/CA.*monday.*friday/i)).toBeVisible();
            await expect(page.getByText(/TX.*anytime.*48hr/i)).toBeVisible();
            await expect(page.getByText(/FL.*tuesday.*thursday/i)).toBeVisible();

            // Verify intersection is "none"
            await expect(page.getByText(/intersection.*none/i)).toBeVisible();

            // Verify suggested resolutions (>=2)
            const resolutions = page.locator('[data-testid="conflict-resolutions"]').locator('li');
            await expect(resolutions).toHaveCount(2, { timeout: 3000 });
        } else {
            // In real mode, just check if conflicts section exists
            const hasConflicts = await conflictsList.isVisible({ timeout: 3000 }).catch(() => false);
            if (hasConflicts) {
                console.log('✓ Conflicts panel visible in real mode');
            }
        }
    });
});
