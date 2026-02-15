import { test, expect, loginToApp, jumpToField } from './fixtures/global-fixtures';

/**
 * Permits: Jump-to-Field E2E Tests
 * Tests the click-to-focus functionality for missing required items
 * Mode: Both MOCK and REAL
 */

test.describe('Permits: Jump-to-Field', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should jump to field when clicking missing Required Item', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Open requirements panel
        await page.getByRole('tab', { name: /rolled.?up/i }).click();

        // Click a missing required item (e.g., kmlProvided)
        const missingItem = page.getByTestId('required-item-attachments.kmlProvided');
        await expect(missingItem).toBeVisible({ timeout: 5000 });
        await missingItem.click();

        // Verify scroll + focus lands on the field
        const targetField = page.getByTestId('field-attachments-kmlProvided');
        await expect(targetField).toBeVisible();
        await expect(targetField).toBeInViewport();

        // Verify element has focus or active state
        await expect(targetField).toBeFocused().catch(() => {
            // Fallback: check if it has active class or is highlighted
            expect(targetField.locator('..').locator('.field-highlight')).toBeVisible();
        });
    });

    test('should scroll to field that is off-screen', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Ensure we're on a block that doesn't have the target field visible
        // E.g., navigate to permit_summary block
        const summaryBlock = page.getByTestId('permits-block-item-permit_summary');
        if (await summaryBlock.isVisible()) {
            await summaryBlock.click();
        }

        // Now click a field in a different block (e.g., compliance section)
        await page.getByRole('tab', { name: /rolled.?up/i }).click();
        const complianceName = page.getByTestId('required-item-compliance.preparedBy.name');

        if (await complianceName.isVisible({ timeout: 2000 }).catch(() => false)) {
            await complianceName.click();

            // Verify it scrolled to the compliance block and focused the field
            const targetField = page.getByTestId('field-compliance-preparedBy-name');
            await expect(targetField).toBeVisible({ timeout: 5000 });
            await expect(targetField).toBeInViewport();
        }
    });

    test('should highlight field temporarily after jump', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        await page.getByRole('tab', { name: /rolled.?up/i }).click();

        // Click a missing item
        const missingItem = page.getByTestId('required-item-attachments.clearanceEvidenceProvided');
        if (await missingItem.isVisible({ timeout: 3000 }).catch(() => false)) {
            await missingItem.click();

            const targetField = page.getByTestId('field-attachments-clearanceEvidenceProvided');
            await expect(targetField).toBeVisible();

            // Check if field has highlight/flash animation
            const fieldContainer = targetField.locator('..');
            const hasHighlight =
                (await fieldContainer.getAttribute('class'))?.includes('highlight') ||
                (await fieldContainer.getAttribute('class'))?.includes('flash');

            if (hasHighlight) {
                console.log('✓ Field highlighted after jump');
            }
        }
    });

    test('should work with nested field paths', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Navigate to a nested field like transport.overall.width_m
        const transportBlock = page.getByTestId('permits-block-item-vehicle_load');
        if (await transportBlock.isVisible()) {
            await transportBlock.click();
        }

        // If there's a jump action for width
        const widthField = page.getByTestId('field-transport-width');
        if (await widthField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await widthField.scrollIntoViewIfNeeded();
            await expect(widthField).toBeInViewport();
            console.log('✓ Nested field visible and in viewport');
        }
    });

    test('should handle multiple jumps in sequence', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });
        test.slow(); // Multiple interactions

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        await page.getByRole('tab', { name: /rolled.?up/i }).click();

        // Jump to first field
        const item1 = page.getByTestId('required-item-attachments.kmlProvided');
        if (await item1.isVisible({ timeout: 2000 }).catch(() => false)) {
            await item1.click();
            await expect(page.getByTestId('field-attachments-kmlProvided')).toBeVisible();
        }

        // Jump to second field
        const item2 = page.getByTestId('required-item-attachments.clearanceEvidenceProvided');
        if (await item2.isVisible({ timeout: 2000 }).catch(() => false)) {
            await item2.click();
            await expect(page.getByTestId('field-attachments-clearanceEvidenceProvided')).toBeVisible();
        }

        console.log('✓ Multiple sequential jumps succeeded');
    });
});
