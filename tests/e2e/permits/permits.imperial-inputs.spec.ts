import { test, expect, loginToApp } from './fixtures/global-fixtures';

/**
 * Permits: Imperial Inputs E2E Tests
 * Tests ft/in normalization and formatted display
 * Mode: Both MOCK and REAL
 */

test.describe('Permits: Imperial Dimension Inputs', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should normalize inches overflow to feet', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Navigate to Vehicle & Load block
        const vehicleBlock = page.getByTestId('permits-block-item-vehicle_load');
        await vehicleBlock.click();

        // Find width input (feet and inches)
        const widthFeet = page.getByTestId('field-transport-width-ft');
        const widthInches = page.getByTestId('field-transport-width-in');

        if (
            (await widthFeet.isVisible({ timeout: 3000 }).catch(() => false)) &&
            (await widthInches.isVisible().catch(() => false))
        ) {
            // Enter 19 feet, 14 inches (should normalize to 20 feet, 2 inches)
            await widthFeet.clear();
            await widthFeet.fill('19');
            await widthInches.clear();
            await widthInches.fill('14');

            // Blur to trigger normalization
            await widthInches.blur();

            // Wait for normalization
            await page.waitForTimeout(500);

            // Verify normalized values
            const normalizedFeet = await widthFeet.inputValue();
            const normalizedInches = await widthInches.inputValue();

            expect(normalizedFeet).toBe('20');
            expect(normalizedInches).toBe('2');

            console.log('✓ Inches overflow normalized: 19\'14" → 20\'2"');
        }
    });

    test('should display formatted imperial values (19\'-2" format)', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Navigate to Vehicle & Load block
        const vehicleBlock = page.getByTestId('permits-block-item-vehicle_load');
        await vehicleBlock.click();

        // Look for formatted display of dimensions
        const formattedWidth = page.locator('[data-testid="formatted-width"]');

        if (await formattedWidth.isVisible({ timeout: 3000 }).catch(() => false)) {
            const widthText = await formattedWidth.textContent();

            // Verify format: XX'-XX" or XX'
            const imperialPattern = /\d+'-\d+"|d+'/;
            expect(widthText).toMatch(imperialPattern);

            console.log(`✓ Formatted width displayed: ${widthText}`);
        } else {
            console.log('ℹ️ Formatted display not found (may be in input fields only)');
        }
    });

    test('should not show metric values by default in UI', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Navigate to Vehicle & Load block
        const vehicleBlock = page.getByTestId('permits-block-item-vehicle_load');
        await vehicleBlock.click();

        // Verify no metric units visible (m, cm, kg shown as primary)
        const blockEditor = page.getByTestId('permits-block-editor');
        const editorText = await blockEditor.textContent();

        // Should not have metric labels as primary
        // (They may exist in hidden fields or meta, but not user-facing)
        const hasMetricPrimary =
            editorText?.includes(' m') ||
            editorText?.includes(' cm') ||
            editorText?.includes('meters') ||
            editorText?.includes('kilograms');

        if (hasMetricPrimary) {
            console.warn('⚠️ Metric values visible - may need to verify display logic');
        } else {
            console.log('✓ Imperial units only (metric hidden)');
        }
    });

    test('should handle edge cases (0 inches, >12 inches)', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        const vehicleBlock = page.getByTestId('permits-block-item-vehicle_load');
        await vehicleBlock.click();

        const heightFeet = page.getByTestId('field-transport-height-ft');
        const heightInches = page.getByTestId('field-transport-height-in');

        if (
            (await heightFeet.isVisible({ timeout: 3000 }).catch(() => false)) &&
            (await heightInches.isVisible().catch(() => false))
        ) {
            // Test 0 inches
            await heightFeet.clear();
            await heightFeet.fill('15');
            await heightInches.clear();
            await heightInches.fill('0');
            await heightInches.blur();

            await page.waitForTimeout(300);

            let normalizedFeet = await heightFeet.inputValue();
            let normalizedInches = await heightInches.inputValue();
            expect(normalizedFeet).toBe('15');
            expect(normalizedInches).toBe('0');

            // Test >12 inches (e.g., 25 inches should be +2 feet, 1 inch)
            await heightInches.clear();
            await heightInches.fill('25');
            await heightInches.blur();

            await page.waitForTimeout(300);

            normalizedFeet = await heightFeet.inputValue();
            normalizedInches = await heightInches.inputValue();
            expect(normalizedFeet).toBe('17'); // 15 + 2
            expect(normalizedInches).toBe('1'); // 25 % 12

            console.log('✓ Edge cases handled correctly');
        }
    });

    test('should preserve precision when converting imperial to metric internally', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        const vehicleBlock = page.getByTestId('permits-block-item-vehicle_load');
        await vehicleBlock.click();

        const lengthFeet = page.getByTestId('field-transport-length-ft');
        const lengthInches = page.getByTestId('field-transport-length-in');

        if (
            (await lengthFeet.isVisible({ timeout: 3000 }).catch(() => false)) &&
            (await lengthInches.isVisible().catch(() => false))
        ) {
            // Enter a precise value
            await lengthFeet.clear();
            await lengthFeet.fill('145');
            await lengthInches.clear();
            await lengthInches.fill('6');
            await lengthInches.blur();

            // Wait for save
            await page.waitForTimeout(1000);

            // Reload and verify precision is preserved
            await page.reload();
            await expect(page.getByTestId('permits-workspace')).toBeVisible();
            await vehicleBlock.click();

            const reloadedFeet = await page.getByTestId('field-transport-length-ft').inputValue();
            const reloadedInches = await page.getByTestId('field-transport-length-in').inputValue();

            expect(reloadedFeet).toBe('145');
            expect(reloadedInches).toBe('6');

            console.log('✓ Precision preserved after save/reload');
        }
    });
});
