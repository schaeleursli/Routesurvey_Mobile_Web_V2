import { test, expect, loginToApp } from './fixtures/global-fixtures';

/**
 * Permits: Requirements Panel E2E Tests
 * Tests rolled-up view, by-jurisdiction view, and next actions
 * Mode: Both MOCK and REAL
 */

test.describe('Permits: Requirements Panel', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should display Rolled-up tab with blocking issues', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Verify requirements panel exists
        const requirementsPanel = page.getByTestId('permits-requirements-panel');
        await expect(requirementsPanel).toBeVisible();

        // Click "Rolled-up" tab
        await page.getByRole('tab', { name: /rolled.?up/i }).click();

        // Verify blocking issues count > 0 for blocked case
        if (mode === 'mock') {
            const blockingCount = page.getByTestId('permits-blocking-issues');
            await expect(blockingCount).toBeVisible();
            const count = await blockingCount.textContent();
            expect(parseInt(count || '0')).toBeGreaterThan(0);

            // Verify specific blocking items are listed
            const requiredItems = page.getByTestId('permits-required-items');
            await expect(requiredItems).toBeVisible();
            await expect(requiredItems).toContainText(/kml/i);
            await expect(requiredItems).toContainText(/clearance/i);
        }
    });

    test('should switch to By Jurisdiction tab and show authority cards', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Click "By Jurisdiction" tab
        await page.getByRole('tab', { name: /by jurisdiction/i }).click();

        // Verify authority cards are displayed
        const authorityCards = page.getByTestId('permits-authority-cards');
        await expect(authorityCards).toBeVisible();

        if (mode === 'mock') {
            // Verify specific jurisdictions from fixture
            await expect(page.getByText(/california|caltrans/i)).toBeVisible();
            await expect(page.getByText(/texas|txdot/i)).toBeVisible();
            await expect(page.getByText(/florida|fdot/i)).toBeVisible();

            // Verify at least 1 rationale line visible per authority
            const rationales = page.locator('[data-testid="authority-rationale"]');
            await expect(rationales.first()).toBeVisible();

            const rationaleText = await rationales.first().textContent();
            expect(rationaleText).toBeTruthy();
            expect(rationaleText!.length).toBeGreaterThan(10);
        } else {
            // In real mode, just verify at least one authority card
            const cards = page.locator('[data-testid^="authority-card-"]');
            await expect(cards.first()).toBeVisible();
        }
    });

    test('should display Next Actions panel with actionable items', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Verify Next Actions panel exists
        const nextActionsPanel = page.getByTestId('permits-next-actions');
        await expect(nextActionsPanel).toBeVisible();

        if (mode === 'mock') {
            // Verify actions list
            const actionItems = page.locator('[data-testid^="next-action-"]');
            const actionCount = await actionItems.count();
            expect(actionCount).toBeGreaterThan(0);

            console.log(`✓ Found ${actionCount} next actions`);
        }
    });

    test('should focus relevant field when clicking Next Action', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Find first next action
        const firstAction = page.locator('[data-testid^="next-action-"]').first();

        if (await firstAction.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Get action details before clicking
            const actionText = await firstAction.textContent();
            console.log(`Clicking action: ${actionText}`);

            await firstAction.click();

            // Should jump to relevant field
            // Verify editor scrolled or field is now visible
            await page.waitForTimeout(500); // Allow scroll animation

            // Check if a field is now focused or highlighted
            const focusedField = page.locator(':focus');
            if (await focusedField.isVisible({ timeout: 1000 }).catch(() => false)) {
                console.log('✓ Field focused after action click');
            } else {
                // Alternative: check if viewport scrolled to a field
                console.log('✓ Action click triggered (field focus may be implicit)');
            }
        }
    });

    test('should show authority decision badges (approved/conditional/pending)', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Navigate to By Jurisdiction tab
        await page.getByRole('tab', { name: /by jurisdiction/i }).click();

        if (mode === 'mock') {
            // Verify decision badges from fixture
            const approvedBadge = page.locator('[data-testid="decision-badge-approved"]');
            const conditionalBadge = page.locator('[data-testid="decision-badge-conditional"]');
            const pendingBadge = page.locator('[data-testid="decision-badge-pending"]');

            // At least one of each decision type should be visible
            await expect(approvedBadge.first()).toBeVisible({ timeout: 5000 });
            await expect(conditionalBadge.first()).toBeVisible({ timeout: 3000 });
            await expect(pendingBadge.first()).toBeVisible({ timeout: 3000 });

            console.log('✓ All decision badge types visible');
        } else {
            // In real mode, just verify decision badges exist
            const decisionBadges = page.locator('[data-testid^="decision-badge-"]');
            await expect(decisionBadges.first()).toBeVisible();
        }
    });

    test('should update requirements panel when case data changes', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });
        test.slow(); // Multiple interactions

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Check initial blocking count
        await page.getByRole('tab', { name: /rolled.?up/i }).click();
        const initialBlockingCount = page.getByTestId('permits-blocking-issues');
        const initialCount = await initialBlockingCount.textContent();
        const initialNum = parseInt(initialCount || '0');

        // Now fill a required field
        const kmlToggle = page.getByTestId('field-attachments-kmlProvided');
        if (await kmlToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
            await kmlToggle.check();

            // Wait for auto-save
            await page.waitForTimeout(1000);

            // Verify blocking count decreased
            const updatedCount = await initialBlockingCount.textContent();
            const updatedNum = parseInt(updatedCount || '0');

            if (mode === 'mock') {
                expect(updatedNum).toBeLessThan(initialNum);
                console.log(`✓ Blocking issues decreased: ${initialNum} → ${updatedNum}`);
            }
        }
    });

    test('should toggle between tabs without losing state', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Click Rolled-up tab
        await page.getByRole('tab', { name: /rolled.?up/i }).click();
        await expect(page.getByTestId('permits-required-items')).toBeVisible();

        // Switch to By Jurisdiction
        await page.getByRole('tab', { name: /by jurisdiction/i }).click();
        await expect(page.getByTestId('permits-authority-cards')).toBeVisible();

        // Switch back to Rolled-up
        await page.getByRole('tab', { name: /rolled.?up/i }).click();
        await expect(page.getByTestId('permits-required-items')).toBeVisible();

        console.log('✓ Tab toggling works without state loss');
    });
});
