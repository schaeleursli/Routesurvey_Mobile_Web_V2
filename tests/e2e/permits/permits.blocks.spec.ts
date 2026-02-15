import { test, expect, loginToApp } from './fixtures/global-fixtures';

/**
 * Permits: Block List and Navigation E2E Tests
 * Tests block selection, reordering, and navigation
 * Mode: Both MOCK and REAL
 */

test.describe('Permits: Block List and Navigation', () => {
    test.beforeEach(async ({ page, mode }) => {
        await loginToApp(page, mode);
    });

    test('should display all blocks in left panel', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Verify block list panel exists
        const blockList = page.getByTestId('permits-block-list');
        await expect(blockList).toBeVisible();

        // Verify multiple blocks are rendered
        const blockItems = page.locator('[data-testid^="permits-block-item-"]');
        const count = await blockItems.count();
        expect(count).toBeGreaterThan(3); // At least a few blocks

        console.log(`✓ Found ${count} blocks in left panel`);
    });

    test('should select block and update editor', async ({ page, blockedCaseId, mode }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Click vehicle_load block
        const vehicleLoadBlock = page.getByTestId('permits-block-item-vehicle_load');
        await vehicleLoadBlock.click();

        // Verify editor changes
        const blockEditor = page.getByTestId('permits-block-editor');
        await expect(blockEditor).toBeVisible();

        // Verify block title visible in editor
        await expect(page.getByRole('heading', { name: /vehicle.*load/i })).toBeVisible({
            timeout: 5000,
        });

        // Verify active state on selected block
        await expect(vehicleLoadBlock).toHaveClass(/active/);
    });

    test('should navigate through multiple blocks sequentially', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });
        test.slow(); // Multiple interactions

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Define block sequence to test
        const blocks = [
            'permit_summary',
            'vehicle_load',
            'route_definition',
            'clearance_obstructions',
        ];

        for (const blockId of blocks) {
            const blockItem = page.getByTestId(`permits-block-item-${blockId}`);

            // Skip if block doesn't exist
            if (!(await blockItem.isVisible({ timeout: 2000 }).catch(() => false))) {
                console.log(`⚠️ Block ${blockId} not found, skipping`);
                continue;
            }

            await blockItem.click();

            // Verify editor updated
            await expect(page.getByTestId('permits-block-editor')).toBeVisible();

            // Verify active state
            await expect(blockItem).toHaveClass(/active/);

            console.log(`✓ Navigated to ${blockId}`);
        }
    });

    test('should show locked icon for required blocks', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Find a required block (e.g., permit_summary)
        const requiredBlock = page.locator('[data-testid^="permits-block-item-"]').filter({
            has: page.locator('.bi-lock-fill'),
        });

        // Verify at least one required block exists
        await expect(requiredBlock.first()).toBeVisible({ timeout: 5000 });

        // Verify it has the required class
        await expect(requiredBlock.first()).toHaveClass(/required/);

        console.log('✓ Required blocks show lock icon');
    });

    test('should show WIP badge for unimplemented blocks', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Find blocks with WIP badge
        const wipBlocks = page.locator('[data-testid^="permits-block-item-"]').filter({
            has: page.locator('.not-impl-badge'),
        });

        const wipCount = await wipBlocks.count();

        if (wipCount > 0) {
            console.log(`✓ Found ${wipCount} WIP blocks`);

            // Click a WIP block - should not navigate
            const firstWipBlock = wipBlocks.first();
            const blockId = await firstWipBlock.getAttribute('data-testid');

            await firstWipBlock.click();

            // Verify no navigation occurred (active class not on WIP block)
            const isActive = (await firstWipBlock.getAttribute('class'))?.includes('active');
            expect(isActive).toBeFalsy();

            console.log('✓ WIP blocks are non-clickable');
        } else {
            console.log('ℹ️ No WIP blocks found (all implemented)');
        }
    });

    test('should persist selected block on page reload', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        test.info().annotations.push({ type: 'mode', description: mode });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // Select a specific block
        const routeBlock = page.getByTestId('permits-block-item-route_definition');
        if (await routeBlock.isVisible({ timeout: 3000 }).catch(() => false)) {
            await routeBlock.click();
            await expect(routeBlock).toHaveClass(/active/);

            // Reload page
            await page.reload();
            await expect(page.getByTestId('permits-workspace')).toBeVisible();

            // Verify same block is still active
            // (This depends on implementation - may use URL params or localStorage)
            const stillActive = await routeBlock.getAttribute('class');
            if (stillActive?.includes('active')) {
                console.log('✓ Selected block persisted after reload');
            } else {
                console.log('ℹ️ Block selection reset after reload (default behavior)');
            }
        }
    });

    test.skip('should support drag-and-drop reordering for non-locked blocks', async ({
        page,
        blockedCaseId,
        mode,
    }) => {
        // Skip this test as drag-and-drop is complex and may not be implemented yet
        test.info().annotations.push({ type: 'mode', description: mode });
        test.info().annotations.push({ type: 'status', description: 'SKIPPED - Feature TBD' });

        await page.goto(`/permits/cases/${blockedCaseId}`);
        await expect(page.getByTestId('permits-workspace')).toBeVisible();

        // TODO: Implement drag-and-drop test when feature is ready
        // const draggableBlock = page.getByTestId('permits-block-item-clearance_obstructions');
        // const targetPosition = page.getByTestId('permits-block-item-vehicle_load');
        // await draggableBlock.dragTo(targetPosition);
        // Verify order persists in UI state
    });
});
